<script lang="ts" module>
  export type AreaChartPropsObjProp = Pick<
    SimplifiedChartPropsObject,
    | 'area'
    | 'brush'
    | 'canvas'
    | 'grid'
    | 'highlight'
    | 'labels'
    | 'legend'
    | 'line'
    | 'points'
    | 'rule'
    | 'svg'
    | 'tooltip'
    | 'xAxis'
    | 'yAxis'
  >;

  export type AreaChartProps<TData> = SimplifiedChartProps<TData, typeof Area> & {
    /**
     * A callback function called when a point in the chart is clicked.
     *
     * @param e - the original event that triggered the `onPointClick`
     * @param details - an object containing the highlighted point data and series data
     */
    onPointClick?: (
      e: MouseEvent,
      details: { data: HighlightPointData; series: SeriesData<TData, typeof Area> }
    ) => void;

    /**
     * Additional props to be passed to the components rendered internally by the
     * `AreaChart` component. This is useful for customizing the behavior of the individual
     * components, without having to fully override them via a snippet.
     */
    props?: AreaChartPropsObjProp;
  };
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';

  import Area from '../Area.svelte';
  import Chart, { type ChartProps } from '../Chart.svelte';
  import Highlight, { type HighlightPointData } from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Points from '../Points.svelte';

  import {
    chartDataArray,
    defaultChartPadding,
    findRelatedData,
    type Accessor,
  } from '$lib/utils/common.js';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import { SeriesState, type StackLayout } from '$lib/states/series.svelte.js';
  import type { BrushDomainType } from '../../states/brush.svelte.js';
  import { getSettings } from '$lib/contexts/settings.js';

  const settings = getSettings();

  let {
    data = [],
    x,
    y,
    xDomain,
    radial = false,
    series: seriesProp,
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    labels: labelsProp = false,
    legend = false,
    points: pointsProp = false,
    tooltipContext = true,
    highlight: highlightProp = true,
    rule = true,
    onTooltipClick = () => {},
    onPointClick,
    props = {},
    profile = false,
    debug: debugProp,
    marks,
    tooltip: tooltipProp,
    context = $bindable(),
    ...restProps
  }: AreaChartProps<TData> = $props();

  const debug = $derived(debugProp ?? settings.debug);

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

  // Chart data uses series data if available, otherwise base data
  const chartData = $derived(
    (seriesState.allSeriesData.length
      ? seriesState.allSeriesData
      : chartDataArray(data)) as Array<TData>
  );

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  // Highlight needs per-series props for stacked data
  function getHighlightProps(s: SeriesData<TData, typeof Area>): ComponentProps<typeof Highlight> {
    if (!context) return {};
    const seriesTooltipData =
      s.data && context.tooltip.data
        ? (findRelatedData(s.data, context.tooltip.data, context.x) ?? {})
        : null;
    const highlightPointsProps =
      typeof props.highlight?.points === 'object' ? props.highlight.points : null;

    const stackAccessors = seriesState.isStacked ? seriesState.getStackAccessors(s.key) : null;

    return {
      data: seriesTooltipData,
      y: stackAccessors?.y1 ?? s.value ?? (s.data ? undefined : s.key),
      lines: seriesState.visibleSeries[0]?.key === s.key,
      onPointClick: onPointClick
        ? (e, detail) => onPointClick(e, { ...detail, series: s })
        : undefined,
      onPointEnter: () => (seriesState.highlightKey = s.key),
      onPointLeave: () => (seriesState.highlightKey = null),
      ...props.highlight,
      ...(typeof highlightProp === 'object' ? highlightProp : null),
      opacity: seriesState.highlightKey && seriesState.highlightKey !== s.key ? 0.1 : 1,
      points:
        props.highlight?.points == false
          ? false
          : {
              ...highlightPointsProps,
              fill: s.color,
            },
    };
  }

  if (profile) {
    console.time('AreaChart render');
    onMount(() => {
      console.timeEnd('AreaChart render');
    });
  }

  // Configure tooltip behavior
  $effect(() => {
    if (context?.tooltipState) {
      context.tooltipState.config = {
        stackedSeries: seriesState.isStacked,
      };
    }
  });

  function resolveAccessor(acc: Accessor<TData> | undefined) {
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
    if (acc) return acc;
    return seriesState.visibleSeries.map((s) => s.value ?? s.key);
  }

  // Axis format for stackExpand
  const yAxisFormat = $derived(
    seriesState.stackLayout === 'stackExpand' ? 'percentRound' : undefined
  );
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:context
  data={chartData}
  {x}
  {xDomain}
  y={resolveAccessor(y)}
  yBaseline={0}
  yNice
  {radial}
  padding={radial ? undefined : defaultChartPadding({ axis, legend })}
  {...restProps as Partial<ChartProps<TData>>}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'quadtree-x',
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
  {axis}
  {grid}
  {rule}
  {legend}
  tooltip={tooltipProp}
  props={{
    ...props,
    yAxis: { format: yAxisFormat, ...props.yAxis },
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
          opacity={seriesState.visibleSeries.length <= 1 || seriesState.isHighlighted(s.key, true)
            ? 1
            : 0.1}
          line={{
            stroke: s.color,
            opacity:
              seriesState.visibleSeries.length <= 1 || seriesState.isHighlighted(s.key, true)
                ? 1
                : 0.1,
            ...props.line,
            ...(typeof props.area?.line === 'object' ? props.area.line : null),
            ...(typeof s.props?.line === 'object' ? s.props.line : null),
          }}
          {...props.area}
          {...s.props}
        />
      {/each}
    {/if}
  {/snippet}

  {#snippet points(snippetProps)}
    {#if typeof pointsProp === 'function'}
      {@render pointsProp(snippetProps)}
    {:else if pointsProp}
      {#each seriesState.visibleSeries as s (s.key)}
        <Points
          seriesKey={s.key}
          stroke="var(--color-surface-100, light-dark(white, black))"
          opacity={seriesState.isHighlighted(s.key, true) ? 1 : 0.1}
          {...props.points}
          {...typeof pointsProp === 'object' ? pointsProp : null}
        />
      {/each}
    {/if}
  {/snippet}

  {#snippet highlight(snippetProps)}
    {#if typeof highlightProp === 'function'}
      {@render highlightProp(snippetProps)}
    {:else if highlightProp}
      {#each seriesState.visibleSeries as s (s.key)}
        <Highlight {...getHighlightProps(s)} />
      {/each}
    {/if}
  {/snippet}

  {#snippet labels(snippetProps)}
    {#if typeof labelsProp === 'function'}
      {@render labelsProp(snippetProps)}
    {:else if labelsProp}
      {#each seriesState.visibleSeries as s (s.key)}
        <Labels
          seriesKey={s.key}
          stroke="var(--color-surface-100, light-dark(white, black))"
          opacity={seriesState.isHighlighted(s.key, true) ? 1 : 0.1}
          {...props.labels}
          {...typeof labelsProp === 'object' ? labelsProp : null}
        />
      {/each}
    {/if}
  {/snippet}
</Chart>
