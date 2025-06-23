<script lang="ts" module>
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import { onMount, type ComponentProps } from 'svelte';

  export type ScatterChartExtraSnippetProps<TData> = {
    getLabelsProps: (
      s: SeriesData<TData, typeof Points>,
      i: number
    ) => ComponentProps<typeof Labels<TData>>;
    getPointsProps: (
      s: SeriesData<TData, typeof Points>,
      i: number
    ) => ComponentProps<typeof Points>;
    getHighlightProps: () => ComponentProps<typeof Highlight>;
    getAxisProps: (axisDirection: 'x' | 'y') => ComponentProps<typeof Axis>;
    getRuleProps: () => ComponentProps<typeof Rule>;
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
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Axis from '../Axis.svelte';
  import BrushContext from '../BrushContext.svelte';
  import Chart from '../Chart.svelte';
  import ChartAnnotations from './ChartAnnotations.svelte';
  import ChartClipPath from '../ChartClipPath.svelte';
  import Grid from '../Grid.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Layer from '../layout/Layer.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, defaultChartPadding } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import { createLegendProps, SeriesState } from './utils.svelte.js';

  let {
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    yDomain,
    series: seriesProp,
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    labels = false,
    legend = false,
    points = false,
    rule = true,
    tooltip = true,
    context = $bindable(),
    onTooltipClick = () => {},
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    xScale: xScaleProp,
    yScale: yScaleProp,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    highlight = true,
    annotations = [],
    ...restProps
  }: ScatterChartProps<TData> = $props();

  const series: SeriesData<TData, typeof Points>[] = $derived(
    seriesProp === undefined ? [{ key: 'default', data: chartDataArray(data) }] : seriesProp
  );

  const seriesState = new SeriesState(() => series);

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

  const chartData = $derived(
    seriesState.visibleSeries
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData>
  );

  function getPointsProps(
    s: SeriesData<TData, typeof Points>,
    i: number
  ): ComponentProps<typeof Points> {
    return {
      data: s.data,
      fill: s.color,
      ...props.points,
      ...s.props,
      class: cls(
        'transition-opacity',
        seriesState.highlightKey.current &&
          seriesState.highlightKey.current !== s.key &&
          'opacity-10',
        props.points?.class,
        s.props?.class
      ),
    };
  }

  function getLabelsProps(
    s: SeriesData<TData, typeof Points>,
    i: number
  ): ComponentProps<typeof Labels<TData>> {
    return {
      data: s.data,
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
      x: true,
      y: true,
      ...(typeof grid === 'object' ? grid : null),
      ...props.grid,
    };
  }

  const activeSeries = $derived.by(() => {
    if (!context?.tooltip?.data) return null;
    // @ts-expect-error - shh
    return series.find((s) => s.key === context?.tooltip.data?.seriesKey) ?? series[0];
  });

  function getHighlightProps(): ComponentProps<typeof Highlight> {
    return {
      lines: true,
      axis: 'both',
      ...props.highlight,
      points: {
        ...(activeSeries?.color && { fill: activeSeries.color }),
        ...(typeof props.highlight?.points === 'object' ? props.highlight.points : null),
      },
    };
  }

  function getAxisProps(axisDirection: 'x' | 'y'): ComponentProps<typeof Axis> {
    if (axisDirection === 'y') {
      return {
        placement: 'left',
        ...(typeof axis === 'object' ? axis : null),
        ...props.yAxis,
      };
    }
    return {
      placement: 'bottom',
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
    console.time('ScatterChart render');
    onMount(() => {
      console.timeEnd('ScatterChart render');
    });
  }
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:context
  data={chartData}
  x={xProp}
  {xDomain}
  {xScale}
  y={yProp}
  {yDomain}
  {yScale}
  yNice
  c={yProp}
  cRange={['var(--color-primary)']}
  padding={defaultChartPadding(axis, legend)}
  {...restProps}
  tooltip={tooltip === false
    ? false
    : {
        mode: 'voronoi',
        onclick: onTooltipClick,
        debug,
        ...props.tooltip?.context,
        ...(typeof tooltip === 'object' ? tooltip : null),
      }}
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
  {#snippet children({ context })}
    {@const snippetProps = {
      context,
      series,
      visibleSeries: seriesState.visibleSeries,
      getLabelsProps,
      getPointsProps,
      getLegendProps,
      getHighlightProps,
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

          {#if typeof marks === 'function'}
            {@render marks(snippetProps)}
          {:else}
            {#each seriesState.visibleSeries as s, i (s.key)}
              <Points {...getPointsProps(s, i)} />
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
          {#if typeof highlight === 'function'}
            {@render highlight(snippetProps)}
          {:else if highlight}
            <Highlight {...getHighlightProps()} />
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
        <Tooltip.Root {context} {...props.tooltip?.root}>
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
                onpointerenter={() =>
                  (seriesState.highlightKey.current = activeSeries?.key ?? null)}
                onpointerleave={() => (seriesState.highlightKey.current = null)}
                {...props.tooltip?.item}
              />
              <Tooltip.Item
                label={typeof context.config.y === 'string' ? context.config.y : 'y'}
                value={context.y(data)}
                {format}
                onpointerenter={() =>
                  (seriesState.highlightKey.current = activeSeries?.key ?? null)}
                onpointerleave={() => (seriesState.highlightKey.current = null)}
                {...props.tooltip?.item}
              />
              {#if context.config.r}
                <Tooltip.Item
                  label={typeof context.config.r === 'string' ? context.config.r : 'r'}
                  value={context.r(data)}
                  {format}
                  onpointerenter={() =>
                    (seriesState.highlightKey.current = activeSeries?.key ?? null)}
                  onpointerleave={() => (seriesState.highlightKey.current = null)}
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
