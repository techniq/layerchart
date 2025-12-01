import type { Component, ComponentProps } from 'svelte';

import { scaleOrdinal } from 'd3-scale';
import { cls } from '@layerstack/tailwind';

import type Legend from '../Legend.svelte';
import { resolveMaybeFn } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';

type CreateLegendPropsOptions<TData, TComponent extends Component> = {
  // TODO: pass props directly since seriesState is accessible via context now
  props: Partial<ComponentProps<typeof Legend>>;
};

/**
 * A prop builder for the legend component shared between the simplified charts.
 */
export function createLegendProps<TData, TComponent extends Component>(
  opts: CreateLegendPropsOptions<TData, TComponent>
): ComponentProps<typeof Legend> {
  const ctx = getChartContext<TData>();
  return {
    scale: ctx.seriesState.isDefaultSeries
      ? undefined
      : scaleOrdinal(
          ctx.seriesState.series.map((s) => s.key),
          ctx.seriesState.series.map((s) => s.color)
        ),
    tickFormat: (key) => ctx.seriesState.series.find((s) => s.key === key)?.label ?? key,
    placement: 'bottom',
    variant: 'swatches',
    selected: ctx.seriesState.selectedKeys.current,
    onclick: (_, item) => ctx.seriesState.selectedKeys.toggle(item.value),
    onpointerenter: (_, item) => (ctx.seriesState.highlightKey = item.value),
    onpointerleave: () => (ctx.seriesState.highlightKey = null),
    ...opts.props,
    classes: {
      item: (item) => {
        return cls(resolveMaybeFn(opts.props?.classes?.item, item));
      },
      ...opts.props?.classes,
    },
  };
}
