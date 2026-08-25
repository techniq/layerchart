import { bisector } from 'd3-array';
import type { TimeInterval } from 'd3-time';
import { sortFunc } from '@layerstack/utils';

import { isEqualValue } from './common.js';

import { isScaleBand, type AnyScale } from './scales.svelte.js';
import type { TooltipMode } from '$lib/components/tooltip/TooltipContext.svelte';

/**
 * Strategy for picking between the two data points surrounding a value.
 * - `closest` — whichever of the two is nearer the value
 * - `left` — the data point before the value
 * - `right` — the data point after the value
 */
export type FindTooltipData = 'closest' | 'left' | 'right';

/**
 * The subset of the chart context needed to resolve tooltip data from a domain value.
 * Accepts a full `ChartState`, but typed structurally so it can be used with test fixtures.
 */
export type TooltipDataContext = {
  flatData: any[];
  x: (d: any) => any;
  y: (d: any) => any;
  xScale: AnyScale;
  yScale: AnyScale;
};

/** The subset of the chart context needed to position a data point in pixel space. */
export type TooltipCoordContext = {
  xGet: (d: any) => any;
  yGet: (d: any) => any;
  xScale: AnyScale;
  yScale: AnyScale;
  padding: { top: number; right: number; bottom: number; left: number };
  /** Domain accessors, needed to find the interval a value falls in */
  x?: (d: any) => any;
  y?: (d: any) => any;
  /** Interval giving a non-band scale a band-like width, as `xInterval` / `yInterval` do */
  xInterval?: TimeInterval | null;
  yInterval?: TimeInterval | null;
  /** Present on a real `ChartState`; used to offset into the panel a row belongs to */
  facet?: { enabled: boolean; panels: Array<{ x: number; y: number; has(row: any): boolean }> };
};

/**
 * Value used for bisecting. `x`/`y` accessors can return an array (ex. `x={['start', 'end']}`),
 * in which case the first value is used.
 */
function bisectValue(accessor: (d: any) => any, d: any) {
  const value = accessor(d);
  // Consider using midpoint/average/max instead of the first value
  return Array.isArray(value) ? value[0] : value;
}

/** Pick between the two data points surrounding `value` */
export function pickNearest<T>(
  previousValue: T | undefined,
  currentValue: T | undefined,
  value: any,
  accessor: (d: any) => any,
  find: FindTooltipData = 'closest'
): T | undefined {
  switch (find) {
    case 'closest':
      if (currentValue === undefined) {
        return previousValue;
      } else if (previousValue === undefined) {
        return currentValue;
      } else {
        return Number(value) - Number(accessor(previousValue)) >
          Number(accessor(currentValue)) - Number(value)
          ? currentValue
          : previousValue;
      }
    case 'left':
      return previousValue;
    case 'right':
    default:
      return currentValue;
  }
}

/**
 * Find the data point matching `value` using a binary search.
 *
 * Requires `data` to be sorted by `accessor`.
 */
export function bisectData<T>(
  data: T[],
  accessor: (d: T) => any,
  value: any,
  find: FindTooltipData = 'closest'
): T | undefined {
  const index = bisector((d: T) => bisectValue(accessor, d)).left(data, value, 1);
  return pickNearest(data[index - 1], data[index], value, accessor, find);
}

/**
 * Which axis to bisect on for a given tooltip mode.
 *
 * Modes that resolve by pixel proximity (`quadtree`, `voronoi`, ...) have no value-based
 * equivalent, so they fall back to whichever axis the caller supplied a value for. This is what
 * makes `tooltip.show({ value: { x } })` work on charts using any mode (ex. `LineChart` defaults
 * to `quadtree-x`).
 */
function bisectAxis(mode: TooltipMode | undefined, value: { x?: any; y?: any }) {
  switch (mode) {
    case 'bisect-band':
      return 'band' as const;
    case 'bisect-x':
    case 'quadtree-x':
      return 'x' as const;
    case 'bisect-y':
    case 'quadtree-y':
      return 'y' as const;
    default:
      return value.x != null ? ('x' as const) : ('y' as const);
  }
}

/**
 * Find the data point at the given domain value(s), using the chart's own data and accessors.
 *
 * Unlike pixel-based lookup (quadtree/voronoi), this resolves purely from domain values, so it
 * works across charts with different sizes, padding, and data — the basis for showing a tooltip
 * programmatically or synchronizing tooltips between charts.
 *
 * Requires `ctx.flatData` to be sorted by the bisected accessor.
 */
