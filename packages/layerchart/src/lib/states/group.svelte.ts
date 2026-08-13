import { max, min } from 'd3-array';

import type { ChartState } from './chart.svelte.js';
import { findDatumByValue } from '$lib/utils/tooltip.js';
import { isEqualValue } from '$lib/utils/common.js';
import { scaleInvert, type AnyScale } from '$lib/utils/scales.svelte.js';

/** State slices that can be shared between charts in a group */
export type ChartGroupSlice = 'pointer';

/**
 * How a published pointer is resolved to a data point on each subscribing chart.
 *
 * - `value` — the nearest data point to the published domain value.  Works across charts with
 *   different data, sizes, and padding, and is the right default for most cases.
 * - `index` — the data point at the same index.  Exact and cheap, but requires the charts' data
 *   to be aligned.
 * - `percent` — the same relative position within the plot area.  For charts whose domains are
 *   unrelated but comparable in shape.
 * - a function — resolve the data point yourself (ex. joining on an id).
 */
export type PointerMatch =
  | 'value'
  | 'index'
  | 'percent'
  | ((pointer: ChartGroupPointer, ctx: ChartState<any, any, any>) => any);

export type ChartGroupPointerOptions = {
  /**
   * How a published pointer is resolved on each subscriber
   * @default 'value'
   */
  match?: PointerMatch;

  /**
   * Which axis the pointer is shared on
   * @default 'x'
   */
  axis?: 'x' | 'y' | 'both';

  /**
   * Show the tooltip on subscribing charts.  Set `false` for a shared highlight without the
   * tooltip content — the chart being hovered still shows its own tooltip.
   * @default true
   */
  tooltip?: boolean;
};

export type ChartGroupOptions = {
  /** Share the hovered data point.  Pass `false` to disable. */
  pointer?: ChartGroupPointerOptions | boolean;
};

/** Per-chart control over which slices a chart publishes to / subscribes from the group */
export type ChartGroupMemberOptions = {
  /**
   * Slices this chart broadcasts to the group.  `false` makes it listen-only (ex. a detail chart
   * driven by an overview).
   * @default true
   */
  publish?: boolean | ChartGroupSlice[];

  /**
   * Slices this chart applies from the group.  `false` makes it broadcast-only (ex. an overview
   * chart that drives others but is not driven by them).
   * @default true
   */
  subscribe?: boolean | ChartGroupSlice[];
};

/** The shared pointer position, published by whichever chart is being interacted with */
export type ChartGroupPointer = {
  /** `x` domain value under the pointer */
  x: any;
  /** `y` domain value under the pointer */
  y: any;
  /** Relative position within the plot area (`0`–`1`), for `match: 'percent'` */
  percent: { x: number; y: number };
  /** Index of the data point within the publishing chart's data, for `match: 'index'` */
  index: number;
  /** The publishing chart's data point */
  data: any;
  /** Whether a pointer is currently active */
  active: boolean;
  /** Identity of the publishing chart, so it can ignore the echo of its own update */
  source: string | symbol | null;
};

const emptyPointer = (): ChartGroupPointer => ({
  x: undefined,
  y: undefined,
  percent: { x: 0, y: 0 },
  index: -1,
  data: null,
  active: false,
  source: null,
});

/**
 * Whether two pointers indicate the same place.  A data point identifies a position on its own,
 * so the values only need comparing when there isn't one — ex. an external caller passing just
 * `x`, where identity alone would treat every update as unchanged.
 */
function samePosition(a: ChartGroupPointer, b: ChartGroupPointer) {
  if (a.source !== b.source) return false;
  return b.data != null ? a.data === b.data : isEqualValue(a.x, b.x) && isEqualValue(a.y, b.y);
}

