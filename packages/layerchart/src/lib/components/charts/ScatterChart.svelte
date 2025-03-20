<script lang="ts" module>
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import type { AnyScale } from 'layerchart/utils/scales.svelte.js';
  import { onMount, type ComponentProps } from 'svelte';

  export type ScatterChartExtraSnippetProps<TData> = {
    getLabelsProps: (
      s: SeriesData<TData, typeof Points>,
      i: number
    ) => ComponentProps<typeof Labels>;
    getPointsProps: (
      s: SeriesData<TData, typeof Points>,
      i: number
    ) => ComponentProps<typeof Points>;
  };

  export type ScatterChartPropsObjProp = Pick<
    SimplifiedChartPropsObject,
    | 'brush'
    | 'canvas'
    | 'grid'
    | 'highlight'
    | 'labels'
    | 'legend'
    | 'points'
    | 'rule'
    | 'svg'
    | 'tooltip'
    | 'xAxis'
    | 'yAxis'
  >;

  export type ScatterChartProps<TData> = Omit<
    SimplifiedChartProps<TData, typeof Points, ScatterChartExtraSnippetProps<TData>>,
    'radial'
  > & {
    props?: ScatterChartPropsObjProp;
    yDomain?: ComponentProps<typeof BrushContext>['yDomain'];
    yScale?: AnyScale;
  };
</script>

