<script lang="ts" module>
  import type { ChartProps, ChartPropsWithoutHTML } from '../Chart.svelte';
  import type { SeriesData, SimplifiedChartPropsObject } from './types.js';

  // Import component for use in type definitions (typeof Points)
  import Points from '../Points.svelte';

  export type ScatterChartPropsObjProp = Pick<
    SimplifiedChartPropsObject,
    | 'brush'
    | 'canvas'
    | 'grid'
    | 'highlight'
    | 'labels'
    | 'legend'
    | 'points'
    | 'rule'
    | 'svg'
    | 'tooltip'
    | 'xAxis'
    | 'yAxis'
  >;

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type ScatterChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<ChartPropsWithoutHTML<any>, 'data'> & {
      /**
       * The series data to be used for the chart.
       */
      series?: SeriesData<TData, typeof Points>[];

      props?: ScatterChartPropsObjProp;

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

  import { chartDataArray, defaultChartPadding } from '../../utils/common.js';
  import { SeriesState } from '$lib/states/series.svelte.js';
  import type { BrushDomainType } from '../../states/brush.svelte.js';

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
    highlight = { lines: true, points: true, axis: 'both' },
    legend = false,
    onTooltipClick = () => {},
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
  const seriesState = new SeriesState(() => series);

  const chartData = $derived(
    seriesState.visibleSeries
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData>
  );

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  if (profile) {
    console.time('ScatterChart render');
    onMount(() => {
      console.timeEnd('ScatterChart render');
    });
  }
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:context
  data={chartData}
  x={xProp}
  {xDomain}
  y={yProp}
  {yDomain}
  yNice
  c={yProp}
  cRange={['var(--color-primary, currentColor)']}
  padding={defaultChartPadding({ axis, legend })}
  {...restProps as Partial<ChartProps<TData>>}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'quadtree',
        onclick: onTooltipClick,
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  brush={brush && (brush === true || brush.mode == undefined || brush.mode === 'integrated')
    ? {
        axis: 'both',
        resetOnEnd: true,
        x: xDomain as BrushDomainType,
        y: yDomain as BrushDomainType,
        ...brushProps,
        onBrushEnd: (e) => {
          xDomain = e.brush.x;
          yDomain = e.brush.y;
          brushProps.onBrushEnd?.(e);
        },
      }
    : false}
  {seriesState}
  {axis}
  {grid}
  highlight={highlight as any}
  {legend}
  {props}
>
  {#snippet marks(snippetProps)}
    {#if typeof marks === 'function'}
      {@render marks(snippetProps)}
    {:else}
      {#each seriesState.visibleSeries as s, i (s.key)}
        <Points seriesKey={s.key} {...props.points} />
      {/each}
    {/if}
  {/snippet}

  {#snippet tooltip(snippetProps)}
    {@const tooltipSnippetProps = {
      context: snippetProps.context,
      getLegendProps: () => ({ ...props.legend }),
    }}
    {#if typeof tooltipProp === 'function'}
      {@render tooltipProp(tooltipSnippetProps)}
    {:else if tooltipContext}
      <Tooltip.Root context={snippetProps.context} {...props.tooltip?.root}>
        {#snippet children({ data })}
          {@const ctx = snippetProps.context}
          {@const activeSeries = ctx.tooltip.series[0]}
          {#if activeSeries?.key !== 'default'}
            <Tooltip.Header
              value={activeSeries.label ?? activeSeries.key}
              color={activeSeries.color}
              {...props.tooltip?.header}
            />
          {/if}
          <Tooltip.List {...props.tooltip?.list}>
            <Tooltip.Item
              label={typeof ctx.config.x === 'string' ? ctx.config.x : 'x'}
              value={ctx.x(data)}
              {format}
              onpointerenter={() => (seriesState.highlightKey = activeSeries?.key ?? null)}
              onpointerleave={() => (seriesState.highlightKey = null)}
              {...props.tooltip?.item}
            />
            <Tooltip.Item
              label={typeof ctx.config.y === 'string' ? ctx.config.y : 'y'}
              value={ctx.y(data)}
              {format}
              onpointerenter={() => (seriesState.highlightKey = activeSeries?.key ?? null)}
              onpointerleave={() => (seriesState.highlightKey = null)}
              {...props.tooltip?.item}
            />
            {#if ctx.config.r}
              <Tooltip.Item
                label={typeof ctx.config.r === 'string' ? ctx.config.r : 'r'}
                value={ctx.r(data)}
                {format}
                onpointerenter={() => (seriesState.highlightKey = activeSeries?.key ?? null)}
                onpointerleave={() => (seriesState.highlightKey = null)}
                {...props.tooltip?.item}
              />
            {/if}
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    {/if}
  {/snippet}
</Chart>
