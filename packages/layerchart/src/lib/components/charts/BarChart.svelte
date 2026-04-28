<script lang="ts" module>
  import type { ChartProps } from "../Chart/Chart.svelte";
  import type { SeriesData } from './types.js';

  import Bars from '../Bars.svelte';

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type BarChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<ChartProps<any>, 'data'> & {
      /**
       * The orientation of the chart.  Sets which axis is the value axis.
       *
       * @default 'vertical'
       */
      orientation?: 'horizontal' | 'vertical';

      /**
       * The series data to be used for the chart.
       * @default [{ key: 'default', value: y, color: 'var(--color-primary)' }]
       */
      series?: SeriesData<TData, typeof Bars>[];

      /**
       * The layout of the series.
       *
       * @default 'overlap'
       */
      seriesLayout?: 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging' | 'group';

      /**
       * Padding between primary x or y bands/bars, applied to scaleBand().padding()
       *
       * @default 0.4
       */
      bandPadding?: number;

      /**
       * Padding between group/series items when using 'seriesLayout="group"', applied to scaleBand().padding()
       *
       * @default 0
       */
      groupPadding?: number;

      /**
       * Padding between series items within bars when using 'seriesLayout="stack"'
       *
       * @default 0
       */
      stackPadding?: number;

      /**
       * A callback function that is called when a bar is clicked.
       * @param e - The original event that triggered the callback
       * @param detail - An object containing the bar's data and series information
       */
      onBarClick?: (
        event: MouseEvent,
        detail: { data: any; series: SeriesData<TData, typeof Bars> }
      ) => void;

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

  let {
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    radial = false,
    orientation = 'vertical',
    series: seriesProp,
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    highlight = { area: true },
    legend = false,
    rule = true,
    onBarClick = () => {},
    props = {},
    profile = false,
    bandPadding = radial ? 0 : 0.4,
    groupPadding = 0,
    stackPadding = 0,
    xInterval,
    yInterval,
    tooltipContext = true,
    marks,
    context = $bindable(),
    ...restProps
  }: BarChartProps<TData> = $props();

  const valueAxis = $derived(orientation === 'horizontal' ? 'x' : 'y');

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',
            label:
              valueAxis === 'y'
                ? typeof yProp === 'string'
                  ? yProp
                  : 'value'
                : typeof xProp === 'string'
                  ? xProp
                  : 'value',
            value: valueAxis === 'y' ? yProp : xProp,
          },
        ]
      : seriesProp
  );

  const isGroupSeries = $derived(seriesLayout === 'group');

  if (profile) {
    console.time('BarChart render');
    onMount(() => {
      console.timeEnd('BarChart render');
    });
  }
</script>

<Chart
  bind:context
  {data}
  x={xProp}
  {xDomain}
  {xInterval}
  y={yProp}
  {yInterval}
  c={valueAxis === 'y' ? yProp : xProp}
  cRange={['var(--color-primary, currentColor)']}
  {radial}
  {valueAxis}
  {bandPadding}
  {groupPadding}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'band',
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
  highlight={highlight as any}
  {props}
>
  {#snippet marks({ context })}
    {#if typeof marks === 'function'}
      {@render marks({ context })}
    {:else}
      {#each context.series.visibleSeries as s, i (s.key)}
        <Bars
          seriesKey={s.key}
          x1={valueAxis === 'y' && isGroupSeries ? (d) => s.value ?? s.key : undefined}
          y1={valueAxis === 'x' && isGroupSeries ? (d) => s.value ?? s.key : undefined}
          rounded={context.series.divergingEdgeKeys
            ? context.series.divergingEdgeKeys.has(s.key)
              ? 'edge'
              : 'none'
            : context.series.isStacked && i !== context.series.visibleSeries.length - 1
              ? 'none'
              : Array.isArray(xProp) || Array.isArray(yProp)
                ? 'all'
                : 'edge'}
          radius={4}
          strokeWidth={1}
          {stackPadding}
          opacity={context.series.isHighlighted(s.key, true) ? 1 : 0.1}
          onBarClick={(e, detail) => onBarClick(e, { ...detail, series: s })}
          {...props.bars}
          {...s.props}
        />
      {/each}
    {/if}
  {/snippet}
</Chart>
