import type { Component } from 'svelte';
import type { SeriesData } from '../components/charts/types.js';
import { InternMap } from 'd3-array';
import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { accessor, type Accessor } from '../utils/common.js';
import { SelectionState } from '@layerstack/svelte-state';

export type StackLayout = 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging';

export type StackConfig<TData> = {
  layout: StackLayout;
  data?: TData[];
  keyBy: Accessor<TData>;
  valueAccessor?: Accessor<TData>;
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
    this.#highlightKey = key;
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
   * Whether stacking is enabled
   */
  get isStacked() {
    return this.#stackConfig?.layout?.startsWith('stack') ?? false;
  }

  /**
   * Current stack layout mode
   */
  get stackLayout(): StackLayout {
    return this.#stackConfig?.layout ?? 'overlap';
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
   * Computed stack data using InternMap for value-based lookup.
   * Outer map: categoryValue -> InternMap<seriesKey, [y0, y1]>
   */
  #stackMap = $derived.by(() => {
    const config = this.#stackConfig;
    if (!config || !config.layout.startsWith('stack')) return null;

    const visibleKeys = this.visibleSeries.map((s) => s.key);
    const hasSeparateData = this.visibleSeries.some((s) => s.data != null);
    const data = hasSeparateData ? this.#alignSeriesData() : (config.data ?? []);

    if (visibleKeys.length === 0 || data.length === 0) return null;

    const keyByAcc = accessor(config.keyBy);

    const offset =
      config.layout === 'stackExpand'
        ? stackOffsetExpand
        : config.layout === 'stackDiverging'
          ? stackOffsetDiverging
          : stackOffsetNone;

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
  });

  /**
   * For stackDiverging layout, returns the set of series keys that are "tips"
   * (outermost in each direction) and should have rounded edges.
   * Returns null for non-diverging layouts.
   */
  get divergingEdgeKeys(): Set<string> | null {
    if (this.stackLayout !== 'stackDiverging' || !this.#stackMap) return null;

    const firstEntry = this.#stackMap.values().next().value;
    if (!firstEntry) return null;

    let maxPosY1 = -Infinity;
    let minNegY0 = Infinity;
    let posTipKey: string | null = null;
    let negTipKey: string | null = null;

    for (const s of this.visibleSeries) {
      const stackVal = firstEntry.get(s.key);
      if (!stackVal) continue;
      const [y0, y1] = stackVal;
      if (y1 > maxPosY1) {
        maxPosY1 = y1;
        posTipKey = s.key;
      }
      if (y0 < minNegY0) {
        minNegY0 = y0;
        negTipKey = s.key;
      }
    }

    const tips = new Set<string>();
    if (posTipKey != null && maxPosY1 > 0) tips.add(posTipKey);
    if (negTipKey != null && minNegY0 < 0) tips.add(negTipKey);
    return tips;
  }

  /**
   * Get stack [y0, y1] values for a data point in a specific series.
   * Returns null if stacking is not enabled or series/data not found.
   */
  getStackValue(seriesKey: string, d: TData): [number, number] | null {
    if (!this.#stackMap || !this.#stackConfig) return null;

    const keyByAcc = accessor(this.#stackConfig.keyBy);
    const catKey = keyByAcc(d);
    return this.#stackMap.get(catKey)?.get(seriesKey) ?? null;
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
    const visibleKeys = this.visibleSeries.map((s) => s.key);
    const values: number[] = [];

    for (const d of rows) {
      const seriesMap = stackMap.get(keyByAcc(d));
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
  getStackAccessors(seriesKey: string) {
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
