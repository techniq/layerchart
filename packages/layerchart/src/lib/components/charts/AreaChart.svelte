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
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Area from '../Area.svelte';
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
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

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
  import { createHighlightKey } from './utils.svelte.js';
  import { createSelectionState } from '$lib/stores/selectionState.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';

  let {
    data = [],
    x,
    y,
    xDomain,
    radial = false,
    series = [{ key: 'default', value: y, color: 'var(--color-primary)' }],
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    labels = false,
    legend = false,
    points = false,
    tooltip = true,
    highlight = true,
    rule = true,
    onTooltipClick = () => {},
    onPointClick,
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    xScale: xScaleProp,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    context = $bindable(),
    ...restProps
  }: AreaChartProps<TData> = $props();

  const isDefaultSeries = $derived(series.length === 1 && series[0].key === 'default');
  const stackSeries = $derived(seriesLayout.startsWith('stack'));

  const selectedSeries = createSelectionState();

  const visibleSeries = $derived(
    series.filter((s) => selectedSeries.isEmpty() || selectedSeries.isSelected(s.key))
  );

  const allSeriesData = $derived(
    visibleSeries
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData & { stackData?: any }>
  );

  const chartData = $derived.by(() => {
    let _chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<TData>;
    if (stackSeries) {
      const seriesKeys = visibleSeries.map((s) => s.key);
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
          return accessor(s.value ?? s.key)(d as any);
        })
        .offset(offset)(chartDataArray(data));

      _chartData = _chartData.map((d, i) => {
        return {
          ...d,
          stackData: stackData.map((sd) => sd[i]),
        };
      });
    }

    return _chartData;
  });

  // Default xScale based on first data's `x` value
  const xScale = $derived(
    xScaleProp ?? (accessor(x)(chartData[0]) instanceof Date ? scaleTime() : scaleLinear())
  );

  const highlightKey = createHighlightKey<TData, typeof Area>();

  function getAreaProps(s: SeriesData<TData, typeof Area>, i: number): ComponentProps<typeof Area> {
    const lineProps: ComponentProps<typeof Spline> = {
      ...props.line,
      ...(typeof props.area?.line === 'object' ? props.area.line : null),
      ...(typeof s.props?.line === 'object' ? s.props.line : null),
    };

    return {
      data: s.data,
      y0: stackSeries ? (d) => d.stackData[i][0] : Array.isArray(s.value) ? s.value[0] : undefined,
      y1: stackSeries
        ? (d) => d.stackData[i][1]
        : Array.isArray(s.value)
          ? s.value[1]
          : (s.value ?? (s.data ? undefined : s.key)),
      fill: s.color,
      fillOpacity: 0.3,
      ...props.area,
      ...s.props,
      class: cls(
        'transition-opacity',
        // Checking `visibleSeries.length > 1` fixes re-animated tweened areas on hover
        visibleSeries.length > 1 &&
          highlightKey.current &&
          highlightKey.current !== s.key &&
          'opacity-10',
        props.area?.class,
        s.props?.class
      ),
      line: {
        stroke: s.color,
        ...lineProps,
        class: cls(
          'transition-opacity',
          visibleSeries.length > 1 &&
            highlightKey.current &&
            highlightKey.current !== s.key &&
            'opacity-10',
          lineProps.class
        ),
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
        ? (d) => d.stackData[i][1]
        : Array.isArray(s.value)
          ? s.value[1]
          : (s.value ?? (s.data ? undefined : s.key)),
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
  }

  function isStackData(d: TData): d is TData & { stackData: any[] } {
    return d && typeof d === 'object' && 'stackData' in d;
  }

  function getLabelsProps(
    s: SeriesData<TData, typeof Area>,
    i: number
  ): ComponentProps<typeof Labels<TData>> {
    return {
      data: s.data,
      y: stackSeries
        ? (d) => (isStackData(d) ? d.stackData[i][1] : undefined)
        : Array.isArray(s.value)
          ? s.value[1]
          : (s.value ?? (s.data ? undefined : s.key)),
      ...props.labels,
      ...(typeof labels === 'object' ? labels : null),
      class: cls(
        'stroke-surface-200 transition-opacity',
        highlightKey.current && highlightKey.current !== s.key && 'opacity-10',
        props.labels?.class,
        typeof labels === 'object' && labels.class
      ),
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
        ? findRelatedData(s.data, context.tooltip.data, context.x)
        : null;
    const highlightPointsProps =
      typeof props.highlight?.points === 'object' ? props.highlight.points : null;

    return {
      data: seriesTooltipData,
      y: stackSeries ? (d) => d.stackData[i][1] : (s.value ?? (s.data ? undefined : s.key)),
      lines: i == 0,
      onPointClick: onPointClick
        ? (e, detail) => onPointClick(e, { ...detail, series: s })
        : undefined,
      onPointEnter: () => (highlightKey.current = s.key),
      onPointLeave: () => (highlightKey.current = null),
      ...props.highlight,
      points:
        props.highlight?.points == false
          ? false
          : {
              ...highlightPointsProps,
              fill: s.color,
              class: cls(
                'transition-opacity',
                highlightKey.current && highlightKey.current !== s.key && 'opacity-10',
                highlightPointsProps?.class
              ),
            },
    };
  }

  function getLegendProps(): ComponentProps<typeof Legend> {
    return {
      scale: isDefaultSeries
        ? undefined
        : scaleOrdinal(
            series.map((s) => s.key),
            series.map((s) => s.color)
          ),
      tickFormat: (key) => series.find((s) => s.key === key)?.label ?? key,
      placement: 'bottom',
      variant: 'swatches',
      onclick: (e, item) => selectedSeries.toggleSelected(item.value),
      onpointerenter: (e, item) => (highlightKey.current = item.value),
      onpointerleave: (e) => (highlightKey.current = null),
      ...props.legend,
      ...(typeof legend === 'object' ? legend : null),
      classes: {
        item: (item) =>
          visibleSeries.length && !visibleSeries.some((s) => s.key === item.value)
            ? 'opacity-50'
            : '',
        ...props.legend?.classes,
        ...(typeof legend === 'object' ? legend.classes : null),
      },
    };
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
      return visibleSeries;
    },
  });

  function resolveAccessor(acc: Accessor<TData> | undefined) {
    if (acc) return acc;
    if (stackSeries) {
      return (d: TData) =>
        isStackData(d) ? visibleSeries.flatMap((s, i) => d.stackData[i]) : undefined;
    }
    return visibleSeries.map((s) => s.value ?? s.key);
  }
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:context
  data={chartData}
  {x}
  {xDomain}
  {xScale}
  y={resolveAccessor(y)}
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
      visibleSeries,
      getAreaProps,
      getLabelsProps,
      getPointsProps,
      getHighlightProps,
      getLegendProps,
      getGridProps,
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
          <Grid {...getGridProps()} />
        {/if}

        <ChartClipPath disabled={!brush}>
          {@render belowMarks?.(snippetProps)}

          {#if marks}
            {@render marks(snippetProps)}
          {:else}
            {#each visibleSeries as s, i (s.key)}
              <Area {...getAreaProps(s, i)} />
            {/each}
          {/if}
        </ChartClipPath>

        {@render aboveMarks?.(snippetProps)}
        {#if typeof axis === 'function'}
          {@render axis(snippetProps)}
        {:else if axis}
          {#if axis !== 'x'}
            <Axis
              placement={radial ? 'radius' : 'left'}
              format={(value) => {
                if (seriesLayout === 'stackExpand') {
                  return format(value, 'percentRound');
                } else {
                  return format(value, undefined, { variant: 'short' });
                }
              }}
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
          {#if typeof points === 'function'}
            {@render points(snippetProps)}
          {:else if points}
            {#each visibleSeries as s, i (s.key)}
              <Points {...getPointsProps(s, i)} />
            {/each}
          {/if}

          {#if typeof highlight === 'function'}
            {@render highlight(snippetProps)}
          {:else if highlight}
            {#each visibleSeries as s, i (s.key)}
              <Highlight {...getHighlightProps(s, i)} />
            {/each}
          {/if}

          {#if typeof labels === 'function'}
            {@render labels(snippetProps)}
          {:else if labels}
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
        <Legend {...getLegendProps()} />
      {/if}

      {#if typeof tooltip === 'function'}
        {@render tooltip(snippetProps)}
      {:else if tooltip}
        <Tooltip.Root {context} {...props.tooltip?.root}>
          {#snippet children({ data, payload })}
            <Tooltip.Header value={payload[0]?.label} {format} {...props.tooltip?.header} />

            <Tooltip.List {...props.tooltip?.list}>
              <!-- Reverse series order so tooltip items match stacks -->
              {#each payload as p, i (i)}
                <Tooltip.Item
                  label={p.name}
                  value={p.value}
                  color={p.color}
                  {format}
                  valueAlign="right"
                  onpointerenter={() => (highlightKey.current = p.key)}
                  onpointerleave={() => (highlightKey.current = null)}
                  {...props.tooltip?.item}
                />
              {/each}

              {#if stackSeries && visibleSeries.length > 1}
                <Tooltip.Separator {...props.tooltip?.separator} />

                <Tooltip.Item
                  label="total"
                  value={sum(visibleSeries, (s) => {
                    const seriesTooltipData = s.data
                      ? s.data.find((d) => context.x(d) === context.x(data))
                      : data;
                    const valueAccessor = accessor(s.value ?? (s.data ? asAny(context.y) : s.key));
                    return valueAccessor(seriesTooltipData);
                  })}
                  format="integer"
                  valueAlign="right"
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