export function findDatumByValue(
  ctx: TooltipDataContext,
  value: { x?: any; y?: any },
  options: { mode?: TooltipMode; findTooltipData?: FindTooltipData } = {}
) {
  const find = options.findTooltipData ?? 'closest';

  switch (bisectAxis(options.mode, value)) {
    case 'x':
      return bisectData(ctx.flatData, ctx.x, value.x, find);

    case 'y':
      return bisectData(ctx.flatData, ctx.y, value.y, find);

    case 'band': {
      if (isScaleBand(ctx.xScale)) {
        // Find the point closest to `value.y` within the x band
        const bandData = ctx.flatData
          .filter((d) => ctx.x(d) === value.x)
          .sort(sortFunc(ctx.y as () => any)); // sort for bisect
        return bisectData(bandData, ctx.y, value.y, find);
      } else if (isScaleBand(ctx.yScale)) {
        // Find the point closest to `value.x` within the y band
        const bandData = ctx.flatData
          .filter((d) => ctx.y(d) === value.y)
          .sort(sortFunc(ctx.x as () => any)); // sort for bisect
        return bisectData(bandData, ctx.x, value.x, find);
      } else {
        // TODO: Support `bisect-band` without a band scale?  Fallback to bisect?
        return undefined;
      }
    }
  }
}

/** Offset to the center of a band, or `0` for non-band scales */
function bandCenterOffset(scale: AnyScale) {
  return isScaleBand(scale) ? scale.step() / 2 - (scale.padding() * scale.step()) / 2 : 0;
}

/** Midpoint of a scaled value, which can be an array for multi-value accessors */
function coordCenter(value: any) {
  return Array.isArray(value) ? (value[0] + value[value.length - 1]) / 2 : value;
}

/**
 * Center of the span a data point occupies along one axis, in that axis' pixel space.
 *
 * Three ways a value can occupy a span rather than a point, in the order they take precedence:
 * a band scale, a multi-value accessor (ex. `x={['start', 'end']}`), and an interval — which gives
 * a time scale a band-like width, the same span `Rect` draws a bar across. All three place the
 * value at the leading edge, so a tooltip anchored to the raw coordinate sits off to one side.
 */
function axisCenter(
  scale: AnyScale,
  interval: TimeInterval | null | undefined,
  scaled: any,
  value: any
) {
  if (isScaleBand(scale)) return coordCenter(scaled) + bandCenterOffset(scale);
  if (Array.isArray(scaled)) return coordCenter(scaled);

  if (interval && value != null) {
    const start = interval.floor(value);
    // The midpoint of the interval the value falls in, rather than of the value itself — the two
    // differ for data that isn't already on an interval boundary
    return (scale(start) + scale(interval.offset(start))) / 2;
  }

  return coordCenter(scaled);
}

/**
 * Container-relative pixel coordinates of a data point, derived from the chart's own scales.
 *
 * Band scales resolve to the center of the band, and multi-value accessors
 * (ex. `x={['start', 'end']}`) to the midpoint of the scaled values.
 */
export function dataCoords(ctx: TooltipCoordContext, data: any) {
  // The scales are panel-relative, so a row of a faceted chart would otherwise be placed as if it
  // were in the first panel
  const panel = ctx.facet?.enabled ? ctx.facet.panels.find((p) => p.has(data)) : undefined;

  return {
    x: axisCenter(ctx.xScale, ctx.xInterval, ctx.xGet(data), ctx.x?.(data)) + ctx.padding.left + (panel?.x ?? 0), // prettier-ignore
    y: axisCenter(ctx.yScale, ctx.yInterval, ctx.yGet(data), ctx.y?.(data)) + ctx.padding.top + (panel?.y ?? 0), // prettier-ignore
  };
}

/** The subset of the chart context needed to match a row across facet panels */
export type FacetRowContext = {
  x: (d: any) => any;
  y: (d: any) => any;
  /** Which axis carries the value — the *other* one is the position the panels share */
  valueAxis: 'x' | 'y';
};

/**
 * The row in `panel` at the same position as `data`, or `undefined` when it has none there.
 *
 * The facet counterpart of `findDatumByValue`: panels share the position scales, so "the same
 * position" is the same domain value on the category axis — which is how a panel shows *its*
 * value at the spot another panel was hovered.
 *
 * Matches exactly rather than to the nearest, so a panel with nothing at that position shows
 * nothing rather than a value from somewhere else.
 */
export function panelDatum(ctx: FacetRowContext, panel: { data: any[] }, data: any) {
  if (data == null) return undefined;

  const accessor = ctx.valueAxis === 'y' ? ctx.x : ctx.y;
  if (!accessor) return undefined;

  const value = accessor(data);
  return panel.data.find((d) => isEqualValue(accessor(d), value));
}
