import { untrack } from 'svelte';
import { max, min } from 'd3-array';

import type { ChartState } from './chart.svelte.js';
import type { BrushDomainType } from './brush.svelte.js';
import type { DomainType } from '$lib/utils/scales.svelte.js';
import { findDatumByValue } from '$lib/utils/tooltip.js';
import { chartDataArray, isEqualValue } from '$lib/utils/common.js';
import { scaleInvert, type AnyScale } from '$lib/utils/scales.svelte.js';

/** State slices that can be shared between charts in a group */
export type ChartGroupSlice = 'pointer' | 'brush' | 'domain' | 'series';

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

export type ChartGroupBrushOptions = {
  /**
   * Which axes of the selection are shared
   * @default 'x'
   */
  axis?: 'x' | 'y' | 'both';
};

export type ChartGroupDomainOptions = {
  /**
   * Which axes of the visible domain are shared
   * @default 'x'
   */
  axis?: 'x' | 'y' | 'both';
};

export type ChartGroupSeriesOptions = {
  /**
   * Share the highlighted series, ex. hovering a legend item fades the same series everywhere
   * @default true
   */
  highlight?: boolean;

  /**
   * Share which series are visible, ex. toggling a legend item hides the same series everywhere
   * @default true
   */
  visibility?: boolean;
};

export type ChartGroupOptions = {
  /** Share the hovered data point.  Pass `false` to disable. */
  pointer?: ChartGroupPointerOptions | boolean;

  /** Share series highlight and visibility.  Pass `false` to disable. */
  series?: ChartGroupSeriesOptions | boolean;

  /** Share the brush selection.  Pass `false` to disable. */
  brush?: ChartGroupBrushOptions | boolean;

  /**
   * Share the visible domain, so zooming one chart zooms the others.  Pass `false` to disable.
   *
   * Published when a chart zooms to a brush selection (`zoomOnBrush`, the default on simplified
   * charts).  A chart's own `xDomain` / `yDomain` props still win over a shared domain.
   */
  domain?: ChartGroupDomainOptions | boolean;
};

/** The shared visible domain */
export type ChartGroupDomain = {
  /** Visible `x` domain, or `undefined` for the chart's natural extent */
  x: DomainType | undefined;
  /** Visible `y` domain, or `undefined` for the chart's natural extent */
  y: DomainType | undefined;
  /** Whether a domain is currently shared */
  active: boolean;
  /** Identity of the chart that set it */
  source: string | symbol | null;
};

const emptyDomain = (): ChartGroupDomain => ({
  x: undefined,
  y: undefined,
  active: false,
  source: null,
});

/** The shared brush selection, in domain values */
export type ChartGroupBrush = {
  /** Selected `x` extent, or `[null, null]` when there is no selection */
  x: BrushDomainType;
  /** Selected `y` extent, or `[null, null]` when there is no selection */
  y: BrushDomainType;
  /** Whether a selection exists */
  active: boolean;
  /** Identity of the chart that made the selection */
  source: string | symbol | null;
};

const emptyBrush = (): ChartGroupBrush => ({
  x: [null, null],
  y: [null, null],
  active: false,
  source: null,
});

/**
 * The shared series state.
 *
 * Unlike the other slices this carries two independent channels — which series is highlighted, and
 * which are hidden — and so records a source for each.  One shared `source` could not express a
 * chart owning the highlight while another changes visibility.
 */
export type ChartGroupSeries = {
  /** Highlighted series key, or `null` when nothing is highlighted */
  highlightKey: string | null;
  /** Identity of the chart that set the highlight */
  highlightSource: string | symbol | null;
  /**
   * Series keys hidden across the group.  Hidden rather than visible keys, so that a chart only
   * has to speak for the series it actually has — see `setHidden`.
   */
  hiddenKeys: string[];
  /** Identity of the chart that last changed visibility */
  visibilitySource: string | symbol | null;
};

const emptySeries = (): ChartGroupSeries => ({
  highlightKey: null,
  highlightSource: null,
  hiddenKeys: [],
  visibilitySource: null,
});

