<script lang="ts" module>
  import type { ChartProps, ChartPropsWithoutHTML } from '../Chart.svelte';
  import type { SeriesData } from './types.js';

  // Import component for use in type definitions (typeof Bars)
  import Bars from '../Bars.svelte';

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type BarChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<ChartPropsWithoutHTML<any>, 'data'> & {
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
  import Labels from '../Labels.svelte';

  import {
    accessor,
    chartDataArray,
    defaultChartPadding,
    type Accessor,
  } from '$lib/utils/common.js';
  import { isScaleTime, type AnyScale } from '$lib/utils/scales.svelte.js';
  import { SeriesState, type StackLayout } from '$lib/states/series.svelte.js';
  import type { BrushDomainType } from '../../states/brush.svelte.js';

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
    /*
      TODO: handled below, but can be simplify?
        x: !isVertical || radial,
        y: isVertical || radial,
    */
    grid = true,
    highlight = { area: true },
    labels: labelsProp = false,
    legend = false,
    rule = true,
    onTooltipClick = () => {},
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

  const isVertical = $derived(orientation === 'vertical');
  const valueAccessorProp = $derived(isVertical ? yProp : xProp);

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',
            label:
              orientation === 'vertical'
                ? typeof yProp === 'string'
                  ? yProp
                  : 'value'
                : typeof xProp === 'string'
                  ? xProp
                  : 'value',
            value: valueAccessorProp,
          },
        ]
      : seriesProp
  );

  // SeriesState now handles stack computation internally
  const seriesState = new SeriesState(
    () => series,
    () =>
      seriesLayout.startsWith('stack')
        ? {
            layout: seriesLayout as StackLayout,
            data: chartDataArray(data),
            valueAccessor: valueAccessorProp,
          }
        : null
  );

  const isGroupSeries = $derived(seriesLayout === 'group');

  // Use first data item for scale type detection
  const firstDataItem = $derived(data[0]);

  const xScale = $derived(
    xScaleProp ??
      (xInterval
        ? scaleTime()
        : isVertical
          ? scaleBand().padding(bandPadding)
          : firstDataItem && accessor(xProp)(firstDataItem) instanceof Date // TODO: also check for Array<Date> instances (ex. x={['start', 'end']})
            ? scaleTime()
            : scaleLinear())
  );
  const xBaseline = $derived(isVertical || isScaleTime(xScale) ? undefined : 0);

  const yScale = $derived(
    yScaleProp ??
      (yInterval
        ? scaleTime()
        : isVertical
          ? firstDataItem && accessor(yProp)(firstDataItem) instanceof Date // TODO: also check for Array<Date> instances (ex. y={['start', 'end']})
            ? scaleTime()
            : scaleLinear()
          : scaleBand().padding(bandPadding))
  );
  const yBaseline = $derived(isVertical || isScaleTime(yScale) ? 0 : undefined);

  const x1Scale = $derived(
    isGroupSeries && isVertical ? scaleBand().padding(groupPadding) : undefined
  );
  const x1Domain = $derived(
    isGroupSeries && isVertical ? seriesState.visibleSeries.map((s) => s.key) : undefined
  );

  const x1Range = $derived(
    isGroupSeries && isVertical
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ xScale }: { xScale: AnyScale }) => [0, xScale.bandwidth!()]
      : undefined
  );

  const y1Scale = $derived(
    isGroupSeries && !isVertical ? scaleBand().padding(groupPadding) : undefined
  );
  const y1Domain = $derived(
    isGroupSeries && !isVertical ? seriesState.visibleSeries.map((s) => s.key) : undefined
  );
  const y1Range = $derived(
    isGroupSeries && !isVertical
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ yScale }: { yScale: AnyScale }) => [0, yScale.bandwidth!()]
      : undefined
  );

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  if (profile) {
    console.time('BarChart render');
    onMount(() => {
      console.timeEnd('BarChart render');
    });
  }

  function resolveAccessor(acc: Accessor<TData> | undefined) {
    if (acc) return acc;
    if (seriesState.isStacked) {
      // For stacked series, collect all y0/y1 values for domain calculation
      return (d: TData) => {
        const values: number[] = [];
        for (const s of seriesState.visibleSeries) {
          const stackValue = seriesState.getStackValue(s.key, d);
          if (stackValue) {
            values.push(stackValue[0], stackValue[1]);
          }
        }
        return values.length ? values : undefined;
      };
    }
    return seriesState.visibleSeries.map((s) => s.value ?? s.key);
  }
