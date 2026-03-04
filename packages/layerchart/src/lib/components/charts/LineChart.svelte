<script lang="ts" module>
  import type { ChartProps } from '../Chart.svelte';
  import type { HighlightPointData } from '../Highlight.svelte';
  import type { SeriesData } from './types.js';

  import Spline from '../Spline.svelte';

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type LineChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<ChartProps<any>, 'data'> & {
      /**
       * The orientation of the chart.  Sets which axis is the value axis.
       *
       * @default 'horizontal'
       */
      orientation?: 'horizontal' | 'vertical';

      /**
       * The series data to be used for the chart.
       * @default [{ key: 'default', value: y, color: 'var(--color-primary)' }]
       */
      series?: SeriesData<TData, typeof Spline>[];

      /**
       * The event to be dispatched when the point is clicked.
       */
      onPointClick?: (
        e: MouseEvent,
        details: { data: HighlightPointData; series: SeriesData<TData, typeof Spline> }
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

  import Chart from '../Chart.svelte';

  import { getObjectOrNull } from '../../utils/common.js';
  import { isScaleTime } from '../../utils/scales.svelte.js';

  let {
    data = [],
    x: xProp,
    xScale,
    xDomain,
    y: yProp,
    yScale,
    radial = false,
    orientation = 'horizontal',
    valueAxis: valueAxisProp,
    series: seriesProp,
    axis = true,
    brush = false,
    highlight = { lines: true, points: true },
    legend = false,
    onPointClick,
    props = {},
    profile = false,
    tooltipContext = true,
    marks,
    context = $bindable(),
    ...restProps
  }: LineChartProps<TData> = $props();

  const valueAxis = $derived(valueAxisProp ?? (orientation === 'horizontal' ? 'y' : 'x'));

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',

            label:
              valueAxis == 'x'
                ? typeof xProp === 'string'
                  ? xProp
                  : 'value'
                : typeof yProp === 'string'
                  ? yProp
                  : 'value',
            value: valueAxis == 'x' ? xProp : yProp,
            color: 'var(--color-primary, currentColor)',
          },
        ]
      : seriesProp
  );
  const highlightWithPointClick = $derived(
    typeof highlight === 'function'
      ? highlight
      : onPointClick
        ? { ...getObjectOrNull(highlight), ...props.highlight, onPointClick }
        : highlight
  );

  if (profile) {
    console.time('LineChart render');
    onMount(() => {
      console.timeEnd('LineChart render');
    });
  }
</script>

<Chart
  bind:context
  {data}
  {xScale}
  x={xProp ?? (valueAxis === 'x' ? series.map((s) => s.value ?? s.key) : undefined)}
  {xDomain}
  xBaseline={valueAxis === 'y' || (xScale && isScaleTime(xScale)) ? undefined : 0}
  xNice={valueAxis === 'x'}
  {yScale}
  y={yProp ?? (valueAxis === 'y' ? series.map((s) => s.value ?? s.key) : undefined)}
  yBaseline={valueAxis === 'x' || (yScale && isScaleTime(yScale)) ? undefined : 0}
  yNice={valueAxis === 'y'}
  {radial}
  {valueAxis}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: valueAxis === 'x' ? 'quadtree-y' : 'quadtree-x',
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  brush={brush
    ? { axis: 'x', resetOnEnd: true, ...(typeof brush === 'object' ? brush : null), ...props.brush }
    : false}
  {series}
  highlight={highlightWithPointClick as any}
  {legend}
  {props}
>
  {#snippet marks({ context })}
    {#if typeof marks === 'function'}
      {@render marks({ context })}
    {:else}
      {#each context.series.visibleSeries as s, i (s.key)}
        <Spline seriesKey={s.key} {...props.spline} />
      {/each}
    {/if}
  {/snippet}
</Chart>
