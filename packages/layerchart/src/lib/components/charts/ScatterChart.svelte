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

  import { chartDataArray, defaultChartPadding } from '../../utils/common.js';
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
  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

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
  padding={defaultChartPadding({ axis, legend })}
  {...restProps}
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
          if (restProps.transform?.mode === 'domain' && context) {
            const brushX = e.brush.x;
            const brushY = e.brush.y;
            if (brushX[0] != null && brushX[1] != null) {
              const baseDomainX = context._baseXDomain;
              const baseMinX = +baseDomainX[0];
              const baseRangeX = +baseDomainX[1] - baseMinX;
              const brushMinX = +brushX[0];
              const brushRangeX = +brushX[1] - brushMinX;
              if (brushRangeX > 0 && baseRangeX > 0) {
                const newScale = baseRangeX / brushRangeX;
                const newTranslateX = -((brushMinX - baseMinX) / baseRangeX) * context.width * newScale;
                const baseDomainY = context._baseYDomain;
                const baseMinY = +baseDomainY[0];
                const baseRangeY = +baseDomainY[1] - baseMinY;
                const brushMinY = +brushY[0];
                const newTranslateY = -((brushMinY - baseMinY) / baseRangeY) * context.height * newScale;
                context.transform.setScale(newScale);
                context.transform.setTranslate({ x: newTranslateX, y: newTranslateY });
              }
            }
          } else {
            xDomain = e.brush.x;
            yDomain = e.brush.y;
          }
          brushProps.onBrushEnd?.(e);
        },
      }
    : false}
  {series}
  {axis}
  {grid}
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
