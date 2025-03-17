<script lang="ts" module>
  export type BarChartExtraSnippetProps<TData> = {
    getBarsProps: (s: SeriesData<TData, typeof Bars>, i: number) => ComponentProps<typeof Bars>;
    getLabelsProps: (s: SeriesData<TData, typeof Bars>, i: number) => ComponentProps<typeof Labels>;
  };

  export type BarChartPropsObjProp = Pick<
    SimplifiedChartPropsObject,
    | 'xAxis'
    | 'yAxis'
    | 'canvas'
    | 'grid'
    | 'rule'
    | 'bars'
    | 'legend'
    | 'highlight'
    | 'labels'
    | 'svg'
    | 'tooltip'
  >;

  export type BarChartProps<TData> = Omit<
    SimplifiedChartProps<TData, typeof Bars, BarChartExtraSnippetProps<TData>>,
    'seriesLayout'
  > & {
    /**
     * Padding between primary x or y bands/bars, applied to scaleBand().padding()
     *
     * @default 0.4
     */
    bandPadding?: number;
    /**
     * Padding between group/series items when using 'seriesLayout="group"', applied to scaleBand().padding()
     *
     * @default 0
     */
    groupPadding?: number;
    /**
     * Padding between series items within bars when using 'seriesLayout="stack"'
     *
     * @default 0
     */
    stackPadding?: number;

    /**
     * The orientation of the bar chart.
     *
     * @default 'vertical'
     */
    orientation?: 'vertical' | 'horizontal';

    props?: BarChartPropsObjProp;

    /**
     * A function called when a bar is clicked
     */
    onBarClick?: (
      e: MouseEvent,
      detail: { data: any; series: SeriesData<TData, typeof Bars> }
    ) => void;

    /**
     * The layout of the series.
     *
     * @default 'overlap'
     */
    seriesLayout?:
      | SimplifiedChartProps<TData, typeof Bars, BarChartExtraSnippetProps<TData>>['seriesLayout']
      | 'group';

    /**
     * The y scale to use for the chart.
     */
    yScale?: AnyScale;
  };
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { scaleBand, scaleOrdinal, scaleLinear } from 'd3-scale';
  import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { selectionStore } from '@layerstack/svelte-stores';

  import Axis from '../Axis.svelte';
  import Bars from '../Bars.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart-Next.svelte';
  import Grid from '../Grid.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
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
  import type { Insets } from '../../utils/rect.js';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import type { AnyScale } from 'layerchart/utils/scales.js';
  import { createHighlightKey } from './utils.svelte.js';

  let {
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    radial = false,
    orientation = 'vertical',
    series = [
      {
        key: 'default',
        value: orientation === 'vertical' ? yProp : xProp,
      },
    ],
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
    onBarClick = () => {},
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    xScale: xScaleProp,
    yScale: yScaleProp,
    bandPadding = 0.4,
    groupPadding = 0,
    stackPadding = 0,
    tooltip,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    highlight,
    ...restProps
  }: BarChartProps<TData> = $props();

  const isVertical = $derived(orientation === 'vertical');
  const isDefaultSeries = $derived(series.length === 1 && series[0].key === 'default');
  const stackSeries = $derived(seriesLayout.startsWith('stack'));
  const groupSeries = $derived(seriesLayout === 'group');
  const xScale = $derived(
    xScaleProp ?? (isVertical ? scaleBand().padding(bandPadding) : scaleLinear())
  );
  const xBaseline = $derived(isVertical ? 0 : undefined);
  const yScale = $derived(
    yScaleProp ?? (isVertical ? scaleLinear() : scaleBand().padding(bandPadding))
  );
  const yBaseline = $derived(isVertical ? undefined : 0);

  const selectedSeries = selectionStore();
  const visibleSeries = $derived(
    series.filter((s) => {
      return (
        // @ts-expect-error
        $selectedSeries.selected.length === 0 || $selectedSeries.isSelected(s.key)
        // || highlightSeriesKey == s.key
      );
    })
  );

  const x1Scale = $derived(
    groupSeries && isVertical ? scaleBand().padding(groupPadding) : undefined
  );
  const x1Domain = $derived(
    groupSeries && isVertical ? visibleSeries.map((s) => s.key) : undefined
  );

  const x1Range = $derived(
    groupSeries && isVertical
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ xScale }: { xScale: AnyScale }) => [0, xScale.bandwidth!()]
      : undefined
  );

  const y1Scale = $derived(
    groupSeries && !isVertical ? scaleBand().padding(groupPadding) : undefined
  );
  const y1Domain = $derived(
    groupSeries && !isVertical ? visibleSeries.map((s) => s.key) : undefined
  );
  const y1Range = $derived(
    groupSeries && !isVertical
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ yScale }: { yScale: AnyScale }) => [0, yScale.bandwidth!()]
      : undefined
  );

  const allSeriesData = $derived(
    visibleSeries
      .flatMap((s) =>
        s.data?.map((d) => {
          return { seriesKey: s.key, ...d };
        })
      )
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
        .offset(offset)(chartDataArray(data)) as any[];

      _chartData = _chartData.map((d, i) => {
        return {
          ...d,
          stackData: stackData.map((sd) => sd[i]),
        };
      });
    }
    return _chartData;
  });

  const highlightKey = createHighlightKey();

  function getBarsProps(s: SeriesData<TData, typeof Bars>, i: number) {
    const isFirst = i == 0;
    const isLast = i == visibleSeries.length - 1;

    const isStackLayout = seriesLayout.startsWith('stack');

    let stackInsets: Insets | undefined = undefined;

    if (isStackLayout) {
      const stackInset = stackPadding / 2;
      if (isVertical) {
        stackInsets = {
          bottom: isFirst ? undefined : stackInset,
          top: isLast ? undefined : stackInset,
        };
      } else {
        stackInsets = {
          left: isFirst ? undefined : stackInset,
          right: isLast ? undefined : stackInset,
        };
      }
    }

    const valueAccessor = stackSeries
      ? (d: any) => d.stackData[i]
      : (s.value ?? (s.data ? undefined : s.key));
    const barsProps: ComponentProps<typeof Bars> = {
      data: s.data,
      x: !isVertical ? valueAccessor : undefined,
      y: isVertical ? valueAccessor : undefined,
      x1: isVertical && groupSeries ? (d) => s.value ?? s.key : undefined,
      y1: !isVertical && groupSeries ? (d) => s.value ?? s.key : undefined,
      rounded: isStackLayout && i !== visibleSeries.length - 1 ? 'none' : 'edge',
      radius: 4,
      strokeWidth: 1,
      insets: stackInsets,
      fill: s.color,
      onBarClick: (e, detail) => onBarClick(e, { ...detail, series: s }),
      ...props.bars,
      ...s.props,
      class: cls(
        'transition-opacity',
        highlightKey.current && highlightKey.current !== s.key && 'opacity-10',
        props.bars?.class,
        s.props?.class
      ),
    };

    return barsProps;
  }

  function getLabelsProps(s: SeriesData<TData, typeof Bars>, i: number) {
    const labelsProps: ComponentProps<typeof Labels> = {
      // TODO: Improve placement when using `seriesLayout="group"`
      // data: s.data,
      // y: s.value ?? (s.data ? undefined : s.key),
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

  if (profile) {
    console.time('BarChart render');
    onMount(() => {
      console.timeEnd('BarChart render');
    });
  }
</script>

<Chart
  data={chartData}
  x={xProp ??
    (stackSeries
      ? // @ts-expect-error - TODO: lets fix this somehow
        (d) => visibleSeries.flatMap((s, i) => d.stackData[i])
      : visibleSeries.map((s) => s.value ?? s.key))}
  {xScale}
  {xBaseline}
  xNice={orientation === 'horizontal'}
  {x1Scale}
  {x1Domain}
  {x1Range}
  y={yProp ??
    (stackSeries
      ? // @ts-expect-error - TODO: lets fix this somehow
        (d) => visibleSeries.flatMap((s, i) => d.stackData[i])
      : visibleSeries.map((s) => s.value ?? s.key))}
  {yScale}
  {yBaseline}
  yNice={orientation === 'vertical'}
  {y1Scale}
  {y1Domain}
  {y1Range}
  c={isVertical ? yProp : xProp}
  cRange={['var(--color-primary)']}
  padding={defaultChartPadding(axis, legend)}
  {...restProps}
  tooltip={tooltip === false
    ? false
    : {
        mode: 'band',
        onclick: onTooltipClick,
        debug,
        ...props.tooltip?.context,
        ...props.tooltip,
      }}
  bind:tooltipContext
>
  {#snippet children({ context, brushContext, geoContext, tooltipContext, transformContext })}
    {@const slotProps = {
      context,
      tooltipContext,
      brushContext,
      geoContext,
      transformContext,
      series,
      visibleSeries,
      getBarsProps,
      getLabelsProps,
      highlightKey: highlightKey.current,
      setHighlightKey: highlightKey.set,
    }}
    {#if childrenProp}
      {@render childrenProp(slotProps)}
    {:else}
      {@const Component = renderContext === 'canvas' ? Canvas : Svg}
      {@render belowContext?.(slotProps)}

      <Component {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)} {debug}>
        {#if typeof grid === 'function'}
          {@render grid(slotProps)}
        {:else if grid}
          <Grid
            x={!isVertical}
            y={isVertical}
            {...typeof grid === 'object' ? grid : null}
            {...props.grid}
          />
        {/if}
        {@render belowMarks?.(slotProps)}

        {#if typeof marks === 'function'}
          {@render marks(slotProps)}
        {:else}
          {#each visibleSeries as s, i (s.key)}
            <Bars {...getBarsProps(s, i)} />
          {/each}
        {/if}

        {@render aboveMarks?.(slotProps)}

        {#if typeof axis === 'function'}
          {@render axis(slotProps)}
        {:else if axis}
          {#if axis !== 'x'}
            <Axis
              placement="left"
              format={(value) => {
                if (isVertical && seriesLayout === 'stackExpand') {
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
              placement="bottom"
              format={(value) => {
                if (!isVertical && seriesLayout === 'stackExpand') {
                  return format(value, 'percentRound');
                } else {
                  return format(value, undefined, { variant: 'short' });
                }
              }}
              {...typeof axis === 'object' ? axis : null}
              {...props.xAxis}
            />
          {/if}

          {#if rule}
            <Rule
              x={isVertical ? false : 0}
              y={isVertical ? 0 : false}
              {...typeof rule === 'object' ? rule : null}
              {...props.rule}
            />
          {/if}
        {/if}

        {#if typeof highlight === 'function'}
          {@render highlight(slotProps)}
        {:else}
          <Highlight area {...props.highlight} />
        {/if}

        {#if labels}
          {#each visibleSeries as s, i (s.key)}
            <Labels {...getLabelsProps(s, i)} />
          {/each}
        {/if}
      </Component>

      {@render aboveContext?.(slotProps)}

      {#if typeof legend === 'function'}
        {@render legend(slotProps)}
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
          onclick={(e, item) => $selectedSeries.toggleSelected(item.value)}
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
        {@render tooltip(slotProps)}
      {:else}
        <Tooltip.Root {...props.tooltip?.root}>
          {#snippet children({ data })}
            <Tooltip.Header
              value={isVertical ? context.x(data) : context.y(data)}
              {format}
              {...props.tooltip?.header}
            />

            <Tooltip.List {...props.tooltip?.list}>
              <!-- Reverse series order so tooltip items match stacks -->
              {@const seriesItems = stackSeries ? [...visibleSeries].reverse() : visibleSeries}
              {#each seriesItems as s}
                {@const seriesTooltipData = s.data
                  ? findRelatedData(s.data, data, context.x)
                  : data}
                {@const valueAccessor = accessor(s.value ?? (s.data ? context.y : s.key))}
                <Tooltip.Item
                  label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
                  value={seriesTooltipData ? valueAccessor(seriesTooltipData) : null}
                  color={s.color ?? context.cScale?.(context.c(data))}
                  {format}
                  valueAlign="right"
                  onpointerenter={() => (highlightKey.current = s.key)}
                  onpointerleave={() => (highlightKey.current = null)}
                  {...props.tooltip?.item}
                />
              {/each}

              {#if (stackSeries || groupSeries) && visibleSeries.length > 1 && !props.tooltip?.hideTotal}
                <Tooltip.Separator {...props.tooltip?.separator} />

                <Tooltip.Item
                  label="total"
                  value={sum(visibleSeries, (s) => {
                    const seriesTooltipData = s.data
                      ? findRelatedData(s.data, data, context.x)
                      : data;
                    const valueAccessor = accessor(s.value ?? (s.data ? context.y : s.key));
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
