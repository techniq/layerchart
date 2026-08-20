import type { Component } from 'svelte';
import type { SeriesData } from '../components/charts/types.js';
import { group, InternMap } from 'd3-array';
import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { accessor, type Accessor } from '../utils/common.js';
import { SelectionState } from '@layerstack/svelte-state';

/** Key for the single stack of an unfaceted chart */
const STACK_UNGROUPED = '';

/** How a stack accumulates.  `'overlap'` isn't one of these — nothing is stacked there */
export type StackLayout = 'stack' | 'stackExpand' | 'stackDiverging';

/** How multiple series are arranged, before `auto` is resolved — see `ChartState.seriesLayout` */
export type SeriesLayout = StackLayout | 'overlap' | 'group' | 'auto';

export type StackConfig<TData> = {
  layout: StackLayout;
  data?: TData[];
  keyBy: Accessor<TData>;
  valueAccessor?: Accessor<TData>;
  /**
   * Groups the rows into separate stacks — the facet panel each belongs to.
   *
   * Panels share the position scales, so several of them hold the same `keyBy` value; without
   * this the stacks collide and every panel draws whichever row was stacked last.
   */
  groupBy?: (d: TData) => string;
  /**
   * The layer of the stack a row belongs to, when the rows carry their category rather than the
   * columns — long data named by `c`, with no `series` to stack across.
   *
   * Set together with `seriesKeys`, which orders the layers.  Unset for the wide format, where
   * the series keys are the layers.
   */
  seriesBy?: (d: TData) => any;
  /** The layers `seriesBy` can name, bottom first — the `c` domain */
  seriesKeys?: any[];
};

export class SeriesState<TData, TComponent extends Component> {
  // Getter functions — set once in constructor, called lazily by $derived
  private _getSeries!: () => SeriesData<TData, TComponent>[];
  private _getStackConfig!: () => StackConfig<TData> | null;

  #series = $derived(this._getSeries());
  #stackConfig = $derived(this._getStackConfig());

  selectedKeys: SelectionState<string>;

  #highlightKey = $state<SeriesData<TData, TComponent>['key'] | null>(null);

  /**
   * The current highlight series key for the chart.
   */
  get highlightKey() {
    return this.#highlightKey;
  }
  set highlightKey(key: SeriesData<TData, TComponent>['key'] | null) {
    this.setHighlight(key);
  }

  /**
   * Identity of whatever set the current highlight — `null` for this chart's own interaction, and
   * the id of the publishing chart (or group) when a chart group applied it.
   *
   * Compare against `null` to tell the two apart, which is what keeps an applied highlight from
   * echoing straight back out of the group.
   */
  highlightSource = $state<string | symbol | null>(null);

  /**
   * Set the highlighted series, recording what drove it.  Assigning to `highlightKey` is the same
   * thing with no `source`, meaning this chart's own interaction.
   */
  setHighlight(
    key: SeriesData<TData, TComponent>['key'] | null,
    source: string | symbol | null = null
  ) {
    // The implicit `default` series names nothing to tell apart, so highlighting it reads as no
    // highlight at all.  A chart keyed by `c` instead holds those keys here — fading every mark
    // against `default`, which none of them carry, is what this avoids.
    this.#highlightKey =
      this.isDefaultSeries && this.#series.some((s) => s.key === key) ? null : key;
    this.highlightSource = source;
    this.onHighlightChange?.();
  }

  /**
   * Called whenever the highlight is set, whatever drove it — including re-asserting the key
   * already highlighted.  Check `highlightSource` to tell this chart's own interaction
   * (`source === null`) from a group or other caller.
   *
   * This is a notification rather than something to derive from state, for the same reason as
   * `TooltipState.onChange`: moving between two charts' legends clears the one being left and sets
   * the one being entered, so both briefly hold a local highlight and state alone cannot say which
   * one the pointer actually moved to.
   *
   * Note this is a single handler, not a subscriber list — assigning to it replaces whatever was
   * there, including a chart group's.
   */
  onHighlightChange?: () => void;

