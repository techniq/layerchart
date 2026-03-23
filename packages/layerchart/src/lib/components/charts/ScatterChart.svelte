<script lang="ts" module>
  import type { ChartProps } from '../Chart.svelte';
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
  import { format } from '@layerstack/utils';

  import Chart from '../Chart.svelte';
  import * as Tooltip from '../tooltip/index.js';

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
  yNice
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
    ? { axis: 'both', zoomOnBrush: true, ...(typeof brush === 'object' ? brush : null), ...props.brush }
    : false}
  {series}
  {axis}
  {grid}
  {rule}
  {highlight}
  {legend}
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

  {#snippet tooltip({ context })}
    {#if typeof tooltipProp === 'function'}
      {@render tooltipProp({ context })}
    {:else if tooltipContext}
      <Tooltip.Root {context} {...props.tooltip?.root}>
        {#snippet children({ data })}
          {@const activeSeries = context.tooltip.series.find((s) => s.key === data?.seriesKey) ?? context.tooltip.series[0]}
          {#if activeSeries?.key !== 'default'}
            <Tooltip.Header
              value={activeSeries.label ?? activeSeries.key}
              color={activeSeries.color}
              {...props.tooltip?.header}
            />
          {/if}
          <Tooltip.List {...props.tooltip?.list}>
            <Tooltip.Item
              label={typeof context.config.x === 'string' ? context.config.x : 'x'}
              value={context.x(data)}
              {format}
              onpointerenter={() => (context.series.highlightKey = activeSeries?.key ?? null)}
              onpointerleave={() => (context.series.highlightKey = null)}
              {...props.tooltip?.item}
            />
            <Tooltip.Item
              label={typeof context.config.y === 'string' ? context.config.y : 'y'}
              value={context.y(data)}
              {format}
              onpointerenter={() => (context.series.highlightKey = activeSeries?.key ?? null)}
              onpointerleave={() => (context.series.highlightKey = null)}
              {...props.tooltip?.item}
            />
            {#if context.config.r}
              <Tooltip.Item
                label={typeof context.config.r === 'string' ? context.config.r : 'r'}
                value={context.r(data)}
                {format}
                onpointerenter={() => (context.series.highlightKey = activeSeries?.key ?? null)}
                onpointerleave={() => (context.series.highlightKey = null)}
                {...props.tooltip?.item}
              />
            {/if}
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    {/if}
  {/snippet}
</Chart>
