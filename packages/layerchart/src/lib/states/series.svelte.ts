import type { Component } from 'svelte';
import type { SeriesData } from '../components/charts/types.js';
import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
import { accessor, type Accessor } from '../utils/common.js';
import { SelectionState } from '@layerstack/svelte-state';

export type StackLayout = 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging';

export type StackConfig<TData> = {
  layout: StackLayout;
  data: TData[];
  valueAccessor?: Accessor<TData>;
};

export class SeriesState<TData, TComponent extends Component> {
  #series = $state.raw<SeriesData<TData, TComponent>[]>([]);
  #stackConfig = $state.raw<StackConfig<TData> | null>(null);
  selectedKeys = new SelectionState<string>();

  /**
   * The current highlight series key for the chart.
   */
  highlightKey = $state<SeriesData<TData, TComponent>['key'] | null>(null);

  constructor(
    getSeries: () => SeriesData<TData, TComponent>[],
    getStackConfig?: () => StackConfig<TData> | null
  ) {
    this.#series = getSeries();
    if (getStackConfig) {
      this.#stackConfig = getStackConfig();
    }

    $effect.pre(() => {
      // keep series state in sync with the prop
      this.#series = getSeries();
      if (getStackConfig) {
        this.#stackConfig = getStackConfig();
      }
    });
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
   * Computed stack data using WeakMap for O(1) lookup by data object.
   * Maps each data object to an array of [y0, y1] tuples, one per visible series.
   */
  #stackMap = $derived.by(() => {
    const config = this.#stackConfig;
    if (!config || !config.layout.startsWith('stack')) return null;

    const map = new WeakMap<object, Array<[number, number]>>();
    const visibleKeys = this.visibleSeries.map((s) => s.key);

    if (visibleKeys.length === 0 || config.data.length === 0) return map;

    const offset =
      config.layout === 'stackExpand'
        ? stackOffsetExpand
        : config.layout === 'stackDiverging'
          ? stackOffsetDiverging
          : stackOffsetNone;

    const stackResult = stack()
      .keys(visibleKeys)
      .value((d, key) => {
        const s = this.#series.find((s) => s.key === key)!;
        const acc = s.value ?? config.valueAccessor ?? s.key;
        return accessor(acc)(d as any) ?? 0;
      })
      .offset(offset)(config.data as any[]);

    // Build WeakMap: data object -> stack values for each visible series
    for (let i = 0; i < config.data.length; i++) {
      const d = config.data[i] as object;
      const values: Array<[number, number]> = visibleKeys.map(
        (_, seriesIdx) => stackResult[seriesIdx][i] as unknown as [number, number]
      );
      map.set(d, values);
    }

    return map;
  });

  /**
   * Get stack [y0, y1] values for a data point in a specific series.
   * Returns null if stacking is not enabled or series/data not found.
   */
  getStackValue(seriesKey: string, d: TData): [number, number] | null {
    if (!this.#stackMap) return null;

    const seriesIdx = this.visibleSeries.findIndex((s) => s.key === seriesKey);
    if (seriesIdx === -1) return null;

    const values = this.#stackMap.get(d as object);
    return values?.[seriesIdx] ?? null;
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
   * Resolve accessor for domain calculation, handling stacked and multi-series cases.
   * For stacked series, returns a function that collects all y0/y1 values.
   * For multi-series without explicit accessor, returns array of series value accessors.
   * @param acc - The explicit accessor provided by the user, if any
   * @returns The resolved accessor for domain calculation
   */
  getValueDomainAccessor<T extends Accessor<TData>>(acc: T | undefined): T | Accessor<TData> {
    // If explicit accessor provided, use it
    if (acc) return acc;

    // For stacked series, collect all y0/y1 values for domain calculation
    if (this.isStacked) {
      return ((d: TData) => {
        const values: number[] = [];
        for (const s of this.visibleSeries) {
          const stackValue = this.getStackValue(s.key, d);
          if (stackValue) {
            values.push(stackValue[0], stackValue[1]);
          }
        }
        return values.length ? values : undefined;
      }) as Accessor<TData>;
    }

    // Multi-series: use all visible series accessors
    return this.visibleSeries.map((s) => s.value ?? s.key) as Accessor<TData>;
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
    return this.#series.length === 1 && this.#series[0].key === 'default';
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
