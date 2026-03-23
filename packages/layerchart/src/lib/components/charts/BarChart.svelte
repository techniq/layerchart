<script lang="ts" module>
  import type { ChartProps } from '../Chart.svelte';
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
  import { scaleBand, scaleLinear, scaleTime } from 'd3-scale';

  import Chart from '../Chart.svelte';

  import { accessor } from '$lib/utils/common.js';
  import { isScaleTime, type AnyScale } from '$lib/utils/scales.svelte.js';

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
    xScale: xScaleProp,
    yScale: yScaleProp,
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

  // Use first data item for scale type detection
  const firstDataItem = $derived(data[0]);

  const xScale = $derived(
    xScaleProp ??
      (xInterval
        ? scaleTime()
        : valueAxis === 'y'
          ? scaleBand().padding(bandPadding)
          : firstDataItem && accessor(xProp)(firstDataItem) instanceof Date // TODO: also check for Array<Date> instances (ex. x={['start', 'end']})
            ? scaleTime()
            : scaleLinear())
  );
  const xBaseline = $derived(valueAxis === 'y' || isScaleTime(xScale) ? undefined : 0);

  const yScale = $derived(
    yScaleProp ??
      (yInterval
        ? scaleTime()
        : valueAxis === 'y'
          ? firstDataItem && accessor(yProp)(firstDataItem) instanceof Date // TODO: also check for Array<Date> instances (ex. y={['start', 'end']})
            ? scaleTime()
            : scaleLinear()
          : scaleBand().padding(bandPadding))
  );
  const yBaseline = $derived(valueAxis === 'y' || isScaleTime(yScale) ? 0 : undefined);

  const x1Scale = $derived(
    isGroupSeries && valueAxis === 'y' ? scaleBand().padding(groupPadding) : undefined
  );
  const x1Domain = $derived(
    isGroupSeries && valueAxis === 'y' ? series.map((s) => s.key) : undefined
  );

  const x1Range = $derived(
    isGroupSeries && valueAxis === 'y'
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ xScale }: { xScale: AnyScale }) => [0, xScale.bandwidth!()]
      : undefined
  );

  const y1Scale = $derived(
    isGroupSeries && valueAxis === 'x' ? scaleBand().padding(groupPadding) : undefined
  );
  const y1Domain = $derived(
    isGroupSeries && valueAxis === 'x' ? series.map((s) => s.key) : undefined
  );
  const y1Range = $derived(
    isGroupSeries && valueAxis === 'x'
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ yScale }: { yScale: AnyScale }) => [0, yScale.bandwidth!()]
      : undefined
  );

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
  {xScale}
  {xBaseline}
  xNice={valueAxis === 'x'}
  {x1Scale}
  {x1Domain}
  {x1Range}
  {xInterval}
  y={yProp}
  {yScale}
  {yBaseline}
  yNice={valueAxis === 'y'}
  {y1Scale}
  {y1Domain}
  {y1Range}
  {yInterval}
  c={valueAxis === 'y' ? yProp : xProp}
  cRange={['var(--color-primary, currentColor)']}
  {radial}
  {valueAxis}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'band',
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  brush={brush
    ? { axis: 'x', zoomOnBrush: true, ...(typeof brush === 'object' ? brush : null), ...props.brush }
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
          rounded={context.series.isStacked && i !== context.series.visibleSeries.length - 1
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
