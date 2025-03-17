<script lang="ts" module>
  export type AreaChartExtraSnippetProps<TData> = {
    getAreaProps: (s: SeriesData<TData, typeof Area>, i: number) => ComponentProps<typeof Area>;
    getLabelsProps: (s: SeriesData<TData, typeof Area>, i: number) => ComponentProps<typeof Labels>;
    getPointsProps: (s: SeriesData<TData, typeof Area>, i: number) => ComponentProps<typeof Points>;
  };

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
     * The event to be dispatched when the point is clicked.
     */
    onPointClick?: (
      e: MouseEvent,
      details: { data: HighlightPointData; series: SeriesData<TData, typeof Area> }
    ) => void;

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
  } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import Spline from '../Spline.svelte';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import { createHighlightKey } from './utils.svelte.js';
  import { createSelectionState } from 'layerchart/stores/selectionState.svelte.js';

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

  function getAreaProps(s: SeriesData<TData, typeof Area>, i: number) {
    const lineProps: ComponentProps<typeof Spline> = {
      ...props.line,
      ...(typeof props.area?.line === 'object' ? props.area.line : null),
      ...(typeof s.props?.line === 'object' ? s.props.line : null),
    };

    const areaProps: ComponentProps<typeof Area> = {
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

    return areaProps;
  }

  function getPointsProps(s: (typeof series)[number], i: number) {
    const pointsProps: ComponentProps<typeof Points> = {
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

    return pointsProps;
  }

  function getLabelsProps(s: (typeof series)[number], i: number) {
    const labelsProps: ComponentProps<typeof Labels> = {
      data: s.data,
      y: stackSeries
        ? (d) => d.stackData[i][1]
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

    return labelsProps;
  }

  const brushProps = $derived({ ...(typeof brush === 'object' ? brush : null), ...props.brush });

  if (profile) {
    console.time('AreaChart render');
    onMount(() => {
      console.timeEnd('AreaChart render');
    });
  }
</script>

<Chart
  data={chartData}
  {x}
  {xDomain}
  {xScale}
  y={y ??
    (stackSeries
      ? // @ts-expect-error TODO - investigate
        (d) => visibleSeries.flatMap((s, i) => d.stackData[i])
      : visibleSeries.map((s) => s.value ?? s.key))}
  yBaseline={0}
  yNice
  {radial}
  padding={radial ? undefined : defaultChartPadding(axis, legend)}
  {...restProps}
  tooltip={tooltip === false
    ? false
    : typeof tooltip === 'object'
      ? {
          mode: 'bisect-x',
          onclick: onTooltipClick,
          debug,
          ...props.tooltip?.context,
          ...tooltip,
        }
      : {}}
  bind:tooltipContext
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
  {#snippet children({ tooltipContext, brushContext, context, geoContext, transformContext })}
    {@const slotProps = {
      context,
      tooltipContext,
      brushContext,
      geoContext,
      series,
      transformContext,
      visibleSeries,
      getAreaProps,
      getLabelsProps,
      getPointsProps,
      highlightKey: highlightKey.current,
      setHighlightKey: highlightKey.set,
    }}

    {#if childrenProp}
      {@render childrenProp(slotProps)}
    {:else}
      {@render belowContext?.(slotProps)}
      {@const Component = renderContext === 'canvas' ? Canvas : Svg}

      <Component
        this={renderContext === 'canvas' ? Canvas : Svg}
        {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
        center={radial}
        {debug}
      >
        {#if typeof grid === 'function'}
          {@render grid(slotProps)}
        {:else if grid}
          <Grid x={radial} y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}

        <ChartClipPath disabled={!brush}>
          {@render belowMarks?.(slotProps)}

          {#if marks}
            {@render marks(slotProps)}
          {:else}
            {#each visibleSeries as s, i (s.key)}
              <Area {...getAreaProps(s, i)} />
            {/each}
          {/if}
        </ChartClipPath>

        {@render aboveMarks?.(slotProps)}
        {#if typeof axis === 'function'}
          {@render axis(slotProps)}
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
            {@render rule(slotProps)}
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

          {#if typeof highlight === 'function'}
            {@render highlight(slotProps)}
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
                y={stackSeries
                  ? (d) => d.stackData[i][1]
                  : (s.value ?? (s.data ? undefined : s.key))}
                lines={i == 0}
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

          {#if labels}
            {#each visibleSeries as s, i (s.key)}
              <Labels {...getLabelsProps(s, i)} />
            {/each}
          {/if}
        </ChartClipPath>
      </Component>

      {@render aboveContext?.(slotProps)}

      {#if typeof legend === 'function'}
        {@render legend(slotProps)}
      {:else if legend}
        {#if legend}
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
      {/if}

      {#if typeof tooltip === 'function'}
        {@render tooltip(slotProps)}
      {:else}
        <Tooltip.Root {...props.tooltip?.root}>
          {#snippet children({ data })}
            <Tooltip.Header value={context.x(data)} {format} {...props.tooltip?.header} />

            <Tooltip.List {...props.tooltip?.list}>
              <!-- Reverse series order so tooltip items match stacks -->
              {@const seriesItems = stackSeries ? [...visibleSeries].reverse() : visibleSeries}
              {#each seriesItems as s}
                {@const seriesTooltipData = s.data
                  ? findRelatedData(s.data, data, context.x)
                  : data}
                {@const valueAccessor = accessor(s.value ?? (s.data ? asAny(context.y) : s.key))}

                <Tooltip.Item
                  label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
                  value={seriesTooltipData ? valueAccessor(seriesTooltipData) : null}
                  color={s.color}
                  {format}
                  valueAlign="right"
                  onpointerenter={() => (highlightKey.current = s.key)}
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
