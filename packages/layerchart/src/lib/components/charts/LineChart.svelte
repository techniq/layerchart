<script lang="ts" module>
  export type LineChartExtraSnippetProps<TData> = {
    getSplineProps: (
      s: SeriesData<TData, typeof Spline>,
      i: number
    ) => ComponentProps<typeof Spline>;
    getLabelsProps: (
      s: SeriesData<TData, typeof Spline>,
      i: number
    ) => ComponentProps<typeof Labels<TData>>;
    getPointsProps: (
      s: SeriesData<TData, typeof Spline>,
      i: number
    ) => ComponentProps<typeof Points>;
    getHighlightProps: (
      s: SeriesData<TData, typeof Spline>,
      i: number
    ) => ComponentProps<typeof Highlight>;
    getGridProps: () => ComponentProps<typeof Grid>;
    getAxisProps: (axisDirection?: 'x' | 'y') => ComponentProps<typeof Axis>;
    getRuleProps: () => ComponentProps<typeof Rule>;
  };

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

  export type LineChartProps<TData> = SimplifiedChartProps<
    TData,
    typeof Spline,
    LineChartExtraSnippetProps<TData>
  > & {
    /**
     * The orientation of the line chart.
     *
     * @default 'horizontal'
     */
    orientation?: 'vertical' | 'horizontal';

    props?: LineChartPropsObjProp;

    spline?: SimplifiedChartSnippet<
      TData,
      typeof Spline,
      LineChartExtraSnippetProps<TData> & {
        props: ComponentProps<typeof Spline>;
        /**
         * The index of the series currently being iterated over.
         */
        seriesIndex: number;
      }
    >;

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
  import { onMount, type ComponentProps } from 'svelte';
  import { cls } from '@layerstack/tailwind';

  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import ChartClipPath from '../ChartClipPath.svelte';
  import Grid from '../Grid.svelte';
  import Highlight, { type HighlightPointData } from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Layer from '../layers/Layer.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Spline from '../Spline.svelte';

  import { chartDataArray, defaultChartPadding, findRelatedData } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import type {
    SeriesData,
    SimplifiedChartProps,
    SimplifiedChartPropsObject,
    SimplifiedChartSnippet,
  } from './types.js';
  import { SeriesState } from '$lib/states/series.svelte.js';
  import { createLegendProps } from './utils.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';
  import DefaultTooltip from './DefaultTooltip.svelte';
  import ChartAnnotations from './ChartAnnotations.svelte';
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
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    labels = false,
    legend = false,
    points = false,
    rule = true,
    onTooltipClick = () => {},
    onPointClick,
    props = {},
    layer: layerProp,
    profile = false,
    debug: debugProp,
    tooltipContext = true,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    marks,
    aboveMarks,
    spline,
    tooltip,
    highlight = true,
    annotations = [],
    context = $bindable(),
    ...restProps
  }: LineChartProps<TData> = $props();

  const layer = $derived(layerProp ?? settings.layer);
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

  function getSplineProps(s: SeriesData<TData, typeof Spline>, i: number) {
    const splineProps: ComponentProps<typeof Spline> = {
      data: s.data,
      x: isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      y: !isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      stroke: s.color,
      opacity:
        // Checking `visibleSeries.length <= 1` fixes re-animated tweened areas on hover
        seriesState.visibleSeries.length <= 1 || seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
      ...props.spline,
      ...s.props,
      class: cls(props.spline?.class, s.props?.class),
    };

    return splineProps;
  }

  function getPointsProps(s: SeriesData<TData, typeof Spline>, i: number) {
    const pointsProps: ComponentProps<typeof Points> = {
      data: s.data,
      x: isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      y: !isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      fill: s.color,
      stroke: 'var(--color-surface-100, light-dark(white, black))',
      opacity: seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
      ...props.points,
      ...(typeof points === 'object' ? points : null),
      class: cls(props.points?.class, typeof points === 'object' && points.class),
    };

    return pointsProps;
  }

  function getLabelsProps(s: SeriesData<TData, typeof Spline>, i: number) {
    const labelsProps: ComponentProps<typeof Labels<TData>> = {
      data: s.data,
      x: isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      y: !isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      opacity: seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
      ...props.labels,
      ...(typeof labels === 'object' ? labels : null),
      class: cls(props.labels?.class, typeof labels === 'object' && labels.class),
    };

    return labelsProps;
  }

  function getHighlightProps(
    s: SeriesData<TData, typeof Spline>,
    i: number
  ): ComponentProps<typeof Highlight> {
    if (!context || !context.tooltip.data) return {};
    const seriesTooltipData =
      s.data && context.tooltip.data
        ? (findRelatedData(s.data, context.tooltip.data, context.x) ?? {})
        : null;
    const highlightPointsProps =
      typeof props.highlight?.points === 'object' ? props.highlight.points : null;

    return {
      data: seriesTooltipData,
      x: isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      y: !isVertical ? (s.value ?? (s.data ? undefined : s.key)) : undefined,
      lines: i === 0,
      onPointClick: onPointClick
        ? (e, detail) => onPointClick(e, { ...detail, series: s })
        : undefined,
      onPointEnter: () => (seriesState.highlightKey = s.key),
      onPointLeave: () => (seriesState.highlightKey = null),
      opacity: seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
      ...props.highlight,
      points:
        props.highlight?.points == false
          ? false
          : {
              ...highlightPointsProps,
              fill: s.color,
            },
    };
  }

  function getLegendProps(): ComponentProps<typeof Legend> {
    return createLegendProps({
      props: {
        ...(typeof legend === 'object' ? legend : null),
        ...props.legend,
      },
    });
  }

  function getGridProps(): ComponentProps<typeof Grid> {
    return {
      x: radial,
      y: true,
      ...(typeof grid === 'object' ? grid : null),
      ...props.grid,
    };
  }

  function getAxisProps(axisDirection?: 'x' | 'y'): ComponentProps<typeof Axis> {
    if (axisDirection === 'y') {
      return {
        placement: radial ? 'radius' : 'left',
        ...(typeof axis === 'object' ? axis : null),
        ...props.yAxis,
      };
    }
    return {
      placement: radial ? 'angle' : 'bottom',
      ...(typeof axis === 'object' ? axis : null),
      ...props.xAxis,
    };
  }

  function getRuleProps(): ComponentProps<typeof Rule> {
    return {
      x: 0,
      y: 0,
      ...(typeof rule === 'object' ? rule : null),
      ...props.rule,
    };
  }

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  if (profile) {
    console.time('LineChart render');
    onMount(() => {
      console.timeEnd('LineChart render');
    });
  }

  setTooltipMetaContext({
    type: 'line',
    get visibleSeries() {
      return seriesState.visibleSeries;
    },
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
  padding={radial ? undefined : defaultChartPadding(axis, legend)}
  {...restProps}
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
  rule={rule as any}
  legend={legend as any}
  highlight={highlight as any}
  {props}
  tooltip={tooltip as any}
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
