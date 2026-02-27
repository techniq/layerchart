import type { Component } from 'svelte';
import type { SeriesData } from '../components/charts/types.js';
import { InternMap } from 'd3-array';
import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
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

  selectedKeys = new SelectionState<string>();

  /**
   * The current highlight series key for the chart.
   */
  highlightKey = $state<SeriesData<TData, TComponent>['key'] | null>(null);

  constructor(
    getSeries: () => SeriesData<TData, TComponent>[],
    getStackConfig?: () => StackConfig<TData> | null
  ) {
    this._getSeries = getSeries;
    this._getStackConfig = getStackConfig ?? (() => null);
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
    return this.#series.length === 0 || (this.#series.length === 1 && this.#series[0].key === 'default');
  }

  /**
   * Check if series is highlighted
   * Changing default to `true` is useful to determine if series should be faded
   */
  isHighlighted(seriesKey: SeriesData<TData, TComponent>['key'], defaultValue = false) {
    if (this.highlightKey === null) {
      return defaultValue;
    } else {
      return this.highlightKey === seriesKey;
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

  get allSeriesColors() {
    return this.#series.map((s) => s.color).filter((c) => c != null) as Array<
      NonNullable<SeriesData<TData, TComponent>['color']>
    >;
  }
}