  constructor(
    getSeries: () => SeriesData<TData, TComponent>[],
    getStackConfig?: () => StackConfig<TData> | null
  ) {
    this._getSeries = getSeries;
    this._getStackConfig = getStackConfig ?? (() => null);

    // Compute initial selectedKeys synchronously from series `selected` props
    const initialKeys = SeriesState.#selectedKeysFromSeries(getSeries());
    this.selectedKeys = new SelectionState<string>({ initial: initialKeys ?? undefined });

    // Reactively sync selectedKeys when series `selected` props change.
    // When any series explicitly sets `selected: false`, the remaining series
    // (with `selected` undefined or true) are pre-selected.
    $effect(() => {
      const keys = SeriesState.#selectedKeysFromSeries(this.#series);
      if (keys) {
        this.selectedKeys.current = keys;
      }
    });
  }

  /**
   * Extract selected keys from series definitions.
   * Returns keys of visible series when any series has `selected: false`, or null if all are visible.
   */
  static #selectedKeysFromSeries(series: { key: string; selected?: boolean }[]): string[] | null {
    const hasExplicitDeselection = series.some((s) => s.selected === false);
    if (!hasExplicitDeselection) return null;
    return series.filter((s) => s.selected !== false).map((s) => s.key);
  }

  /**
   * Whether the stack's layers are named by the rows (an ordinal `c`) rather than by series.
   *
   * A mark then needn't name a series to draw the stack — the row it's drawing already says
   * which layer it is.
   */
  get stacksByCategory() {
    return this.#stackConfig?.seriesBy != null;
  }

  /**
   * How the stack accumulates, or `null` when nothing is stacked — which is the question
   * `stackLayout != null` asks.
   *
   * Narrower than `ChartState.isStacked`, which also asks whether a mark draws the stack.
   */
  get stackLayout(): StackLayout | null {
    return this.#stackConfig?.layout ?? null;
  }

  /**
   * Whether a series draws the top segment of its stack for a row.
   *
   * The series stack in order, so the top is the last one drawing anything — which is *not* the
   * last series in general: an `x1` sub-band or a gap in the data leaves later series out of a
   * row, and then an earlier one is what the eye sees on top.  A diverging stack runs both ways
   * from the baseline, so a row has a top on each side and both are edges.
   *
   * Read off the stack rather than off the accessors, so this agrees with what was actually
   * drawn: the stack already resolves a row to its group (sub-band, facet panel) and aligns
   * series that carry their own `data`, neither of which a bare accessor could do.  A segment
   * spanning nothing counts as absent, since it draws nothing.
   */
  isStackTop(key: string, d: TData): boolean {
    const config = this.#stackConfig;
    const keys = config?.seriesBy ? this.#categoryKeys : this.visibleSeries.map((s) => s.key);
    const rowKey = config?.seriesBy ? config.seriesBy(d) : key;

    const span = this.#stackValueFor(rowKey, d);
    if (span == null || span[0] === span[1]) return false;

    /** The end farther from the baseline — which side of it the segment is stacked on, and how far */
    const outerOf = (s: [number, number]) => (Math.abs(s[1]) >= Math.abs(s[0]) ? s[1] : s[0]);
    const outer = outerOf(span);

    return !keys.some((k) => {
      if (k === rowKey) return false;
      const other = this.#stackValueFor(k, d);
      if (other == null || other[0] === other[1]) return false;
      const otherOuter = outerOf(other);
      // Only a segment stacked further along the *same* side covers this one — a diverging stack
      // runs both ways from the baseline, so each direction has its own outermost segment
      return Math.sign(otherOuter) === Math.sign(outer) && Math.abs(otherOuter) > Math.abs(outer);
    });
  }

  /**
   * Build wide-format data from per-series data arrays for d3 stack().
   * Each row has a category key and one property per series key with that series' value.
   */
  #alignSeriesData(): Record<string, any>[] {
    const config = this.#stackConfig;
    if (!config) return [];

    const keyByAcc = accessor(config.keyBy);
    const visibleSeries = this.visibleSeries;

    // Collect all unique category values across visible series
    const categoryMap = new InternMap<any, Record<string, any>>();

    for (const s of visibleSeries) {
      if (!s.data) continue;
      const valueAcc = accessor(s.value ?? config.valueAccessor ?? s.key);
      for (const d of s.data) {
        const catKey = keyByAcc(d);
        if (!categoryMap.has(catKey)) {
          categoryMap.set(catKey, { __key: catKey });
        }
        categoryMap.get(catKey)![s.key] = valueAcc(d) ?? 0;
      }
    }

    // Ensure all series keys exist on every row (default to 0)
    for (const row of categoryMap.values()) {
      for (const s of visibleSeries) {
        if (!(s.key in row)) {
          row[s.key] = 0;
        }
      }
    }

    return Array.from(categoryMap.values());
  }

  /**
   * The stack's layers when the rows name them, bottom first — hidden categories dropped so the
   * ones left close the gap rather than stacking above an empty band.
   */
  #categoryKeys = $derived.by(() => {
    const keys = this.#stackConfig?.seriesKeys;
    if (!keys) return [];
    return this.selectedKeys.isEmpty() ? keys : keys.filter((k) => this.selectedKeys.isSelected(k));
  });

  /**
   * Long rows pivoted into the wide shape `stack()` wants — one row per `keyBy` value, with a
   * column per category.
   */
  #alignCategoryData(rows: TData[]): Record<string, any>[] {
    const config = this.#stackConfig!;
    const keyByAcc = accessor(config.keyBy);
    const valueAcc = accessor(config.valueAccessor!);
    const seriesBy = config.seriesBy!;

    const byCategory = new InternMap<any, Record<string, any>>();
    for (const d of rows) {
      const catKey = keyByAcc(d);
      let row = byCategory.get(catKey);
      if (!row) {
        row = { __key: catKey };
        byCategory.set(catKey, row);
      }
      row[seriesBy(d)] = valueAcc(d) ?? 0;
    }
    return Array.from(byCategory.values());
  }

  /**
   * Computed stack data using InternMap for value-based lookup.
   * Outer map: categoryValue -> InternMap<seriesKey, [y0, y1]>
   */
  #buildStack(rows?: TData[]) {
    const config = this.#stackConfig;
    if (!config) return null;

    const offset =
      config.layout === 'stackExpand'
        ? stackOffsetExpand
        : config.layout === 'stackDiverging'
          ? stackOffsetDiverging
          : stackOffsetNone;

    // `seriesBy` names the layers from the rows, so the series are beside the point — including
    // `#alignSeriesData`, which pivots by series key and would be reading a mark's own data
    if (config.seriesBy) {
      const keys = this.#categoryKeys;
      const categoryRows = rows ?? config.data ?? [];
      if (keys.length === 0 || categoryRows.length === 0) return null;

      const wide = this.#alignCategoryData(categoryRows as TData[]);
      const stacked = stack()
        .keys(keys as Iterable<string>)
        .value((d, key) => (d as any)[key] ?? 0)
        .offset(offset)(wide);

      const byCategory = new InternMap<any, Map<string, [number, number]>>();
      for (let i = 0; i < wide.length; i++) {
        const layers = new Map<string, [number, number]>();
        for (let k = 0; k < keys.length; k++) {
          layers.set(keys[k], stacked[k][i] as unknown as [number, number]);
        }
        byCategory.set(wide[i].__key, layers);
      }
      return byCategory;
    }

    const visibleKeys = this.visibleSeries.map((s) => s.key);
    const hasSeparateData = this.visibleSeries.some((s) => s.data != null);
    const data = rows ?? (hasSeparateData ? this.#alignSeriesData() : (config.data ?? []));
    if (visibleKeys.length === 0 || data.length === 0) return null;

    const keyByAcc = accessor(config.keyBy);

    const stackResult = stack()
      .keys(visibleKeys)
      .value((d, key) => {
        if (hasSeparateData) {
          // Wide-format aligned data — value is directly on the row
          return (d as any)[key] ?? 0;
        }
        const s = this.#series.find((s) => s.key === key)!;
        const acc = s.value ?? config.valueAccessor ?? s.key;
        return accessor(acc)(d as any) ?? 0;
      })
      .offset(offset)(data as any[]);

    // Build InternMap: categoryValue -> Map<seriesKey, [y0, y1]>
    const map = new InternMap<any, Map<string, [number, number]>>();

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const catKey = hasSeparateData ? (d as any).__key : keyByAcc(d as TData);
      const seriesMap = new Map<string, [number, number]>();
      for (let seriesIdx = 0; seriesIdx < visibleKeys.length; seriesIdx++) {
        seriesMap.set(
          visibleKeys[seriesIdx],
          stackResult[seriesIdx][i] as unknown as [number, number]
        );
      }
      map.set(catKey, seriesMap);
    }

    return map;
  }

  /**
   * Stacked `[y0, y1]` per row, as `groupKey -> categoryValue -> seriesKey`.
   *
   * One stack per group rather than one overall: the rows of a facet panel stack among
   * themselves, and a category repeated across panels keeps a separate total in each.
   */
  #stackMap = $derived.by(() => {
    const config = this.#stackConfig;
    if (!config) return null;

    const groupBy = config.groupBy;
    if (!groupBy) {
      const single = this.#buildStack();
      return single && new Map([[STACK_UNGROUPED, single]]);
    }

    const hasSeparateData = this.visibleSeries.some((s) => s.data != null);
    const data = hasSeparateData ? this.#alignSeriesData() : (config.data ?? []);

    const out = new Map<string, InternMap<any, Map<string, [number, number]>>>();
    for (const [groupKey, rows] of group(data as TData[], groupBy)) {
      const built = this.#buildStack(rows);
      if (built) out.set(groupKey, built);
    }
    return out.size > 0 ? out : null;
  });

  /**
   * Get stack [y0, y1] values for a data point in a specific series.
   * Returns null if stacking is not enabled or series/data not found.
   */
  getStackValue(seriesKey: string | undefined, d: TData): [number, number] | null {
    const config = this.#stackConfig;
    // The row names its own layer when the categories live in the data, so the key a mark passes
    // (its single implicit series) has nothing to say about which segment this is
    return this.#stackValueFor(config?.seriesBy ? config.seriesBy(d) : seriesKey, d);
  }

  /**
   * The stacked span for a series at a category value, for callers holding the value rather than
   * the row it came from — an annotation placed at `x: someDate`, say.
   *
   * Only reaches the ungrouped stack: a facet panel or sub-band needs the row to say which one.
   */
  getStackValueAt(seriesKey: string, keyValue: any): [number, number] | null {
    return this.#stackMap?.get(STACK_UNGROUPED)?.get(keyValue)?.get(seriesKey) ?? null;
  }

  /** The span of a named layer for a row, whatever named it */
  #stackValueFor(key: any, d: TData): [number, number] | null {
    if (!this.#stackMap || !this.#stackConfig) return null;

    const config = this.#stackConfig;
    const groupKey = config.groupBy ? config.groupBy(d) : STACK_UNGROUPED;
    const catKey = accessor(config.keyBy)(d);
    return this.#stackMap.get(groupKey)?.get(catKey)?.get(key) ?? null;
  }

  /**
   * Collect every stacked [y0, y1] value across `rows` for the visible series.
   *
   * Calling `getStackValue()` once per row per series rebuilds the `keyBy`
   * accessor and re-reads the `#stackMap`/`#stackConfig` deriveds O(rows × series)
   * times. Hoisting both out of the loop measured ~5.5x faster across 30–1000 rows.
   */
  getStackedValues(rows: TData[]): number[] {
    const stackMap = this.#stackMap;
    const config = this.#stackConfig;
    if (!stackMap || !config) return [];

    const keyByAcc = accessor(config.keyBy);
    const groupBy = config.groupBy;
    const visibleKeys = config.seriesBy ? this.#categoryKeys : this.visibleSeries.map((s) => s.key);
    const values: number[] = [];

    for (const d of rows) {
      const seriesMap = stackMap.get(groupBy ? groupBy(d) : STACK_UNGROUPED)?.get(keyByAcc(d));
      if (!seriesMap) continue;
      for (const key of visibleKeys) {
        const stackValue = seriesMap.get(key);
        if (stackValue) values.push(stackValue[0], stackValue[1]);
      }
    }

    return values;
  }

  /**
   * Create stack-aware y0/y1 accessor functions for a series.
   * Use these in Area, Bars, etc. when stacking is enabled.
   */
  /** `seriesKey` is optional — with the layers named by the rows, it's the row that decides */
  getStackAccessors(seriesKey?: string) {
    return {
      y0: (d: TData) => this.getStackValue(seriesKey, d)?.[0] ?? 0,
      y1: (d: TData) => this.getStackValue(seriesKey, d)?.[1] ?? 0,
      /** Returns the [y0, y1] tuple, useful for Bars */
      value: (d: TData) => this.getStackValue(seriesKey, d),
    };
  }

  /**
   * Get all series for the chart.
   */
  get series() {
    return this.#series;
  }

  /**
   * Get only visible series for the chart.
   */
  get visibleSeries() {
    return this.#series.filter((s) => this.isVisible(s.key));
  }

  /**
   * Check if series is visible
   */
  isVisible(seriesKey: SeriesData<TData, TComponent>['key']) {
    // Implicit series name nothing a legend could select — what's selected there is `c`
    // categories or data keys, and the rows carrying them are filtered instead.  Reading the
    // selection here would hide the one series that draws them all.
    if (this.isDefaultSeries) return true;
    return this.selectedKeys.isEmpty() || this.selectedKeys.isSelected(seriesKey);
  }

  /**
   * Check if the series is the default
   */
  get isDefaultSeries() {
    return (
      this.#series.length === 0 || (this.#series.length === 1 && this.#series[0].key === 'default')
    );
  }

  /**
   * Check if series is highlighted
   * Changing default to `true` is useful to determine if series should be faded
   */
  isHighlighted(seriesKey: SeriesData<TData, TComponent>['key'], defaultValue = false) {
    if (this.#highlightKey === null) {
      return defaultValue;
    } else {
      return this.#highlightKey === seriesKey;
    }
  }

  get allSeriesData() {
    return this.#series
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData & { seriesKey: string }>;
  }

  /**
   * Get data from only visible series (filtered by selectedKeys).
   * Use this for domain calculations when series can be shown/hidden.
   */
  get visibleSeriesData() {
    return this.visibleSeries
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData & { seriesKey: string }>;
  }

  /**
   * Ordinal scale mapping series key to its declared color, or `null` when no series declares one
   * (or the series are the implicit default).
   *
   * Backs `ChartState.cScale` when nothing configures one, so `series` is the single source of
   * truth for the marks and the legend alike, without restating the palette as `cDomain`/`cRange`.
   */
  cScale = $derived.by(() => {
    if (this.isDefaultSeries) return null;
    const colored = this.#series.filter((s) => s.color != null);
    if (colored.length === 0) return null;

    return (
      scaleOrdinal<string, string>()
        .domain(colored.map((s) => s.key))
        .range(colored.map((s) => s.color as string))
        // Keys the series don't cover stay unresolved rather than recycling the palette
        .unknown(undefined as any)
    );
  });

  get allSeriesColors() {
    return this.#series.map((s) => s.color).filter((c) => c != null) as Array<
      NonNullable<SeriesData<TData, TComponent>['color']>
    >;
  }
}
