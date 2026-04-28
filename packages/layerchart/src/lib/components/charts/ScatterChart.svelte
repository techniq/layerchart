<script lang="ts" module>
  import type { ChartProps } from "../Chart/Chart.svelte";
  import type { SeriesData } from './types.js';

  import Points from '../Points.svelte';

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type ScatterChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<ChartProps<any>, 'data'> & {
      /**
       * The series data to be used for the chart.
       */
      series?: SeriesData<TData, typeof Points>[];

      /**
       * Enable profiling to measure render time.
       * @default false
       */
      profile?: boolean;
    };
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';

  import Chart from "../Chart/Chart.svelte";

  import { chartDataArray } from '../../utils/common.js';

  let {
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
  }: ScatterChartProps<TData> = $props();

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
  {#snippet marks({ context })}
    {#if typeof marks === 'function'}
      {@render marks({ context })}
    {:else}
      {#each context.series.visibleSeries as s, i (s.key)}
        <Points seriesKey={s.key} {...props.points} />
      {/each}
    {/if}
  {/snippet}
</Chart>