/** Whether two key lists hold the same keys, regardless of order */
function sameKeys(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((key) => b.includes(key));
}

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

/** Whether two shared domains cover the same extent, from the same source */
function sameDomain(a: ChartGroupDomain, b: ChartGroupDomain) {
  return (
    a.source === b.source &&
    isEqualValue(a.x?.[0], b.x?.[0]) &&
    isEqualValue(a.x?.[1], b.x?.[1]) &&
    isEqualValue(a.y?.[0], b.y?.[0]) &&
    isEqualValue(a.y?.[1], b.y?.[1])
  );
}

/** Whether two selections cover the same extent, from the same source */
function sameSelection(a: ChartGroupBrush, b: ChartGroupBrush) {
  return (
    a.source === b.source &&
    isEqualValue(a.x[0], b.x[0]) &&
    isEqualValue(a.x[1], b.x[1]) &&
    isEqualValue(a.y[0], b.y[0]) &&
    isEqualValue(a.y[1], b.y[1])
  );
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

  /** Shared brush selection.  `$state.raw` for the same reasons as `pointer`. */
  brush = $state.raw<ChartGroupBrush>(emptyBrush());

  /** Shared series highlight and visibility.  `$state.raw` for the same reasons as `pointer`. */
  series = $state.raw<ChartGroupSeries>(emptySeries());

  options: ChartGroupOptions;

  constructor(options: ChartGroupOptions = {}) {
    this.options = options;
  }

  /** Ids of the charts currently joined, to catch two members answering to the same one */
  #memberIds = new Set<string | symbol>();

  /**
   * Join a chart to the group, returning the leave callback.
   *
   * Every slice attributes changes by member id, and a subscriber skips what it published by
   * comparing `source` to its own — so two charts sharing an id both ignore the other's updates
   * and silently stop syncing.  Ids are only user-supplied via `<Chart id>`; the default is a
   * `Symbol`, which can't collide.
   */
  join(id: string | symbol) {
    if (this.#memberIds.has(id)) {
      // `console.warn` rather than `Logger`, which stays silent unless explicitly enabled
      console.warn(
        `[layerchart] Two charts joined a ChartGroup with id "${String(id)}" — they can't be told apart as a pointer/brush source, so updates between them are ignored. Give each chart a unique \`id\`.`
      );
    }
    this.#memberIds.add(id);
    return () => this.#memberIds.delete(id);
  }

  /** Shared visible domain.  `$state.raw` for the same reasons as `pointer`. */
  domain = $state.raw<ChartGroupDomain>(emptyDomain());

  /** Resolved domain options, or `null` when domain sharing is disabled */
  get domainOptions(): Required<ChartGroupDomainOptions> | null {
    const domain = this.options.domain ?? true;
    if (domain === false) return null;
    return { axis: (domain === true ? undefined : domain.axis) ?? 'x' };
  }

  /** Resolved brush options, or `null` when brush sharing is disabled */
  get brushOptions(): Required<ChartGroupBrushOptions> | null {
    const brush = this.options.brush ?? true;
    if (brush === false) return null;
    return { axis: (brush === true ? undefined : brush.axis) ?? 'x' };
  }

  /** Resolved series options, or `null` when series sharing is disabled */
  get seriesOptions(): Required<ChartGroupSeriesOptions> | null {
    const series = this.options.series ?? true;
    if (series === false) return null;
    const options = series === true ? {} : series;
    return {
      highlight: options.highlight ?? true,
      visibility: options.visibility ?? true,
    };
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
   *
   * `clearBrush` / `clearDomain` deliberately do *not* gate this way: those are only reached from
   * an explicit gesture on a chart, never from an idle one, so a clear anywhere clears the group.
   */
  clearPointer(source: string | symbol | null = null) {
    if (!this.pointer.active) return;
    if (source != null && this.pointer.source !== source) return;
    this.pointer = { ...emptyPointer(), source };
  }

  /**
   * Publish a brush selection to the group, in domain values.  No-ops when unchanged.
   *
   * ```ts
   * group.setBrush({ x: [start, end] });
   * ```
   */
  setBrush(brush: Partial<Omit<ChartGroupBrush, 'active'>>) {
    const next = { ...emptyBrush(), ...brush, active: true };
    if (this.brush.active && sameSelection(this.brush, next)) return;
    this.brush = next;
  }

  /**
   * Clear the shared brush selection.
   *
   * Any member may clear it, not just whoever set it — unlike `clearPointer`, a brush is only
   * ever cleared by a deliberate gesture on a chart (click-to-reset), so clearing from one chart
   * is meant to clear the group.  `source` records who did it.
   */
  clearBrush(source: string | symbol | null = null) {
    if (!this.brush.active) return;
    this.brush = { ...emptyBrush(), source };
  }

  /**
   * Highlight a series across the group, ex. from hovering a legend item.  Charts without that
   * series simply have nothing to highlight.
   *
   * ```ts
   * group.setHighlight('revenue');
   * ```
   */
  setHighlight(key: string, source: string | symbol | null = null) {
    if (this.series.highlightKey === key && this.series.highlightSource === source) return;
    this.series = { ...this.series, highlightKey: key, highlightSource: source };
  }

  /**
   * Clear the shared highlight (ex. on pointer leave).
   *
   * Owner-gated like `clearPointer`, and for the same reason: moving between two charts' legends
   * clears one and sets the other in the same tick, and the chart being left must not wipe the
   * highlight belonging to the one being entered.  Pass no `source` to clear regardless of owner.
   */
  clearHighlight(source: string | symbol | null = null) {
    if (this.series.highlightKey == null) return;
    if (source != null && this.series.highlightSource !== source) return;
    this.series = { ...this.series, highlightKey: null, highlightSource: source };
  }

  /**
   * Hide series across the group, ex. from toggling a legend item.  Pass the full set of hidden
   * keys — anything not listed is visible.  No-ops when unchanged.
   *
   * ```ts
   * group.setHidden(['forecast']);
   * ```
   *
   * Hidden keys rather than visible ones, because a chart only speaks for the series it has: a
   * chart showing an unrelated metric contributes nothing here, where publishing *visible* keys
   * would have it repeatedly claim everything else is hidden.
   */
  setHidden(keys: string[], source: string | symbol | null = null) {
    // Unchanged keys leave `visibilitySource` alone rather than re-attributing them, so whoever
    // hid a series stays its owner when another chart merely reports the same set back
    if (sameKeys(this.series.hiddenKeys, keys)) return;
    this.series = { ...this.series, hiddenKeys: keys, visibilitySource: source };
  }

  /**
   * Show every series again.
   *
   * Any member may clear it — see `clearBrush`.
   */
  clearHidden(source: string | symbol | null = null) {
    if (this.series.hiddenKeys.length === 0) return;
    this.series = { ...this.series, hiddenKeys: [], visibilitySource: source };
  }

  /**
   * Publish a visible domain to the group, so other charts zoom to match.
   *
   * ```ts
   * group.setDomain({ x: [start, end] });
   * ```
   */
  setDomain(domain: Partial<Omit<ChartGroupDomain, 'active'>>) {
    const next = { ...emptyDomain(), ...domain, active: true };
    if (this.domain.active && sameDomain(this.domain, next)) return;
    this.domain = next;
  }

  /**
   * Clear the shared domain, returning charts to their natural extent.
   *
   * Any member may clear it — see `clearBrush`.
   */
  clearDomain(source: string | symbol | null = null) {
    if (!this.domain.active) return;
    this.domain = { ...emptyDomain(), source };
  }
}

/**
 * Whether `slice` was opted into by name, rather than merely covered by the default.
 *
 * Sharing a brush *selection* as the group's *domain* has to be asked for: the default is to
 * share everything, and under that default every plain brush would zoom the whole group, which
 * is not what making a selection means.  Naming `'domain'` in `publish` is that request.
 */
function optedInto(option: boolean | ChartGroupSlice[] | undefined, slice: ChartGroupSlice) {
  return Array.isArray(option) && option.includes(slice);
}

/** Whether `slice` is enabled by a `publish` / `subscribe` option */
/**
 * The keys a chart's legend names, which are what its visibility is shared as.
 *
 * Usually the series keys — but a chart whose legend is backed by an ordinal `c` scale names
 * that channel's categories instead, and its lone implicit series names none of them.
 */
function legendKeys(ctx: ChartState<any, any, any>): string[] {
  const rows = chartDataArray(ctx.data);
  const keyedByCategory = rows.length > 0 && ctx.cKey(rows[0]) != null;
  if (keyedByCategory && Array.isArray(ctx.cDomain)) return ctx.cDomain as string[];
  return ctx.series.series.map((s) => s.key);
}

/** Whether a key is currently shown — an empty selection means nothing is hidden */
function shows(ctx: ChartState<any, any, any>, key: string) {
  const selected = ctx.series.selectedKeys;
  return selected.isEmpty() || selected.isSelected(key);
}

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
  $effect(() => getGroup()?.join(ctx.id));

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

  // Publish — the highlighted series.  An event rather than an effect for the same reason as the
  // pointer: moving between two charts' legends clears the one being left and sets the one being
  // entered, so only the interaction itself knows which is which.
  $effect(() => {
    const group = getGroup();
    const seriesOptions = group?.seriesOptions;
    if (!group || !seriesOptions?.highlight) return;
    if (!allows(getMemberOptions()?.publish, 'series')) return;

    const series = ctx.series;

    const publish = () => {
      // Ignore a highlight the group applied — it would echo straight back out
      if (series.highlightSource != null) return;

      const key = series.highlightKey;
      if (key == null) {
        group.clearHighlight(ctx.id);
      } else {
        group.setHighlight(key, ctx.id);
      }
    };

    series.onHighlightChange = publish;

    return () => {
      // Only release our own handler — a re-run may already have installed a newer one
      if (series.onHighlightChange === publish) series.onHighlightChange = undefined;
    };
  });

  // Subscribe — apply the group's highlight to this chart
  $effect(() => {
    const group = getGroup();
    const seriesOptions = group?.seriesOptions;
    if (!group || !seriesOptions?.highlight) return;
    if (!allows(getMemberOptions()?.subscribe, 'series')) return;

    const shared = group.series;
    if (shared.highlightSource === ctx.id) return; // this chart published it

    // `untrack` so reading this chart's own highlight (to skip a redundant write) doesn't make
    // the effect re-run on every local hover
    untrack(() => {
      if (ctx.series.highlightKey === shared.highlightKey) return;
      ctx.series.setHighlight(
        shared.highlightKey,
        // Never `null` — that marks a local highlight, which would publish straight back out.
        // An externally-written highlight is attributed to the group itself.
        shared.highlightSource ?? group.id
      );
    });
  });

  // Publish — which of this chart's series are hidden.  Safe as an effect where the highlight is
  // not: hiding a series is a deliberate toggle, so no two charts are mid-gesture at once.
  $effect(() => {
    const group = getGroup();
    const seriesOptions = group?.seriesOptions;
    if (!group || !seriesOptions?.visibility) return;
    if (!allows(getMemberOptions()?.publish, 'series')) return;

    const keys = legendKeys(ctx);
    const hidden = keys.filter((key) => !shows(ctx, key));

    untrack(() => {
      // Merge rather than replace, so a chart only ever speaks for its own series — see
      // `setHidden`.  Untracked because this effect reacts to *local* visibility; reading the
      // shared set as a dependency would make it re-run on its own write.
      const shared = group.series.hiddenKeys;
      group.setHidden([...shared.filter((key) => !keys.includes(key)), ...hidden], ctx.id);
    });
  });

  // Subscribe — hide the series the group has hidden, ignoring keys this chart doesn't have
  $effect(() => {
    const group = getGroup();
    const seriesOptions = group?.seriesOptions;
    if (!group || !seriesOptions?.visibility) return;
    if (!allows(getMemberOptions()?.subscribe, 'series')) return;

    const shared = group.series;
    if (shared.visibilitySource === ctx.id) return; // this chart published it

    const keys = legendKeys(ctx);
    const visible = keys.filter((key) => !shared.hiddenKeys.includes(key));
    // `SelectionState` reads an empty selection as "everything visible", so only narrow it when
    // something is actually hidden
    const next = visible.length === keys.length ? [] : visible;

    untrack(() => {
      const selectedKeys = ctx.series.selectedKeys;
      // Assigning always produces a new set, waking the publish effect for no reason
      if (sameKeys(selectedKeys.current, next)) return;
      selectedKeys.current = next;
    });
  });

  // Release anything this chart owns when it goes away (or moves to another group).  Without
  // this, a chart unmounted while hovering — a route change, a tab switch, a conditional block —
  // leaves the group holding its pointer forever, and every other chart showing a phantom
  // tooltip.  Worse for the pointer: `clearPointer` only lets the owner clear, so a departed
  // chart would wedge the group with no way back.
  $effect(() => {
    const group = getGroup();
    if (!group) return;

    return () => {
      if (group.pointer.source === ctx.id) group.clearPointer();
      if (group.brush.source === ctx.id) group.clearBrush();
      if (group.domain.source === ctx.id) group.clearDomain();
      if (group.series.highlightSource === ctx.id) group.clearHighlight();
      // Hidden keys are deliberately not released.  They describe series, not the chart that
      // hid them, and other members may still be showing the same ones hidden — unhiding those
      // because an unrelated chart unmounted would be the surprise.
    };
  });

  /** Whether this chart's transform is currently showing a domain the group shared */
  let following = false;

  // Subscribe — apply the group's visible domain to this chart.  Writes plain state that this
  // effect never reads back, so it cannot feed itself; publishing happens from the zoom
  // interaction via `publishDomain` instead.
  $effect(() => {
    const group = getGroup();
    const domainOptions = group?.domainOptions;
    if (!group || !domainOptions) return;
    if (!allows(getMemberOptions()?.subscribe, 'domain')) return;

    const shared = group.domain;
    if (shared.source === ctx.id) return; // this chart published it

    untrack(() => {
      // A zoom this chart performed earlier sits at a higher precedence than the group's domain,
      // so it would pin the chart there forever.  Releasing it makes the most recent interaction
      // win, which is what precedence alone cannot express.
      ctx.brushXDomain = undefined;
      ctx.brushYDomain = undefined;
    });

    // A chart that narrows its domain by `transform` has to be moved *through* it.  Setting a
    // domain alongside would narrow what the transform then scales again, so the two would stack —
    // and clearing the shared domain would drop the chart back to wherever its transform sat.
    if (untrack(() => ctx.transformState?.mode === 'domain')) {
      untrack(() => {
        if (shared.active) {
          following = true;
          ctx.zoomToBrush(
            { x: (shared.x ?? [null, null]) as any, y: (shared.y ?? [null, null]) as any },
            domainOptions.axis
          );
        } else if (following) {
          // Only when a shared domain this chart was following goes away.  Resetting whenever
          // there isn't one would undo the chart's own zoom the moment it published it.
          following = false;
          ctx.transform.reset();
        }
      });
      return;
    }

    ctx.groupXDomain = domainOptions.axis !== 'y' ? (shared.x as BrushDomainType) : undefined;
    ctx.groupYDomain = domainOptions.axis !== 'x' ? (shared.y as BrushDomainType) : undefined;
  });

  /**
   * Publish — a chart the user pans or zooms shares the domain it lands on, the way one zoomed by
   * its brush does.
   *
   * Reads the domain the transform is *settling* toward rather than the animated one: applying a
   * shared domain drives this chart's transform too, and that lands on the same value, so the
   * comparison below ends the exchange rather than trading frames of two animations.
   */
  $effect(() => {
    const group = getGroup();
    const domainOptions = group?.domainOptions;
    if (!group || !domainOptions) return;
    if (!allows(getMemberOptions()?.publish, 'domain')) return;
    if (ctx.transformState?.mode !== 'domain') return;

    const x =
      domainOptions.axis !== 'y' ? (ctx._transformTargetXDomain as BrushDomainType) : undefined;
    const y =
      domainOptions.axis !== 'x' ? (ctx._transformTargetYDomain as BrushDomainType) : undefined;

    untrack(() => {
      const shared = group.domain;

      // Back to the full extent — no shared domain, rather than one covering everything
      if (ctx.transform.targetScale === 1) {
        if (shared.active && shared.source === ctx.id) group.clearDomain(ctx.id);
        return;
      }

      const unchanged =
        isEqualValue(x?.[0], shared.x?.[0]) &&
        isEqualValue(x?.[1], shared.x?.[1]) &&
        isEqualValue(y?.[0], shared.y?.[0]) &&
        isEqualValue(y?.[1], shared.y?.[1]);
      if (unchanged) return;

      group.setDomain({ x, y, source: ctx.id });
    });
  });

  // Subscribe — apply the group's brush selection to this chart.
  //
  // No publish effect is needed: `BrushContext` only fires its `onChange` / `onBrushEnd` events
  // from user gestures, and `Chart` publishes from there (see `enhancedBrushProps`).  Applying a
  // selection here uses `brush.move()` / `brush.reset()`, which write state without firing those
  // events — so an applied selection can't echo back out.
  $effect(() => {
    const group = getGroup();
    const brushOptions = group?.brushOptions;
    // `brushState` only exists when the chart has `brush` enabled
    const brush = ctx.brushState;
    if (!group || !brushOptions || !brush) return;
    if (!allows(getMemberOptions()?.subscribe, 'brush')) return;

    const shared = group.brush;
    if (shared.source === ctx.id) return; // this chart made the selection

    // `untrack` for the same reason `BrushContext` does when syncing external `x`/`y`: `move()`
    // and `reset()` both read `brush.x` / `brush.y` and write them, so tracking their internals
    // would make this effect invalidate itself.
    untrack(() => {
      if (!shared.active) {
        brush.reset();
        return;
      }

      brush.move({
        ...(brushOptions.axis !== 'y' ? { x: shared.x } : null),
        ...(brushOptions.axis !== 'x' ? { y: shared.y } : null),
      });
    });
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

  /**
   * Drop any domain this chart had applied *from* the group.
   *
   * A publisher is skipped by its own subscribe effect, so nothing else would release what it
   * previously applied — leaving it pinned to a domain it has just replaced or cleared.  After
   * publishing, a chart shows its own zoom (via `brushXDomain`) or nothing at all.
   */
  function releaseAppliedDomain() {
    ctx.groupXDomain = undefined;
    ctx.groupYDomain = undefined;
  }

  return {
    /**
     * Share a brush gesture with the group — as a selection, and as the group's visible domain
     * when this chart's `publish` names `'domain'` (an overview driving the others' zoom without
     * zooming itself).
     */
    publishBrush(brush: { x: BrushDomainType; y: BrushDomainType; active?: boolean }) {
      const group = getGroup();
      if (!group) return;
      const publish = getMemberOptions()?.publish;

      if (group.brushOptions && allows(publish, 'brush')) {
        if (brush.active) {
          group.setBrush({ x: brush.x, y: brush.y, source: ctx.id });
        } else {
          group.clearBrush(ctx.id);
        }
      }

      if (group.domainOptions && optedInto(publish, 'domain')) {
        if (brush.active) {
          group.setDomain({ x: brush.x as any, y: brush.y as any, source: ctx.id });
        } else {
          group.clearDomain(ctx.id);
        }
        releaseAppliedDomain();
      }
    },

    /** Share the domain this chart just zoomed to with the group */
    publishDomain(x: BrushDomainType | undefined, y: BrushDomainType | undefined) {
      const group = getGroup();
      if (!group?.domainOptions) return;
      if (!allows(getMemberOptions()?.publish, 'domain')) return;

      if (x == null && y == null) {
        group.clearDomain(ctx.id);
      } else {
        group.setDomain({ x: x as any, y: y as any, source: ctx.id });
      }
      releaseAppliedDomain();
    },
  };
}