/**
 * Shared state for a group of charts.
 *
 * Charts join a group by taking a `group` prop, or by being rendered inside `<ChartGroup>`.  The
 * state is a plain object, so anything else can read or write it too — a value readout, a table,
 * a map — without involving a `Chart`.
 *
 * ```svelte
 * <script>
 *   const group = new ChartGroupState({ pointer: { match: 'value' } });
 * </script>
 *
 * <LineChart {data} x="date" y="value" {group} />
 * <BarChart {data} x="date" y="count" {group} />
 * ```
 */
export class ChartGroupState {
  /**
   * Identity of the group itself, used as the `source` for pointers written from outside a chart
   * so subscribers can still tell them apart from their own pointer.
   */
  readonly id: string | symbol = Symbol('ChartGroup');

  /**
   * `$state.raw` rather than `$state` — the pointer is always replaced wholesale, and deep
   * proxying would both wrap consumers' data and break the identity check in `setPointer` (a
   * datum read back out of a proxy is never `===` the one that went in, so the no-op guard
   * would never fire and publishing would loop).
   */
  pointer = $state.raw<ChartGroupPointer>(emptyPointer());

  options: ChartGroupOptions;

  constructor(options: ChartGroupOptions = {}) {
    this.options = options;
  }

  /** Resolved pointer options, or `null` when pointer sharing is disabled */
  get pointerOptions(): Required<ChartGroupPointerOptions> | null {
    const pointer = this.options.pointer ?? true;
    if (pointer === false) return null;
    const options = pointer === true ? {} : pointer;
    return {
      match: options.match ?? 'value',
      axis: options.axis ?? 'x',
      tooltip: options.tooltip ?? true,
    };
  }

  /**
   * Publish a pointer position to the group.  No-ops when the position is unchanged, so repeated
   * publishes of the same point don't wake subscribers.
   *
   * Charts supply every field, but outside callers only need the ones their `match` strategy
   * uses — usually just a domain value:
   *
   * ```ts
   * group.setPointer({ x: someDate });
   * ```
   */
  setPointer(pointer: Partial<Omit<ChartGroupPointer, 'active'>>) {
    const next = { ...emptyPointer(), ...pointer, active: true };
    if (this.pointer.active && samePosition(this.pointer, next)) return;
    this.pointer = next;
  }

  /**
   * Clear the shared pointer (ex. on pointer leave).
   *
   * Only the publisher may clear its own pointer — every chart in the group evaluates whether to
   * publish, and one sitting idle with no tooltip must not wipe the pointer belonging to the chart
   * actually being hovered (which would clear that chart, making it re-publish, and so on).
   * Pass no `source` to clear regardless of owner.
   */
  clearPointer(source: string | symbol | null = null) {
    if (!this.pointer.active) return;
    if (source != null && this.pointer.source !== source) return;
    this.pointer = { ...emptyPointer(), source };
  }
}

/** Whether `slice` is enabled by a `publish` / `subscribe` option */
function allows(option: boolean | ChartGroupSlice[] | undefined, slice: ChartGroupSlice) {
  if (option == null || option === true) return true;
  if (option === false) return false;
  return option.includes(slice);
}

/** Accessor value for a data point, using the first entry of multi-value accessors */
function singleValue(accessor: (d: any) => any, d: any) {
  const value = accessor(d);
  return Array.isArray(value) ? value[0] : value;
}

/** Relative position (`0`–`1`) of a domain value within a scale's range */
function toPercent(scale: AnyScale, range: any[], value: any) {
  const lo = min(range) as number;
  const hi = max(range) as number;
  const px = scale(value);
  return hi === lo || typeof px !== 'number' ? 0 : (px - lo) / (hi - lo);
}

/** Domain value at a relative position (`0`–`1`) within a scale's range */
function fromPercent(scale: AnyScale, range: any[], percent: number) {
  const lo = min(range) as number;
  const hi = max(range) as number;
  return scaleInvert(scale, lo + percent * (hi - lo));
}

/**
 * Resolve a published pointer to a data point on a subscribing chart, using its own data
 * and scales.
 */
