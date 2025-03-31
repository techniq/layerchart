import type { Component, ComponentProps } from 'svelte';
import type { SeriesData } from './types.js';
import { createSelectionState } from '$lib/stores/selectionState.svelte.js';
import type Legend from '../Legend.svelte';
import { scaleOrdinal } from 'd3-scale';

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

export type SeriesState<TData = any, TComponent extends Component = Component> = ReturnType<
  typeof createSeriesState<TData, TComponent>
>;

export function createSeriesState<TData, TComponent extends Component>(
  getSeries: () => SeriesData<TData, TComponent>[]
) {
  const series = $derived(getSeries());
  const isDefaultSeries = $derived.by(() => {
    return series.length === 1 && series[0].key === 'default';
  });
  const allSeriesData = $derived(
    series
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData & { seriesKey: string }>
  );

  const selectedSeries = createSelectionState();
  const selectedKeys = createSelectionState();
  const highlightKey = createHighlightKey<TData, TComponent>();

  const visibleSeries = $derived(
    series.filter((s) => selectedSeries.isEmpty() || selectedSeries.isSelected(s.key))
  );

  return {
    get series() {
      return series;
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

type CreateLegendPropsOptions<TData, TComponent extends Component> = {
  seriesState: ReturnType<typeof createSeriesState<TData, TComponent>>;
  props: Partial<ComponentProps<typeof Legend>>;
};

/**
 * A prop builder for the legend component shared between the simplified charts.
 */
export function createLegendProps<TData, TComponent extends Component>(
  opts: CreateLegendPropsOptions<TData, TComponent>
): ComponentProps<typeof Legend> {
  return {
    scale: opts.seriesState.isDefaultSeries
      ? undefined
      : scaleOrdinal(
          opts.seriesState.series.map((s) => s.key),
          opts.seriesState.series.map((s) => s.color)
        ),
    tickFormat: (key) => opts.seriesState.series.find((s) => s.key === key)?.label ?? key,
    placement: 'bottom',
    variant: 'swatches',
    onclick: (_, item) => opts.seriesState.selectedSeries.toggleSelected(item.value),
    onpointerenter: (_, item) => (opts.seriesState.highlightKey.current = item.value),
    onpointerleave: () => (opts.seriesState.highlightKey.current = null),
    ...opts.props,
    classes: {
      item: (item) =>
        opts.seriesState.visibleSeries.length &&
        !opts.seriesState.visibleSeries.some((s) => s.key === item.value)
          ? 'opacity-50'
          : '',
      ...opts.props?.classes,
    },
  };
}
