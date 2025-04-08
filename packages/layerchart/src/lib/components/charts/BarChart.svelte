<script lang="ts" module>
  export type BarChartExtraSnippetProps<TData> = {
    getBarsProps: (s: SeriesData<TData, typeof Bars>, i: number) => ComponentProps<typeof Bars>;
    getLabelsProps: (
      s: SeriesData<TData, typeof Bars>,
      i: number
    ) => ComponentProps<typeof Labels<TData>>;
    getGridProps: () => ComponentProps<typeof Grid>;
    getHighlightProps: () => ComponentProps<typeof Highlight>;
    getAxisProps: (axisDirection: 'x' | 'y') => ComponentProps<typeof Axis>;
    getRuleProps: () => ComponentProps<typeof Rule>;
  };

  export type BarChartPropsObjProp<TData> = Pick<
    SimplifiedChartPropsObject<TData>,
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

    props?: BarChartPropsObjProp<TData>;

    /**
     * A callback function that is called when a bar is clicked.
     * @param e - The original event that triggered the callback
     * @param detail - An object containing the bar's data and series information
     */
    onBarClick?: (
      event: MouseEvent,
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
  };
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Axis from '../Axis.svelte';
  import Bars from '../Bars.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart.svelte';
  import Grid from '../Grid.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Rule from '../Rule.svelte';
  import Svg from '../layout/Svg.svelte';

  import {
    accessor,
    chartDataArray,
    defaultChartPadding,
    type Accessor,
  } from '$lib/utils/common.js';
  import { asAny } from '$lib/utils/types.js';
  import type { Insets } from '$lib/utils/rect.svelte.js';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import { createLegendProps, createSeriesState } from './utils.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';
  import DefaultTooltip from './DefaultTooltip.svelte';

  let {
    data = [],
    x: xProp,
    y: yProp,
    radial = false,
    orientation = 'vertical',
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
    onBarClick = () => {},
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    xScale: xScaleProp,
    yScale: yScaleProp,
    bandPadding = radial ? 0 : 0.4,
    groupPadding = 0,
    stackPadding = 0,
    tooltip = true,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    highlight = true,
    context = $bindable(),
    ...restProps
  }: BarChartProps<TData> = $props();

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',
            value: orientation === 'vertical' ? yProp : xProp,
          },
        ]
      : seriesProp
  );

  const seriesState = createSeriesState(() => series);
  const isVertical = $derived(orientation === 'vertical');
  const isStackSeries = $derived(seriesLayout.startsWith('stack'));
  const isGroupSeries = $derived(seriesLayout === 'group');

  const xScale = $derived(
    xScaleProp ?? (isVertical ? scaleBand().padding(bandPadding) : scaleLinear())
  );
  const xBaseline = $derived(isVertical ? undefined : 0);

  const yScale = $derived(
    yScaleProp ?? (isVertical ? scaleLinear() : scaleBand().padding(bandPadding))
  );
  const yBaseline = $derived(isVertical ? 0 : undefined);

  const x1Scale = $derived(
    isGroupSeries && isVertical ? scaleBand().padding(groupPadding) : undefined
  );
  const x1Domain = $derived(
    isGroupSeries && isVertical ? seriesState.visibleSeries.map((s) => s.key) : undefined
  );

  const x1Range = $derived(
    isGroupSeries && isVertical
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ xScale }: { xScale: AnyScale }) => [0, xScale.bandwidth!()]
      : undefined
  );

  const y1Scale = $derived(
    isGroupSeries && !isVertical ? scaleBand().padding(groupPadding) : undefined
  );
  const y1Domain = $derived(
    isGroupSeries && !isVertical ? seriesState.visibleSeries.map((s) => s.key) : undefined
  );
  const y1Range = $derived(
    isGroupSeries && !isVertical
      ? // TODO: can we do something better here where we don't need to cast this
        // feels fragile!
        ({ yScale }: { yScale: AnyScale }) => [0, yScale.bandwidth!()]
      : undefined
  );

  function isStackData(d: TData): d is TData & { stackData: any[] } {
    return d && typeof d === 'object' && 'stackData' in d;
  }

  const chartData: Array<TData & { stackData?: any }> = $derived.by(() => {
    let _chartData = (
      seriesState.allSeriesData.length ? seriesState.allSeriesData : chartDataArray(data)
    ) as Array<TData & { stackData?: any }>;
    if (isStackSeries) {
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

  function getBarsProps(s: SeriesData<TData, typeof Bars>, i: number): ComponentProps<typeof Bars> {
    const isFirst = i == 0;
    const isLast = i == seriesState.visibleSeries.length - 1;

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

    const valueAccessor = isStackSeries
      ? (d: any) => d.stackData[i]
      : (s.value ?? (s.data ? undefined : s.key));

    return {
      data: s.data,
      x: !isVertical ? valueAccessor : undefined,
      y: isVertical ? valueAccessor : undefined,
      x1: isVertical && isGroupSeries ? (d) => s.value ?? s.key : undefined,
      y1: !isVertical && isGroupSeries ? (d) => s.value ?? s.key : undefined,
      rounded: isStackLayout && i !== seriesState.visibleSeries.length - 1 ? 'none' : 'edge',
      radius: 4,
      strokeWidth: 1,
      insets: stackInsets,
      fill: s.color,
      onBarClick: (e, detail) => onBarClick(e, { ...detail, series: s }),
      ...props.bars,
      ...s.props,
      class: cls(
        'transition-opacity',
        seriesState.highlightKey.current &&
          seriesState.highlightKey.current !== s.key &&
          'opacity-10',
        props.bars?.class,
        s.props?.class
      ),
    };
  }

  function getLabelsProps(
    s: SeriesData<TData, typeof Bars>,
    i: number
  ): ComponentProps<typeof Labels<TData>> {
    return {
      // TODO: Improve placement when using `seriesLayout="group"`
      // data: s.data,
      // y: s.value ?? (s.data ? undefined : s.key),
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
      x: !isVertical || radial,
      y: isVertical,
      ...(typeof grid === 'object' ? grid : null),
      ...props.grid,
    };
  }

  function getHighlightProps(): ComponentProps<typeof Highlight> {
    return {
      area: true,
      ...props.highlight,
    };
  }

  function getAxisProps(axisDirection: 'x' | 'y'): ComponentProps<typeof Axis> {
    if (axisDirection === 'y') {
      return {
        placement: radial ? 'radius' : 'left',

        format: (value) => {
          if (isVertical && seriesLayout === 'stackExpand') {
            return format(value, 'percentRound');
          } else {
            return format(value, undefined, { variant: 'short' });
          }
        },
        ...(typeof axis === 'object' ? axis : null),
        ...props.yAxis,
      };
    }
    return {
      placement: radial ? 'angle' : 'bottom',
      format: (value) => {
        if (!isVertical && seriesLayout === 'stackExpand') {
          return format(value, 'percentRound');
        } else {
          return format(value, undefined, { variant: 'short' });
        }
      },
      ...(typeof axis === 'object' ? axis : null),
      ...props.xAxis,
    };
  }

  function getRuleProps(): ComponentProps<typeof Rule> {
    return {
      x: isVertical ? false : 0,
      y: isVertical ? 0 : false,
      ...(typeof rule === 'object' ? rule : null),
      ...props.rule,
    };
  }

  if (profile) {
    console.time('BarChart render');
    onMount(() => {
      console.timeEnd('BarChart render');
    });
  }

  setTooltipMetaContext({
    type: 'bar',
    get orientation() {
      return orientation;
    },
    get stackSeries() {
      return isStackSeries;
    },
    get visibleSeries() {
      return seriesState.visibleSeries;
    },
  });

  function resolveAccessor(acc: Accessor<TData> | undefined) {
    if (acc) return acc;
    if (isStackSeries) {
      return (d: TData) =>
        isStackData(d) ? seriesState.visibleSeries.flatMap((s, i) => d.stackData[i]) : undefined;
    }
    return seriesState.visibleSeries.map((s) => s.value ?? s.key);
  }
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:context
  data={chartData}
  x={resolveAccessor(xProp)}
  {xScale}
  {xBaseline}
  xNice={orientation === 'horizontal'}
  {x1Scale}
  {x1Domain}
  {x1Range}
  y={resolveAccessor(yProp)}
  {yScale}
  {yBaseline}
  yNice={orientation === 'vertical'}
  {y1Scale}
  {y1Domain}
  {y1Range}
  c={isVertical ? yProp : xProp}
  cRange={['var(--color-primary)']}
  {radial}
  padding={radial ? undefined : defaultChartPadding(axis, legend)}
  {...restProps}
  tooltip={tooltip === false
    ? false
    : {
        mode: 'band',
        onclick: onTooltipClick,
        debug,
        ...props.tooltip?.context,
      }}
>
  {#snippet children({ context })}
    {@const snippetProps = {
      context,
      series,
      visibleSeries: seriesState.visibleSeries,
      getBarsProps,
      getLabelsProps,
      getLegendProps,
      getGridProps,
      getHighlightProps,
      getAxisProps,
      getRuleProps,
      highlightKey: seriesState.highlightKey.current,
      setHighlightKey: seriesState.highlightKey.set,
    }}
    {#if childrenProp}
      {@render childrenProp(snippetProps)}
    {:else}
      {@const Component = renderContext === 'canvas' ? Canvas : Svg}
      {@render belowContext?.(snippetProps)}

      <Component
        {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
        center={radial}
        {debug}
      >
        {#if typeof grid === 'function'}
          {@render grid(snippetProps)}
        {:else if grid}
          <Grid {...getGridProps()} />
        {/if}
        {@render belowMarks?.(snippetProps)}

        {#if typeof marks === 'function'}
          {@render marks(snippetProps)}
        {:else}
          {#each seriesState.visibleSeries as s, i (s.key)}
            <Bars {...getBarsProps(s, i)} />
          {/each}
        {/if}

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
        <DefaultTooltip
          tooltipProps={props.tooltip}
          canHaveTotal={isStackSeries || isGroupSeries}
          {seriesState}
        />
      {/if}
    {/if}
  {/snippet}
</Chart>
