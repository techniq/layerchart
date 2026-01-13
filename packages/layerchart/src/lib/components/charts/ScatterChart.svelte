<script lang="ts" module>
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

  export type ScatterChartProps<TData> = SimplifiedChartProps<TData, typeof Points> & {
    props?: ScatterChartPropsObjProp;
  };
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';
  import { format } from '@layerstack/utils';

  import Chart, { type ChartProps } from '../Chart.svelte';
  import Points from '../Points.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { chartDataArray, defaultChartPadding } from '../../utils/common.js';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import { SeriesState } from '$lib/states/series.svelte.js';
  import type { BrushDomainType } from '../../states/brush.svelte.js';
  import { getSettings } from '$lib/contexts/settings.js';

  const settings = getSettings();

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
    debug: debugProp,
    tooltipContext = true,
    marks,
    tooltip: tooltipProp,
    context = $bindable(),
    ...restProps
  }: ScatterChartProps<TData> = $props();

  const debug = $derived(debugProp ?? settings.debug);

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
        debug,
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
  axis={axis as any}
  grid={grid as any}
  highlight={highlight as any}
  legend={legend as any}
  props={props as typeof props}
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
