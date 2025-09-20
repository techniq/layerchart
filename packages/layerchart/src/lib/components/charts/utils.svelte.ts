import type { Component, ComponentProps } from 'svelte';
import { SelectionState } from '@layerstack/svelte-state';
import { scaleOrdinal } from 'd3-scale';
import { cls } from '@layerstack/tailwind';

import type { SeriesData } from './types.js';
import type Legend from '../Legend.svelte';
import { resolveMaybeFn } from '../../utils/common.js';

export class HighlightKey<TData, SeriesComponent extends Component> {
  current = $state<SeriesData<TData, SeriesComponent>['key'] | null>(null);

  set = (seriesKey: typeof this.current) => {
    this.current = seriesKey;
  };
}

export class SeriesState<TData, TComponent extends Component> {
  #series = $state.raw<SeriesData<TData, TComponent>[]>([]);
  selectedSeries = new SelectionState();
  selectedKeys = new SelectionState();
  highlightKey = new HighlightKey<TData, TComponent>();

  constructor(getSeries: () => SeriesData<TData, TComponent>[]) {
    this.#series = getSeries();

    $effect.pre(() => {
      // keep series state in sync with the prop
      this.#series = getSeries();
    });
  }

  get series() {
    return this.#series;
  }

  get isDefaultSeries() {
    return this.#series.length === 1 && this.#series[0].key === 'default';
  }

  get allSeriesData() {
    return this.#series
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData & { seriesKey: string }>;
  }

  get visibleSeries() {
    return this.#series.filter(
      (s) => this.selectedSeries.isEmpty() || this.selectedSeries.isSelected(s.key)
    );
  }

  /**
   * Check if series is highlighted
   * Changing default to `true` is useful to determine if series should be faded
   */
  isHighlighted(seriesKey: SeriesData<TData, TComponent>['key'], defaultValue = false) {
    if (this.highlightKey.current === null) {
      return defaultValue;
    } else {
      return this.highlightKey.current === seriesKey;
    }
  }
}

type CreateLegendPropsOptions<TData, TComponent extends Component> = {
  seriesState: SeriesState<TData, TComponent>;
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
    onclick: (_, item) => opts.seriesState.selectedSeries.toggle(item.value),
    onpointerenter: (_, item) => (opts.seriesState.highlightKey.current = item.value),
    onpointerleave: () => (opts.seriesState.highlightKey.current = null),
    ...opts.props,
    classes: {
      item: (item) => {
        const isVisible =
          opts.seriesState.visibleSeries.length &&
          !opts.seriesState.visibleSeries.some((s) => s.key === item.value);
        return cls(resolveMaybeFn(opts.props?.classes?.item, item), isVisible && 'opacity-50');
      },
      ...opts.props?.classes,
    },
  };
}
