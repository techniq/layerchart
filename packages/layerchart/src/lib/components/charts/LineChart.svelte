<script lang="ts" module>
  export type LineChartPropsObjProp = Pick<
    SimplifiedChartPropsObject,
    | 'brush'
    | 'canvas'
    | 'grid'
    | 'highlight'
    | 'labels'
    | 'legend'
    | 'points'
    | 'rule'
    | 'spline'
    | 'svg'
    | 'tooltip'
    | 'xAxis'
    | 'yAxis'
  >;

  export type LineChartProps<TData> = SimplifiedChartProps<TData, typeof Spline> & {
    /**
     * The orientation of the line chart.
     *
     * @default 'horizontal'
     */
    orientation?: 'vertical' | 'horizontal';

    props?: LineChartPropsObjProp;

    /**
     * The event to be dispatched when the point is clicked.
     */
    onPointClick?: (
      e: MouseEvent,
      details: { data: HighlightPointData; series: SeriesData<TData, typeof Spline> }
    ) => void;
  };
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';

  import Chart, { type ChartProps } from '../Chart.svelte';
  import { type HighlightPointData } from '../Highlight.svelte';
  import Spline from '../Spline.svelte';

  import { chartDataArray, defaultChartPadding, getObjectOrNull } from '../../utils/common.js';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import { SeriesState } from '$lib/states/series.svelte.js';
  import { isScaleTime } from '../../utils/scales.svelte.js';
  import type { BrushDomainType } from '../../states/brush.svelte.js';
  import { getSettings } from '$lib/contexts/settings.js';

  const settings = getSettings();

  let {
    data = [],
    x: xProp,
    xScale,
    xDomain,
    y: yProp,
    yScale,
    radial = false,
    orientation = 'horizontal',
    series: seriesProp,
    axis = true,
    brush = false,
    highlight = { lines: true, points: true },
    legend = false,
    onTooltipClick = () => {},
    onPointClick,
    props = {},
    profile = false,
    debug: debugProp,
    tooltipContext = true,
    marks,
    context = $bindable(),
    ...restProps
  }: LineChartProps<TData> = $props();

  const debug = $derived(debugProp ?? settings.debug);

  const isVertical = $derived(orientation === 'vertical');

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',

            label: isVertical
              ? typeof xProp === 'string'
                ? xProp
                : 'value'
              : typeof yProp === 'string'
                ? yProp
                : 'value',
            value: isVertical ? xProp : yProp,
            color: 'var(--color-primary, currentColor)',
          },
        ]
      : seriesProp
  );
  const seriesState = new SeriesState(() => series);

  const chartData = $derived(
    (seriesState.allSeriesData.length
      ? seriesState.allSeriesData
      : chartDataArray(data)) as Array<TData>
  );

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

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

  // Configure tooltip behavior
  $effect(() => {
    if (context?.tooltipState) {
      context.tooltipState.config = {
        stackedSeries: false,
      };
    }
  });
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<!-- TODO: Pass rule, legend, etc (without triggering: "Expression produces a union type that is too complex to represent.") -->
<Chart
  bind:context
  data={chartData}
  {xScale}
  x={xProp ?? (isVertical ? series.map((s) => s.value ?? s.key) : undefined)}
  {xDomain}
  xBaseline={!isVertical || (xScale && isScaleTime(xScale)) ? undefined : 0}
  xNice={orientation === 'vertical'}
  {yScale}
  y={yProp ?? (isVertical ? undefined : series.map((s) => s.value ?? s.key))}
  yBaseline={isVertical || (yScale && isScaleTime(yScale)) ? undefined : 0}
  yNice={orientation === 'horizontal'}
  {radial}
  {orientation}
  padding={radial ? undefined : defaultChartPadding({ axis, legend })}
  {...restProps as Partial<ChartProps<TData>>}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: isVertical ? 'quadtree-y' : 'quadtree-x',
        onclick: onTooltipClick,
        debug,
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
          xDomain = e.brush.x;
          brushProps.onBrushEnd?.(e);
        },
      }
    : false}
  {seriesState}
  highlight={highlightWithPointClick as any}
  legend={legend as any}
  props={props as typeof props}
>
  {#snippet marks(snippetProps)}
    {#if typeof marks === 'function'}
      {@render marks(snippetProps)}
    {:else}
      {#each seriesState.visibleSeries as s, i (s.key)}
        <Spline seriesKey={s.key} {...props.spline} />
      {/each}
    {/if}
  {/snippet}
</Chart>