</script>

<Chart
  bind:context
  {data}
  x={resolveAccessor(xProp)}
  {xDomain}
  {xScale}
  {xBaseline}
  xNice={orientation === 'horizontal'}
  {x1Scale}
  {x1Domain}
  {x1Range}
  {xInterval}
  y={resolveAccessor(yProp)}
  {yScale}
  {yBaseline}
  yNice={orientation === 'vertical'}
  {y1Scale}
  {y1Domain}
  {y1Range}
  {yInterval}
  c={isVertical ? yProp : xProp}
  cRange={['var(--color-primary, currentColor)']}
  {radial}
  {orientation}
  padding={radial ? undefined : defaultChartPadding({ axis, legend })}
  {...restProps as Partial<ChartProps<TData>>}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'band',
        onclick: onTooltipClick,
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  brush={brush && (brush === true || brush.mode == undefined || brush.mode === 'integrated')
    ? {
        axis: 'x',
        resetOnEnd: true,
        x: xDomain as BrushDomainType,
        ...brushProps,
        onBrushEnd: (e) => {
          // TOOD: This should set xRange instead of xDomain, and/or xDomain should be all values, not just bounds of brush range
          // const values = context?.xScale.domain() ?? [];
          // console.log('domain', values, e.xDomain);
          // const i0 = values?.indexOf(e.xDomain[0]);
          // const i1 = values?.indexOf(e.xDomain[1]);
          // xDomain = values.slice(i0, i1);

          xDomain = e.brush.x;

          brushProps.onBrushEnd?.(e);
        },
      }
    : false}
  {seriesState}
  {axis}
  grid={typeof grid === 'object'
    ? { x: !isVertical || radial, y: isVertical || radial, ...grid }
    : grid
      ? { x: !isVertical || radial, y: isVertical || radial }
      : false}
  rule={typeof rule === 'object'
    ? { x: isVertical ? false : 0, y: isVertical ? 0 : false, ...rule }
    : rule
      ? { x: isVertical ? false : 0, y: isVertical ? 0 : false }
      : false}
  {legend}
  highlight={highlight as any}
  {props}
>
  {#snippet marks(snippetProps)}
    {#if typeof marks === 'function'}
      {@render marks(snippetProps)}
    {:else}
      {#each seriesState.visibleSeries as s, i (s.key)}
        <Bars
          seriesKey={s.key}
          x1={isVertical && isGroupSeries ? (d) => s.value ?? s.key : undefined}
          y1={!isVertical && isGroupSeries ? (d) => s.value ?? s.key : undefined}
          rounded={seriesState.isStacked && i !== seriesState.visibleSeries.length - 1
            ? 'none'
            : Array.isArray(xProp) || Array.isArray(yProp)
              ? 'all'
              : 'edge'}
          radius={4}
          strokeWidth={1}
          {stackPadding}
          opacity={seriesState.isHighlighted(s.key, true) ? 1 : 0.1}
          onBarClick={(e, detail) => onBarClick(e, { ...detail, series: s })}
          {...props.bars}
          {...s.props}
        />
      {/each}
    {/if}
  {/snippet}

  <!-- TODO: Remove (use ChartChildren) -->
  {#snippet labels(snippetProps)}
    {#if typeof labelsProp === 'function'}
      {@render labelsProp(snippetProps)}
    {:else if labelsProp}
      {#each seriesState.visibleSeries as s, i (s.key)}
        <Labels
          seriesKey={s.key}
          opacity={seriesState.isHighlighted(s.key, true) ? 1 : 0.1}
          {...props.labels}
          {...typeof labelsProp === 'object' ? labelsProp : null}
        />
      {/each}
    {/if}
  {/snippet}
</Chart>
