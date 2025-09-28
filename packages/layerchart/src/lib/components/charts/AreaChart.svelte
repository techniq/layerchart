<script lang="ts" module>
  /**
   * The additional snippet props passed to the various snippets belonging
   * to the `AreaChart` component.
   */
  export type AreaChartExtraSnippetProps<TData> = {
    getAreaProps: (s: SeriesData<TData, typeof Area>, i: number) => ComponentProps<typeof Area>;
    getLabelsProps: (
      s: SeriesData<TData, typeof Area>,
      i: number
    ) => ComponentProps<typeof Labels<TData>>;
    getPointsProps: (s: SeriesData<TData, typeof Area>, i: number) => ComponentProps<typeof Points>;
    getHighlightProps: (
      s: SeriesData<TData, typeof Area>,
      i: number
    ) => ComponentProps<typeof Highlight>;
    getGridProps: () => ComponentProps<typeof Grid>;
    getAxisProps: (axisDirection?: 'x' | 'y') => ComponentProps<typeof Axis>;
    getRuleProps: () => ComponentProps<typeof Rule>;
  };

  /**
   * The accepted props via the `props` prop of the `AreaChart` component.
   */
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

  export type AreaChartProps<TData> = SimplifiedChartProps<
    TData,
    typeof Area,
    AreaChartExtraSnippetProps<TData>
  > & {
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
  import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import Area from '../Area.svelte';
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

  import {
    accessor,
    chartDataArray,
    defaultChartPadding,
    findRelatedData,
    type Accessor,
  } from '$lib/utils/common.js';
  import { asAny } from '$lib/utils/types.js';
  import Spline from '../Spline.svelte';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import { SeriesState } from '$lib/states/series.svelte.js';
  import { createLegendProps } from './utils.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';
  import DefaultTooltip from './DefaultTooltip.svelte';
  import ChartAnnotations from './ChartAnnotations.svelte';
  import type { BrushDomainType } from '../BrushContext.svelte';

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
    labels = false,
    legend = false,
    points = false,
    tooltip = true,
    highlight = true,
    annotations = [],
    rule = true,
    onTooltipClick = () => {},
    onPointClick,
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
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

  const seriesState = new SeriesState(() => series);

  const stackSeries = $derived(seriesLayout.startsWith('stack'));

  const chartData = $derived.by(() => {
    let _chartData = (
      seriesState.allSeriesData.length ? seriesState.allSeriesData : chartDataArray(data)
    ) as Array<TData>;
    if (stackSeries) {
      const seriesKeys = seriesState.visibleSeries.map((s) => s.key);
      const offset =
        seriesLayout === 'stackExpand'
          ? stackOffsetExpand
          : seriesLayout === 'stackDiverging'
            ? stackOffsetDiverging
            : stackOffsetNone;

      const stackData = stack()
        .keys(seriesKeys)
        .value((d, key) => {
          const s = series.find((d) => d.key === key)!;
          const value = accessor(s.value ?? y ?? s.key)(d as any);
          return value;
        })
        .offset(offset)(_chartData as any[]);

      // If series has data, add `stackData` to each data point
      for (let [seriesIndex, s] of series.entries()) {
        if (s.data) {
          s.data = s.data.map((d, i) => {
            return {
              ...d,
              stackData: stackData[seriesIndex][i],
            };
          });
        }
      }

      // Add `stackData` to each data point
      _chartData = _chartData.map((d, i) => {
        return {
          ...d,
          stackData: stackData.map((sd) => sd[i]),
        };
      });
    }

    return _chartData;
  });

  function isStackData(d: TData): d is TData & { stackData: any[] } {
    return d && typeof d === 'object' && 'stackData' in d;
  }

  /**
   * If series has data, return the stackData from series (enriched when setting up `chartData`)
   */
  function getStackData(
    s: SeriesData<TData, typeof Area>,
    d: TData & { stackData: any[] },
    i: number
  ) {
    if (s.data) {
      return d.stackData;
    }
    // TODO: Sometimes this returns `undefined` when toggling series visibility when legend overlaps chart container.  Return empty array to be more defensive
    return d.stackData[i] ?? [];
  }

  function getAreaProps(s: SeriesData<TData, typeof Area>, i: number): ComponentProps<typeof Area> {
    const lineProps: ComponentProps<typeof Spline> = {
      ...props.line,
      ...(typeof props.area?.line === 'object' ? props.area.line : null),
      ...(typeof s.props?.line === 'object' ? s.props.line : null),
    };

    return {
      data: s.data,
      y0: stackSeries
        ? (d) => getStackData(s, d, i)[0]
        : Array.isArray(s.value)
          ? s.value[0]
          : undefined,
      y1: stackSeries
        ? (d) => getStackData(s, d, i)[1]
        : Array.isArray(s.value)
          ? s.value[1]
          : (s.value ?? (s.data ? undefined : s.key)),
      fill: s.color,
      fillOpacity: 0.3,
      opacity:
        // Checking `visibleSeries.length <= 1` fixes re-animated tweened areas on hover
        seriesState.visibleSeries.length <= 1 || seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
      ...props.area,
      ...s.props,
      class: cls(props.area?.class, s.props?.class),
      line: {
        stroke: s.color,
        opacity:
          // Checking `visibleSeries.length <= 1` fixes re-animated tweened areas on hover
          seriesState.visibleSeries.length <= 1 || seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
        ...lineProps,
      },
    };
  }

  function getPointsProps(
    s: SeriesData<TData, typeof Area>,
    i: number
  ): ComponentProps<typeof Points> {
    return {
      data: s.data,
      y: stackSeries
        ? (d) => getStackData(s, d, i)[1]
        : Array.isArray(s.value)
          ? s.value[1]
          : (s.value ?? (s.data ? undefined : s.key)),
      fill: s.color,
      stroke: 'var(--color-surface-100, light-dark(white, black))',
      opacity: seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
      ...props.points,
      ...(typeof points === 'object' ? points : null),
      class: cls(props.points?.class, typeof points === 'object' && points.class),
    };
  }

  function getLabelsProps(
    s: SeriesData<TData, typeof Area>,
    i: number
  ): ComponentProps<typeof Labels<TData>> {
    return {
      data: s.data,
      y: stackSeries
        ? (d) => (isStackData(d) ? getStackData(s, d, i)[1] : undefined)
        : Array.isArray(s.value)
          ? s.value[1]
          : (s.value ?? (s.data ? undefined : s.key)),
      stroke: 'var(--color-surface-100, light-dark(white, black))',
      opacity: seriesState.isHighlighted(s.key, true) ? 1 : 0.1,
      ...props.labels,
      ...(typeof labels === 'object' ? labels : null),
      class: cls(props.labels?.class, typeof labels === 'object' && labels.class),
    };
  }

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  function getHighlightProps(
    s: SeriesData<TData, typeof Area>,
    i: number
  ): ComponentProps<typeof Highlight> {
    if (!context) return {};
    const seriesTooltipData =
      s.data && context.tooltip.data
        ? (findRelatedData(s.data, context.tooltip.data, context.x) ?? {})
        : null;
    const highlightPointsProps =
      typeof props.highlight?.points === 'object' ? props.highlight.points : null;

    return {
      data: seriesTooltipData,
      y: stackSeries ? (d) => getStackData(s, d, i)[1] : (s.value ?? (s.data ? undefined : s.key)),
      lines: i == 0,
      onPointClick: onPointClick
        ? (e, detail) => onPointClick(e, { ...detail, series: s })
        : undefined,
      onPointEnter: () => (seriesState.highlightKey.current = s.key),
      onPointLeave: () => (seriesState.highlightKey.current = null),
      ...props.highlight,
      opacity:
        seriesState.highlightKey.current && seriesState.highlightKey.current !== s.key ? 0.1 : 1,
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

  if (profile) {
    console.time('AreaChart render');
    onMount(() => {
      console.timeEnd('AreaChart render');
    });
  }

  setTooltipMetaContext({
    type: 'area',
    get stackSeries() {
      return stackSeries;
    },
    get visibleSeries() {
      return seriesState.visibleSeries;
    },
  });

  function resolveAccessor(acc: Accessor<TData> | undefined) {
    if (stackSeries) {
      return (d: TData) =>
        isStackData(d) ? seriesState.visibleSeries.flatMap((s, i) => d.stackData[i]) : undefined;
    }
    if (acc) return acc;
    return seriesState.visibleSeries.map((s) => s.value ?? s.key);
  }

  function getAxisProps(axisDirection?: 'x' | 'y'): ComponentProps<typeof Axis> {
    if (axisDirection === 'y') {
      return {
        placement: radial ? 'radius' : 'left',
        format: seriesLayout === 'stackExpand' ? 'percentRound' : undefined,
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
  padding={radial ? undefined : defaultChartPadding(axis, legend)}
  {...restProps}
  tooltip={tooltip === false
    ? false
    : {
        mode: 'quadtree-x',
        onclick: onTooltipClick,
        debug,
        ...props.tooltip?.context,
        ...(typeof tooltip === 'object' ? tooltip : null),
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
>
  {#snippet children({ context })}
    {@const snippetProps = {
      context,
      series,
      visibleSeries: seriesState.visibleSeries,
      getAreaProps,
      getLabelsProps,
      getPointsProps,
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
          <ChartAnnotations
            {annotations}
            layer="below"
            highlightKey={seriesState.highlightKey.current}
            visibleSeries={seriesState.visibleSeries}
          />

          {@render belowMarks?.(snippetProps)}

          {#if marks}
            {@render marks(snippetProps)}
          {:else}
            {#each seriesState.visibleSeries as s, i (s.key)}
              <Area {...getAreaProps(s, i)} />
            {/each}
          {/if}
        </ChartClipPath>

        {@render aboveMarks?.(snippetProps)}
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

          {#if typeof highlight === 'function'}
            {@render highlight(snippetProps)}
          {:else if highlight}
            {#each seriesState.visibleSeries as s, i (s.key)}
              <Highlight {...getHighlightProps(s, i)} />
            {/each}
          {/if}

          {#if typeof labels === 'function'}
            {@render labels(snippetProps)}
          {:else if labels}
            {#each seriesState.visibleSeries as s, i (s.key)}
              <Labels {...getLabelsProps(s, i)} />
            {/each}
          {/if}

          <ChartAnnotations
            {annotations}
            layer="above"
            highlightKey={seriesState.highlightKey.current}
            visibleSeries={seriesState.visibleSeries}
          />
        </ChartClipPath>
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
        <DefaultTooltip tooltipProps={props.tooltip} {seriesState} canHaveTotal={stackSeries} />
      {/if}
    {/if}
  {/snippet}
</Chart>
