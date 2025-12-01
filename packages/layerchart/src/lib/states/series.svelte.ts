import type { Component } from 'svelte';
import type { SeriesData } from '../components/charts/types.js';

import { SelectionState } from '@layerstack/svelte-state';

export class SeriesState<TData, TComponent extends Component> {
  #series = $state.raw<SeriesData<TData, TComponent>[]>([]);
  selectedKeys = new SelectionState<string>();

  /**
   * The current highlight series key for the chart.
   */
  highlightKey = $state<SeriesData<TData, TComponent>['key'] | null>(null);

  constructor(getSeries: () => SeriesData<TData, TComponent>[]) {
    this.#series = getSeries();

    $effect.pre(() => {
      // keep series state in sync with the prop
      this.#series = getSeries();
    });
  }

  /**
   * The series of data for the chart.
   */
  get series() {
    return this.#series;
  }

  /**
   * Check if the series is the default
   */
  get isDefaultSeries() {
    return this.#series.length === 1 && this.#series[0].key === 'default';
  }

  /**
   * The visible series of data for the chart.
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

  get allSeriesColors() {
    return this.#series.map((s) => s.color).filter((c) => c != null) as Array<
      NonNullable<SeriesData<TData, TComponent>['color']>
    >;
  }
}
