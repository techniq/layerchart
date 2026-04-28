<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AreaChartProps } from './AreaChart.shared.svelte.js';

  export type AreaChartBaseLayerComponents = {
    Chart: Component<any>;
    Area: Component<any>;
  };

  export type AreaChartBaseProps<TData> = AreaChartProps<TData> & AreaChartBaseLayerComponents;
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';

  import { getObjectOrNull } from '$lib/utils/common.js';

  let {
    Chart,
    Area,
    data = [],
    y,
    xDomain,
    radial = false,
    series: seriesProp,
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    legend = false,
    tooltipContext = true,
    highlight = { lines: true, points: true },
    rule = true,
    onPointClick,
    props = {},
    profile = false,
    marks,
    tooltip: tooltipProp,
    context = $bindable(),
    ...restProps
  }: AreaChartBaseProps<TData> = $props();

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',
            label: typeof y === 'string' ? y : 'value',
            value: y,
            color: 'var(--color-primary, currentColor)',
          },
        ]
      : seriesProp
  );

  if (profile) {
    console.time('AreaChart render');
    onMount(() => {
      console.timeEnd('AreaChart render');
    });
  }
</script>

<Chart
  bind:context
  {data}
  {xDomain}
  {y}
  yBaseline={0}
  yNice
  {radial}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'quadtree-x',
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  brush={brush
    ? {
        axis: 'x',
        zoomOnBrush: true,
        ...(typeof brush === 'object' ? brush : null),
        ...props.brush,
      }
    : false}
  {series}
  {seriesLayout}
  {axis}
  {grid}
  {rule}
  {legend}
  {highlight}
  tooltip={tooltipProp}
  props={{
    ...props,
    highlight: {
      ...props.highlight,
      onPointClick,
    },
  }}
>
  {#snippet marks({ context }: { context: any })}
    {#if typeof marks === 'function'}
      {@render marks({ context })}
    {:else}
      {#each context.series.visibleSeries as s (s.key)}
        <Area
          seriesKey={s.key}
          fillOpacity={0.3}
          line={{
            ...props.line,
            ...getObjectOrNull(props.area?.line),
            ...getObjectOrNull(s.props?.line),
          }}
          {...props.area}
          {...s.props}
        />
      {/each}
    {/if}
  {/snippet}
</Chart>
