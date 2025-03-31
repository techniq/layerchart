import type { Component } from 'svelte';
import type { SeriesData } from './types.js';
import { createSelectionState } from '$lib/stores/selectionState.svelte.js';

export function createHighlightKey<TData, SeriesComponent extends Component>() {
  let current = $state<SeriesData<TData, SeriesComponent>['key'] | null>(null);

  function set(seriesKey: SeriesData<TData, SeriesComponent>['key'] | null) {
    current = seriesKey;
  }

  return {
    get current() {
      return current;
    },
    set current(value: SeriesData<TData, SeriesComponent>['key'] | null) {
      current = value;
    },
    set,
  };
}

export function createSeriesManager<TData, TComponent extends Component>(
  getSeries: () => SeriesData<TData, TComponent>[]
) {
  const isDefaultSeries = $derived.by(() => {
    const series = getSeries();
    return series.length === 1 && series[0].key === 'default';
  });
  const allSeriesData = $derived(
    getSeries()
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData & { seriesKey: string }>
  );

  const selectedSeries = createSelectionState();
  const selectedKeys = createSelectionState();
  const highlightKey = createHighlightKey<TData, TComponent>();

  const visibleSeries = $derived(
    getSeries().filter((s) => selectedSeries.isEmpty() || selectedSeries.isSelected(s.key))
  );

  return {
    get series() {
      return getSeries();
    },
    selectedSeries,
    selectedKeys,
    highlightKey,
    get visibleSeries() {
      return visibleSeries;
    },
    get allSeriesData() {
      return allSeriesData;
    },
    get isDefaultSeries() {
      return isDefaultSeries;
    },
  };
}
