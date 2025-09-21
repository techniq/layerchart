import type { Component, ComponentProps } from 'svelte';

import { scaleOrdinal } from 'd3-scale';
import { cls } from '@layerstack/tailwind';

import type Legend from '../Legend.svelte';
import { resolveMaybeFn } from '$lib/utils/common.js';
import type { SeriesState } from '$lib/states/series.svelte.js';

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
        return cls(
          resolveMaybeFn(opts.props?.classes?.item, item),
          !opts.seriesState.isVisible(item.value) && 'opacity-50'
        );
      },
      ...opts.props?.classes,
    },
  };
}
