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

  import { defaultChartPadding, getObjectOrNull } from '../../utils/common.js';
  import { isScaleTime } from '../../utils/scales.svelte.js';
  import type { BrushDomainType } from '../../states/brush.svelte.js';

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
    onTooltipClick = () => {},
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
  padding={radial ? undefined : defaultChartPadding({ axis, legend })}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: valueAxis === 'x' ? 'quadtree-y' : 'quadtree-x',
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
          if (restProps.transform?.mode === 'domain' && context) {
            // Convert brush selection to transform scale/translate
            const brushX = e.brush.x;
            if (brushX[0] != null && brushX[1] != null) {
              const baseDomain = context._baseXDomain;
              const baseMin = +baseDomain[0];
              const baseRange = +baseDomain[1] - baseMin;
              const brushMin = +brushX[0];
              const brushRange = +brushX[1] - brushMin;
              if (brushRange > 0 && baseRange > 0) {
                const newScale = baseRange / brushRange;
                const newTranslateX = -((brushMin - baseMin) / baseRange) * context.width * newScale;
                context.transform.setScale(newScale);
                context.transform.setTranslate({ x: newTranslateX, y: 0 });
              }
            }
          } else {
            xDomain = e.brush.x;
          }
          brushProps.onBrushEnd?.(e);
        },
      }
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
