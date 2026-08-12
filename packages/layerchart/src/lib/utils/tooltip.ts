import { bisector } from 'd3-array';
import { sortFunc } from '@layerstack/utils';

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
 * Container-relative pixel coordinates of a data point, derived from the chart's own scales.
 *
 * Band scales resolve to the center of the band, and multi-value accessors
 * (ex. `x={['start', 'end']}`) to the midpoint of the scaled values.
 */
export function dataCoords(ctx: TooltipCoordContext, data: any) {
  return {
    x: coordCenter(ctx.xGet(data)) + ctx.padding.left + bandCenterOffset(ctx.xScale),
    y: coordCenter(ctx.yGet(data)) + ctx.padding.top + bandCenterOffset(ctx.yScale),
  };
}
