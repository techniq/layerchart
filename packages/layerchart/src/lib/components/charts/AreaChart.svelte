<script lang="ts" module>
  import type { ChartProps } from '../Chart.svelte';
  import type { HighlightPoint } from '../Highlight.svelte';
  import type { SeriesData } from './types.js';

  import Area from '../Area.svelte';

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type AreaChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<ChartProps<any>, 'data'> & {
      /**
       * The series data to be used for the chart.
       * @default [{ key: 'default', value: y, color: 'var(--color-primary)' }]
       */
      series?: SeriesData<TData, typeof Area>[];

      /**
       * The layout of the series.
       * @default 'overlap'
       */
      seriesLayout?: 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging';

      /**
       * A callback function called when a point in the chart is clicked.
       *
       * @param e - the original event that triggered the `onPointClick`
       * @param details - an object containing the highlighted point and data
       */
      onPointClick?: (e: MouseEvent, details: { point: HighlightPoint; data: any }) => void;

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

  import { chartDataArray, defaultChartPadding, getObjectOrNull } from '$lib/utils/common.js';
  import { SeriesState, type StackLayout } from '$lib/states/series.svelte.js';
  import type { BrushDomainType } from '../../states/brush.svelte.js';

  let {
    data = [],
    y,
    xDomain,
    radial = false,
    series: seriesProp,
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    legend = false,
    tooltipContext = true,
    highlight = { lines: true, points: true },
    rule = true,
    onTooltipClick = () => {},
    onPointClick,
    props = {},
    profile = false,
    marks,
    tooltip: tooltipProp,
    context = $bindable(),
    ...restProps
  }: AreaChartProps<TData> = $props();

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',
            label: typeof y === 'string' ? y : 'value',
            value: y,
            color: 'var(--color-primary, currentColor)',
          },
        ]
      : seriesProp
  );

  // SeriesState now handles stack computation internally
  // Note: For stacking, we use baseData (raw data array) since stack computes across all series
  const seriesState = new SeriesState(
    () => series,
    () =>
      seriesLayout.startsWith('stack')
        ? { layout: seriesLayout as StackLayout, data: chartDataArray(data), valueAccessor: y }
        : null
  );

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  if (profile) {
    console.time('AreaChart render');
    onMount(() => {
      console.timeEnd('AreaChart render');
    });
  }
</script>

<Chart
  bind:context
  {data}
  {xDomain}
  {y}
  yBaseline={0}
  yNice
  {radial}
  padding={radial ? undefined : defaultChartPadding({ axis, legend })}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'quadtree-x',
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
          xDomain = e.brush.x;
          brushProps.onBrushEnd?.(e);
        },
      }
    : false}
  {seriesState}
  {axis}
  {grid}
  {rule}
  {legend}
  {highlight}
  tooltip={tooltipProp}
  props={{
    ...props,
    highlight: {
      ...props.highlight,
      onPointClick,
    },
  }}
>
  {#snippet marks(snippetProps)}
    {#if typeof marks === 'function'}
      {@render marks(snippetProps)}
    {:else}
      {#each seriesState.visibleSeries as s (s.key)}
        <Area
          seriesKey={s.key}
          fillOpacity={0.3}
          line={{
            ...props.line,
            ...getObjectOrNull(props.area?.line),
            ...getObjectOrNull(s.props?.line),
          }}
          {...props.area}
          {...s.props}
        />
      {/each}
    {/if}
  {/snippet}
</Chart>
