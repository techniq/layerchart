import type { Component } from 'svelte';
import type { SeriesData } from './types.js';

export function createHighlightSeriesKey<TData, SeriesComponent extends Component>() {
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
