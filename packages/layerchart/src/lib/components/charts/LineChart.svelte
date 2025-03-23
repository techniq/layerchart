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
  };
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Axis from '../Axis.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart.svelte';
  import ChartClipPath from '../ChartClipPath.svelte';
  import Grid from '../Grid.svelte';
  import Highlight, { type HighlightPointData } from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Spline from '../Spline.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import {
    accessor,
    chartDataArray,
    defaultChartPadding,
    findRelatedData,
  } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import { createHighlightKey } from './utils.svelte.js';
  import { createSelectionState } from '$lib/stores/selectionState.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';
  import { layerClass } from 'layerchart/utils/attributes.js';

  let {
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    radial = false,
    series = [{ key: 'default', value: yProp, color: 'var(--color-primary)' }],
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    labels = false,
    legend = false,
    points = false,
    rule = true,
    tooltipContext,
    onTooltipClick = () => {},
    onPointClick,
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    xScale: xScaleProp,
    tooltip,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    highlight,
    context = $bindable(),
    ...restProps
  }: LineChartProps<TData> = $props();

  const isDefaultSeries = $derived(series.length === 1 && series[0].key === 'default');

  const allSeriesData = $derived(
    series
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData>
  );

  const chartData = $derived(
    (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<TData>
  );

  // Default xScale based on first data's `x` value
  const xScale = $derived(
    xScaleProp ?? (accessor(xProp)(chartData[0]) instanceof Date ? scaleTime() : scaleLinear())
  );

  const highlightKey = createHighlightKey<TData, typeof Spline>();

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
        visibleSeries.length > 1 &&
          highlightKey.current &&
          highlightKey.current !== s.key &&
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
        highlightKey.current && highlightKey.current !== s.key && 'opacity-10',
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
        highlightKey.current && highlightKey.current !== s.key && 'opacity-10',
        props.labels?.class,
        typeof labels === 'object' && labels.class
      ),
    };

    return labelsProps;
  }

  const selectedSeries = createSelectionState();
  const visibleSeries = $derived(
    series.filter((s) => selectedSeries.isEmpty() || selectedSeries.isSelected(s.key))
  );

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
      return visibleSeries;
    },
  });
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:tooltipContext
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
  {#snippet children({ context, geoContext, brushContext, tooltipContext, transformContext })}
    {@const snippetProps = {
      context,
      tooltipContext,
      brushContext,
      geoContext,
      transformContext,
      series,
      visibleSeries,
      getLabelsProps,
      getPointsProps,
      getSplineProps,
      highlightKey: highlightKey.current,
      setHighlightKey: highlightKey.set,
    }}
    {#if childrenProp}
      {@render childrenProp(snippetProps)}
    {:else}
      {@render belowContext?.(snippetProps)}
      {@const Component = renderContext === 'canvas' ? Canvas : Svg}
      <Component
        this={renderContext === 'canvas' ? Canvas : Svg}
        {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
        center={radial}
        {debug}
      >
        {#if typeof grid === 'function'}
          {@render grid(snippetProps)}
        {:else if grid}
          <Grid x={radial} y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}

        <ChartClipPath disabled={!brush}>
          {@render belowMarks?.(snippetProps)}
          {#if marks}
            {@render marks(snippetProps)}
          {:else}
            {#each visibleSeries as s, i (s.key)}
              <Spline {...getSplineProps(s, i)} />
            {/each}
          {/if}

          {@render aboveMarks?.(snippetProps)}
        </ChartClipPath>

        {#if typeof axis === 'function'}
          {@render axis(snippetProps)}
        {:else if axis}
          {#if axis !== 'x'}
            <Axis
              placement={radial ? 'radius' : 'left'}
              format={(value) => format(value, undefined, { variant: 'short' })}
              {...typeof axis === 'object' ? axis : null}
              {...props.yAxis}
            />
          {/if}

          {#if axis !== 'y'}
            <Axis
              placement={radial ? 'angle' : 'bottom'}
              format={(value) => format(value, undefined, { variant: 'short' })}
              {...typeof axis === 'object' ? axis : null}
              {...props.xAxis}
            />
          {/if}

          {#if typeof rule === 'function'}
            {@render rule(snippetProps)}
          {:else if rule}
            <Rule x={0} y={0} {...typeof rule === 'object' ? rule : null} {...props.rule} />
          {/if}
        {/if}

        <!-- Use `full` to allow labels on edge to not be cropped (bleed into padding) -->
        <ChartClipPath disabled={!brush} full>
          {#if points}
            {#each visibleSeries as s, i (s.key)}
              <Points {...getPointsProps(s, i)} />
            {/each}
          {/if}

          {#if labels}
            {#each visibleSeries as s, i (s.key)}
              <Labels {...getLabelsProps(s, i)} />
            {/each}
          {/if}

          {#if highlight}
            {@render highlight(snippetProps)}
          {:else}
            {#each visibleSeries as s, i (s.key)}
              {@const seriesTooltipData =
                s.data && tooltipContext.data
                  ? findRelatedData(s.data, tooltipContext.data, context.x)
                  : null}
              {@const highlightPointsProps =
                typeof props.highlight?.points === 'object' ? props.highlight.points : null}

              <Highlight
                data={seriesTooltipData}
                y={s.value ?? (s.data ? undefined : s.key)}
                lines={i === 0}
                onPointClick={onPointClick
                  ? (e, detail) => onPointClick(e, { ...detail, series: s })
                  : undefined}
                onPointEnter={() => (highlightKey.current = s.key)}
                onPointLeave={() => (highlightKey.current = null)}
                {...props.highlight}
                points={props.highlight?.points == false
                  ? false
                  : {
                      ...highlightPointsProps,
                      fill: s.color,
                      class: cls(
                        'transition-opacity',
                        highlightKey.current && highlightKey.current !== s.key && 'opacity-10',
                        highlightPointsProps?.class
                      ),
                    }}
              />
            {/each}
          {/if}
        </ChartClipPath>
      </Component>

      {@render aboveContext?.(snippetProps)}

      {#if typeof legend === 'function'}
        {@render legend(snippetProps)}
      {:else if legend}
        <Legend
          scale={isDefaultSeries
            ? undefined
            : scaleOrdinal(
                series.map((s) => s.key),
                series.map((s) => s.color)
              )}
          tickFormat={(key) => series.find((s) => s.key === key)?.label ?? key}
          placement="bottom"
          variant="swatches"
          onclick={(_, item) => selectedSeries.toggleSelected(item.value)}
          onpointerenter={(_, item) => (highlightKey.current = item.value)}
          onpointerleave={(_) => (highlightKey.current = null)}
          {...props.legend}
          {...typeof legend === 'object' ? legend : null}
          classes={{
            item: (item) =>
              visibleSeries.length && !visibleSeries.some((s) => s.key === item.value)
                ? 'opacity-50'
                : '',
            ...props.legend?.classes,
            ...(typeof legend === 'object' ? legend.classes : null),
          }}
        />
      {/if}

      {#if typeof tooltip === 'function'}
        {@render tooltip(snippetProps)}
      {:else}
        <Tooltip.Root {...props.tooltip?.root}>
          {#snippet children({ payload })}
            <Tooltip.Header value={payload[0].label} {format} {...props.tooltip?.header} />
            <Tooltip.List {...props.tooltip?.list}>
              {#each payload as p, i (i)}
                <Tooltip.Item
                  label={p.name}
                  value={p.value}
                  color={p.color}
                  {format}
                  onpointerenter={() => (highlightKey.current = p.key)}
                  onpointerleave={() => (highlightKey.current = null)}
                  {...props.tooltip?.item}
                />
              {/each}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/if}
    {/if}
  {/snippet}
</Chart>