export function resolvePointerData(
  pointer: ChartGroupPointer,
  ctx: ChartState<any, any, any>,
  options: Required<ChartGroupPointerOptions>
) {
  const { match, axis } = options;

  if (typeof match === 'function') {
    return match(pointer, ctx);
  }

  if (match === 'index') {
    return pointer.index >= 0 ? ctx.flatData[pointer.index] : undefined;
  }

  const value =
    match === 'percent'
      ? {
          x: axis !== 'y' ? fromPercent(ctx.xScale, ctx.xRange, pointer.percent.x) : undefined,
          y: axis !== 'x' ? fromPercent(ctx.yScale, ctx.yRange, pointer.percent.y) : undefined,
        }
      : {
          x: axis !== 'y' ? pointer.x : undefined,
          y: axis !== 'x' ? pointer.y : undefined,
        };

  return findDatumByValue(ctx, value, { mode: ctx.tooltip.mode });
}

/**
 * Wire a chart to a group — publishing its pointer when interacted with, and applying the group's
 * pointer when another chart publishes one.
 *
 * Must be called during component initialization (it registers `$effect`s).
 */
export function connectToChartGroup(
  ctx: ChartState<any, any, any>,
  getGroup: () => ChartGroupState | undefined,
  getMemberOptions: () => ChartGroupMemberOptions | undefined = () => undefined
) {
  // Publish — driven by the interaction itself rather than by watching state, so the chart the
  // pointer actually moved to is the one that wins.  A tooltip set by the group carries the
  // originating chart's id as its `source`, which the handler filters out.
  $effect(() => {
    const group = getGroup();
    const pointerOptions = group?.pointerOptions;
    // `tooltipState` is bound by `TooltipContext` after this runs, so wait for it
    const tooltip = ctx.tooltipState;
    if (!group || !pointerOptions || !tooltip) return;
    if (!allows(getMemberOptions()?.publish, 'pointer')) return;

    const publish = () => {
      // Ignore changes this chart didn't cause — applying the group's own pointer would
      // otherwise echo straight back out
      if (tooltip.source !== ctx.id) return;

      const data = tooltip.data;

      if (data == null) {
        group.clearPointer(ctx.id);
        return;
      }

      group.setPointer({
        x: singleValue(ctx.x, data),
        y: singleValue(ctx.y, data),
        percent: {
          x: toPercent(ctx.xScale, ctx.xRange, singleValue(ctx.x, data)),
          y: toPercent(ctx.yScale, ctx.yRange, singleValue(ctx.y, data)),
        },
        index: ctx.flatData.indexOf(data),
        data,
        source: ctx.id,
      });
    };

    tooltip.onChange = publish;

    return () => {
      // Only release our own handler — a re-run may already have installed a newer one
      if (tooltip.onChange === publish) tooltip.onChange = undefined;
    };
  });

  // Subscribe — resolve the group's pointer against this chart's own data and scales
  $effect(() => {
    const group = getGroup();
    const pointerOptions = group?.pointerOptions;
    if (!group || !pointerOptions) return;
    if (!allows(getMemberOptions()?.subscribe, 'pointer')) return;

    const pointer = group.pointer;
    if (pointer.source === ctx.id) return; // this chart published it

    if (!pointer.active) {
      ctx.tooltip.hide();
      return;
    }

    const data = resolvePointerData(pointer, ctx, pointerOptions);
    if (data == null) {
      ctx.tooltip.hide();
      return;
    }

    ctx.tooltip.show({
      data,
      // Never the subscriber's own id — a chart treats `source === ctx.id` as its own pointer
      // and would immediately re-publish.  An externally-written pointer (no source) is
      // attributed to the group itself.
      source: pointer.source ?? group.id,
      // `false` shows the `Highlight` without the tooltip content
      suppressed: !pointerOptions.tooltip,
    });
  });
}