<script lang="ts" generics="TData">
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Axis from '../Axis.svelte';
  import BrushContext from '../BrushContext.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart.svelte';
  import ChartClipPath from '../ChartClipPath.svelte';
  import Grid from '../Grid.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, defaultChartPadding } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import { createHighlightKey } from './utils.svelte.js';
  import { createSelectionState } from 'layerchart/stores/selectionState.svelte.js';

  let {
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    yDomain,
    series = [{ key: 'default', data: chartDataArray(data), color: 'var(--color-primary)' }],
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
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    xScale: xScaleProp,
    yScale: yScaleProp,
    tooltip,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    highlight,
    ...restProps
  }: ScatterChartProps<TData> = $props();

  const isDefaultSeries = $derived(series.length === 1 && series[0].key === 'default');

  // Default xScale based on first data's `x` value
  const xScale = $derived(
    xScaleProp ??
      (accessor(xProp)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear())
  );

  // Default yScale based on first data's `y` value
  const yScale = $derived(
    yScaleProp ??
      (accessor(yProp)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear())
  );

  const selectedSeries = createSelectionState();

  const visibleSeries = $derived(
    series.filter((s) => selectedSeries.isEmpty() || selectedSeries.isSelected(s.key))
  );

  const chartData = $derived(
    visibleSeries
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData>
  );

  const highlightKey = createHighlightKey<TData, typeof Points>();

  function getPointsProps(s: SeriesData<TData, typeof Points>, i: number) {
    const pointsProps: ComponentProps<typeof Points> = {
      data: s.data,
      stroke: s.color,
      fill: s.color,
      fillOpacity: 0.3,
      ...props.points,
      ...s.props,
      class: cls(
        'transition-opacity',
        highlightKey.current && highlightKey.current !== s.key && 'opacity-10',
        props.points?.class,
        s.props?.class
      ),
    };

    return pointsProps;
  }

  function getLabelsProps(s: SeriesData<TData, typeof Points>, i: number) {
    const labelsProps: ComponentProps<typeof Labels> = {
      data: s.data,
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

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  if (profile) {
    console.time('ScatterChart render');
    onMount(() => {
      console.timeEnd('ScatterChart render');
    });
  }
</script>

<Chart
  data={chartData}
  x={xProp}
  {xDomain}
  {xScale}
  y={yProp}
  {yDomain}
  {yScale}
  yNice
  padding={defaultChartPadding(axis, legend)}
  {...restProps}
  tooltip={tooltip === false
    ? false
    : {
        mode: 'voronoi',
        onclick: onTooltipClick,
        debug,
        ...props.tooltip?.context,
      }}
  bind:tooltipContext
  brush={brush && (brush === true || brush.mode == undefined || brush.mode === 'integrated')
    ? {
        axis: 'both',
        resetOnEnd: true,
        xDomain,
        yDomain,
        ...brushProps,
        onBrushEnd: (e) => {
          xDomain = e.xDomain;
          yDomain = e.yDomain;
          brushProps.onBrushEnd?.(e);
        },
      }
    : false}
>
  {#snippet children({ tooltipContext, context, brushContext, geoContext, transformContext })}
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
      highlightKey: highlightKey.current,
      setHighlightKey: highlightKey.set,
    }}
    {@const activeSeries = tooltipContext.data
      ? (series.find((s) => s.key === tooltipContext.data.seriesKey) ?? series[0])
      : null}

    {#if childrenProp}
      {@render childrenProp(snippetProps)}
    {:else}
      {@render belowContext?.(snippetProps)}
      {@const Component = renderContext === 'canvas' ? Canvas : Svg}
      <Component
        this={renderContext === 'canvas' ? Canvas : Svg}
        {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
        {debug}
      >
        {#if typeof grid === 'function'}
          {@render grid(snippetProps)}
        {:else if grid}
          <Grid x y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}

        <ChartClipPath disabled={!brush}>
          {@render belowMarks?.(snippetProps)}

          {#if typeof marks === 'function'}
            {@render marks(snippetProps)}
          {:else}
            {#each visibleSeries as s, i (s.key)}
              <Points {...getPointsProps(s, i)} />
            {/each}
          {/if}

          {@render aboveMarks?.(snippetProps)}
        </ChartClipPath>

        {#if typeof axis === 'function'}
          {@render axis(snippetProps)}
        {:else if axis}
          {#if axis !== 'x'}
            <Axis
              placement="left"
              format={(value) => format(value, undefined, { variant: 'short' })}
              {...typeof axis === 'object' ? axis : null}
              {...props.yAxis}
            />
          {/if}

          {#if axis !== 'y'}
            <Axis
              placement="bottom"
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
          {#if typeof highlight === 'function'}
            {@render highlight(snippetProps)}
          {:else}
            <Highlight
              lines
              axis="both"
              {...props.highlight}
              points={{
                fill: activeSeries?.color,
                ...(typeof props.highlight?.points === 'object' ? props.highlight.points : null),
              }}
            />
          {/if}

          {#if labels}
            {#each visibleSeries as s, i (s.key)}
              <Labels {...getLabelsProps(s, i)} />
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
          onclick={(e, item) => selectedSeries.toggleSelected(item.value)}
          onpointerenter={(e, item) => (highlightKey.current = item.value)}
          onpointerleave={(e) => (highlightKey.current = null)}
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
      {:else if tooltip}
        <Tooltip.Root {...props.tooltip?.root}>
          {#snippet children({ data })}
            {#if activeSeries?.key !== 'default'}
              <Tooltip.Header
                value={activeSeries?.label ?? activeSeries?.key}
                color={activeSeries?.color}
                {...props.tooltip?.header}
              />
            {/if}
            <Tooltip.List {...props.tooltip?.list}>
              <Tooltip.Item
                label={typeof context.config.x === 'string' ? context.config.x : 'x'}
                value={context.x(data)}
                {format}
                onpointerenter={() => (highlightKey.current = activeSeries?.key ?? null)}
                onpointerleave={() => (highlightKey.current = null)}
                {...props.tooltip?.item}
              />
              <Tooltip.Item
                label={typeof context.config.y === 'string' ? context.config.y : 'y'}
                value={context.y(data)}
                {format}
                onpointerenter={() => (highlightKey.current = activeSeries?.key ?? null)}
                onpointerleave={() => (highlightKey.current = null)}
                {...props.tooltip?.item}
              />
              {#if context.config.r}
                <Tooltip.Item
                  label={typeof context.config.r === 'string' ? context.config.r : 'r'}
                  value={context.r(data)}
                  {format}
                  onpointerenter={() => (highlightKey.current = activeSeries?.key ?? null)}
                  onpointerleave={() => (highlightKey.current = null)}
                  {...props.tooltip?.item}
                />
              {/if}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/if}
    {/if}
  {/snippet}
</Chart>
