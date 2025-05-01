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
     * The event to be dispatched when the point is clicked.
     */
    onPointClick?: (
      e: MouseEvent,
      details: { data: HighlightPointData; series: SeriesData<TData, typeof Spline> }
    ) => void;

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
  };
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import ChartClipPath from '../ChartClipPath.svelte';
  import Grid from '../Grid.svelte';
  import Highlight, { type HighlightPointData } from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Layer from '../layout/Layer.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Spline from '../Spline.svelte';

  import {
    accessor,
    chartDataArray,
    defaultChartPadding,
    findRelatedData,
  } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import type {
    SeriesData,
    SimplifiedChartProps,
    SimplifiedChartPropsObject,
    SimplifiedChartSnippet,
  } from './types.js';
  import { createLegendProps, createSeriesState } from './utils.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';
  import { layerClass } from '$lib/utils/attributes.js';
  import DefaultTooltip from './DefaultTooltip.svelte';
  import ChartAnnotations from './ChartAnnotations.svelte';

  let {
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    radial = false,
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
    renderContext = 'svg',
    profile = false,
    debug = false,
    xScale: xScaleProp,
    tooltip = true,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    spline,
    highlight = true,
    annotations = [],
    context = $bindable(),
    ...restProps
  }: LineChartProps<TData> = $props();

  const series = $derived(
    seriesProp === undefined
      ? [{ key: 'default', value: yProp, color: 'var(--color-primary)' }]
      : seriesProp
  );
  const seriesState = createSeriesState(() => series);

  const chartData = $derived(
    (seriesState.allSeriesData.length
      ? seriesState.allSeriesData
      : chartDataArray(data)) as Array<TData>
  );

  // Default xScale based on first data's `x` value
  const xScale = $derived(
    xScaleProp ?? (accessor(xProp)(chartData[0]) instanceof Date ? scaleTime() : scaleLinear())
  );

  function getSplineProps(s: SeriesData<TData, typeof Spline>, i: number) {
    const splineProps: ComponentProps<typeof Spline> = {
      data: s.data,
      y: s.value ?? (s.data ? undefined : s.key),
      stroke: s.color,
      ...props.spline,
      ...s.props,
      class: cls(
        layerClass('line-chart-line'),
        'transition-opacity',
        // Checking `visibleSeries.length > 1` fixes re-animated tweened areas on hover
        seriesState.visibleSeries.length > 1 &&
          seriesState.highlightKey.current &&
          seriesState.highlightKey.current !== s.key &&
          'opacity-10',
        props.spline?.class,
        s.props?.class
      ),
    };

    return splineProps;
  }

  function getPointsProps(s: SeriesData<TData, typeof Spline>, i: number) {
    const pointsProps: ComponentProps<typeof Points> = {
      data: s.data,
      y: s.value ?? (s.data ? undefined : s.key),
      fill: s.color,
      ...props.points,
      ...(typeof points === 'object' ? points : null),
      class: cls(
        'stroke-surface-200 transition-opacity',
        seriesState.highlightKey.current &&
          seriesState.highlightKey.current !== s.key &&
          'opacity-10',
        props.points?.class,
        typeof points === 'object' && points.class
      ),
    };

    return pointsProps;
  }

  function getLabelsProps(s: SeriesData<TData, typeof Spline>, i: number) {
    const labelsProps: ComponentProps<typeof Labels<TData>> = {
      data: s.data,
      y: s.value ?? (s.data ? undefined : s.key),
      ...props.labels,
      ...(typeof labels === 'object' ? labels : null),
      class: cls(
        'stroke-surface-200 transition-opacity',
        seriesState.highlightKey.current &&
          seriesState.highlightKey.current !== s.key &&
          'opacity-10',
        props.labels?.class,
        typeof labels === 'object' && labels.class
      ),
    };

    return labelsProps;
  }

  const highlightPointsProps = $derived(
    typeof props.highlight?.points === 'object' ? props.highlight.points : null
  );

  function getHighlightProps(
    s: SeriesData<TData, typeof Spline>,
    i: number
  ): ComponentProps<typeof Highlight> {
    if (!context || !context.tooltip.data) return {};
    const seriesTooltipData =
      s.data && context.tooltip.data
        ? findRelatedData(s.data, context.tooltip.data, context.x)
        : null;

    return {
      data: seriesTooltipData,
      y: s.value ?? (s.data ? undefined : s.key),
      lines: i === 0,
      onPointClick: onPointClick
        ? (e, detail) => onPointClick(e, { ...detail, series: s })
        : undefined,
      onPointEnter: () => (seriesState.highlightKey.current = s.key),
      onPointLeave: () => (seriesState.highlightKey.current = null),
      ...props.highlight,
      points:
        props.highlight?.points == false
          ? false
          : {
              ...highlightPointsProps,
              fill: s.color,
              class: cls(
                'transition-opacity',
                seriesState.highlightKey.current &&
                  seriesState.highlightKey.current !== s.key &&
                  'opacity-10',
                highlightPointsProps?.class
              ),
            },
    };
  }

  function getLegendProps(): ComponentProps<typeof Legend> {
    return createLegendProps({
      seriesState,
      props: {
        ...props.legend,
        ...(typeof legend === 'object' ? legend : null),
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
        format: (value) => format(value, undefined, { variant: 'short' }),
        ...(typeof axis === 'object' ? axis : null),
        ...props.yAxis,
      };
    }
    return {
      placement: radial ? 'angle' : 'bottom',
      format: (value) => format(value, undefined, { variant: 'short' }),
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
<Chart
  bind:context
  data={chartData}
  x={xProp}
  {xDomain}
  {xScale}
  y={yProp ?? series.map((s) => s.value ?? s.key)}
  yBaseline={0}
  yNice
  {radial}
  padding={radial ? undefined : defaultChartPadding(axis, legend)}
  {...restProps}
  tooltip={tooltip === false
    ? false
    : {
        mode: 'bisect-x',
        onclick: onTooltipClick,
        debug,
        ...props.tooltip?.context,
      }}
  brush={brush && (brush === true || brush.mode == undefined || brush.mode === 'integrated')
    ? {
        axis: 'x',
        resetOnEnd: true,
        xDomain,
        ...brushProps,
        onBrushEnd: (e) => {
          xDomain = e.xDomain;
          brushProps.onBrushEnd?.(e);
        },
      }
    : false}
>
  {#snippet children({ context })}
    {@const snippetProps = {
      context,
      series,
      visibleSeries: seriesState.visibleSeries,
      getLabelsProps,
      getPointsProps,
      getSplineProps,
      getHighlightProps,
      getLegendProps,
      getGridProps,
      getAxisProps,
      getRuleProps,
      highlightKey: seriesState.highlightKey.current,
      setHighlightKey: seriesState.highlightKey.set,
    }}
    {#if childrenProp}
      {@render childrenProp(snippetProps)}
    {:else}
      {@render belowContext?.(snippetProps)}
      <!-- TODO: Always use `Svg` until `Pattern` supports `Canvas` (issue #307) -->
      <Layer type="svg">
        <ChartAnnotations
          {annotations}
          layer="below"
          highlightKey={seriesState.highlightKey.current}
          visibleSeries={seriesState.visibleSeries}
        />
      </Layer>

      <Layer
        type={renderContext}
        {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
        center={radial}
        {debug}
      >
        {#if typeof grid === 'function'}
          {@render grid(snippetProps)}
        {:else if grid}
          <Grid {...getGridProps()} />
        {/if}

        <ChartClipPath disabled={!brush}>
          {@render belowMarks?.(snippetProps)}
          {#if marks}
            {@render marks(snippetProps)}
          {:else}
            {#each seriesState.visibleSeries as s, i (s.key)}
              {#if typeof spline === 'function'}
                {@render spline({ ...snippetProps, props: getSplineProps(s, i), seriesIndex: i })}
              {:else}
                <Spline {...getSplineProps(s, i)} />
              {/if}
            {/each}
          {/if}

          {@render aboveMarks?.(snippetProps)}
        </ChartClipPath>

        {#if typeof axis === 'function'}
          {@render axis(snippetProps)}

          {#if typeof rule === 'function'}
            {@render rule(snippetProps)}
          {:else if rule}
            <Rule {...getRuleProps()} />
          {/if}
        {:else if axis}
          {#if axis !== 'x'}
            <Axis {...getAxisProps('y')} />
          {/if}

          {#if axis !== 'y'}
            <Axis {...getAxisProps('x')} />
          {/if}

          {#if typeof rule === 'function'}
            {@render rule(snippetProps)}
          {:else if rule}
            <Rule {...getRuleProps()} />
          {/if}
        {/if}

        <!-- Use `full` to allow labels on edge to not be cropped (bleed into padding) -->
        <ChartClipPath disabled={!brush} full>
          {#if typeof points === 'function'}
            {@render points(snippetProps)}
          {:else if points}
            {#each seriesState.visibleSeries as s, i (s.key)}
              <Points {...getPointsProps(s, i)} />
            {/each}
          {/if}

          {#if typeof labels === 'function'}
            {@render labels(snippetProps)}
          {:else if labels}
            {#each seriesState.visibleSeries as s, i (s.key)}
              <Labels {...getLabelsProps(s, i)} />
            {/each}
          {/if}

          {#if typeof highlight === 'function'}
            {@render highlight(snippetProps)}
          {:else if highlight}
            {#each seriesState.visibleSeries as s, i (s.key)}
              <Highlight {...getHighlightProps(s, i)} />
            {/each}
          {/if}
        </ChartClipPath>
      </Layer>

      <!-- TODO: Always use `Svg` until `Pattern` supports `Canvas` (issue #307) -->
      <Layer type="svg" pointerEvents={false}>
        <ChartAnnotations
          {annotations}
          layer="above"
          highlightKey={seriesState.highlightKey.current}
          visibleSeries={seriesState.visibleSeries}
        />
      </Layer>

      {@render aboveContext?.(snippetProps)}

      {#if typeof legend === 'function'}
        {@render legend(snippetProps)}
      {:else if legend}
        <Legend {...getLegendProps()} />
      {/if}

      {#if typeof tooltip === 'function'}
        {@render tooltip(snippetProps)}
      {:else if tooltip}
        <DefaultTooltip tooltipProps={props.tooltip} {seriesState} canHaveTotal />
      {/if}
    {/if}
  {/snippet}
</Chart>
