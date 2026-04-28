<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { ScatterChartProps } from './ScatterChart.shared.svelte.js';

  export type ScatterChartBaseLayerComponents = {
    Chart: Component<any>;
    Points: Component<any>;
  };

  export type ScatterChartBaseProps<TData> = ScatterChartProps<TData> &
    ScatterChartBaseLayerComponents;
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';

  import { chartDataArray } from '$lib/utils/common.js';

  let {
    Chart,
    Points,
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    yDomain,
    series: seriesProp,
    axis = true,
    brush = false,
    grid = { x: true, y: true },
    rule = { x: 0, y: 0 },
    highlight = { lines: true, points: true, axis: 'both' },
    legend = false,
    props = {},
    profile = false,
    tooltipContext = true,
    marks,
    tooltip: tooltipProp,
    context = $bindable(),
    ...restProps
  }: ScatterChartBaseProps<TData> = $props();

  const series = $derived(
    seriesProp === undefined ? [{ key: 'default', data: chartDataArray(data) }] : seriesProp
  );
  if (profile) {
    console.time('ScatterChart render');
    onMount(() => {
      console.timeEnd('ScatterChart render');
    });
  }
</script>

<Chart
  bind:context
  {data}
  x={xProp}
  {xDomain}
  y={yProp}
  {yDomain}
  c={yProp}
  cRange={['var(--color-primary, currentColor)']}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'quadtree',
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  brush={brush
    ? {
        axis: 'both',
        zoomOnBrush: true,
        ...(typeof brush === 'object' ? brush : null),
        ...props.brush,
      }
    : false}
  {series}
  {axis}
  {grid}
  {rule}
  {highlight}
  {legend}
  tooltip={tooltipProp}
  {props}
>
  {#snippet marks({ context }: { context: any })}
    {#if typeof marks === 'function'}
      {@render marks({ context })}
    {:else}
      {#each context.series.visibleSeries as s, i (s.key)}
        <Points seriesKey={s.key} {...props.points} />
      {/each}
    {/if}
  {/snippet}
</Chart>
