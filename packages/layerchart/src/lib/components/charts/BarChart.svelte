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
  import Chart from '../Chart.svelte';
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
    type Accessor,
  } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import type { Insets } from '../../utils/rect.js';

  type ChartProps = ComponentProps<Chart<TData>>;

  interface $$Props extends ChartProps {
    axis?: typeof axis;
    debug?: typeof debug;
    grid?: typeof grid;
    bandPadding?: typeof bandPadding;
    groupPadding?: typeof groupPadding;
    stackPadding?: typeof stackPadding;
    labels?: typeof labels;
    legend?: typeof legend;
    orientation?: typeof orientation;
    profile?: typeof profile;
    props?: typeof props;
    rule?: typeof rule;
    series?: typeof series;
    seriesLayout?: typeof seriesLayout;
    renderContext?: typeof renderContext;
    onbarclick?: typeof onbarclick;
    ontooltipclick?: typeof ontooltipclick;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  export let orientation: 'vertical' | 'horizontal' = 'vertical';
  $: isVertical = orientation === 'vertical';

  export let series: {
    key: string;
    label?: string;
    value?: Accessor<TData>;
    /** Provider series data, else uses chart data (with value/key accessor) */
    data?: TData[];
    color?: string;
    props?: Partial<ComponentProps<Bars>>;
  }[] = [
    {
      key: 'default',
      value: orientation === 'vertical' ? y : x,
    },
  ];
  $: isDefaultSeries = series.length === 1 && series[0].key === 'default';

  /** Determine how to layout series.  Overlap (default), stack, or group side by side */
  export let seriesLayout: 'overlap' | 'group' | 'stack' | 'stackExpand' | 'stackDiverging' =
    'overlap';
  $: stackSeries = seriesLayout.startsWith('stack');
  $: groupSeries = seriesLayout === 'group';

  export let axis: ComponentProps<Axis> | 'x' | 'y' | boolean = true;
  export let rule: ComponentProps<Rule> | boolean = true;
  export let grid: ComponentProps<Grid> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let legend: ComponentProps<Legend> | boolean = false;

  /** Padding between primary x or y bands/bars, applied to scaleBand().padding() */
  export let bandPadding = 0.4;
  /** Padding between group/series items when using 'seriesLayout="group"', applied to scaleBand().padding() */
  export let groupPadding = 0;
  /** Padding between series items within bars when using 'seriesLayout="stack"' */
  export let stackPadding = 0;

  /** Expose tooltip context for external access */
  export let tooltipContext: ComponentProps<Tooltip.Context>['tooltip'] = undefined;

  /** Event dispatched with current tooltip data */
  export let ontooltipclick: (e: MouseEvent, detail: { data: any }) => void = () => {};

  // TODO: Need to find a way to have this play nice with `tooltip={{ mode: 'band' }}`
  /** Event dispatched when individual Bar is clicked (useful with multiple series) */
  export let onbarclick: (
    e: MouseEvent,
    detail: { data: any; series: (typeof series)[number] }
  ) => void = () => {};

  $: xScale = $$props.xScale ?? (isVertical ? scaleBand().padding(bandPadding) : scaleLinear());
  $: xBaseline = isVertical ? undefined : 0;

  $: yScale = $$props.yScale ?? (isVertical ? scaleLinear() : scaleBand().padding(bandPadding));
  $: yBaseline = isVertical ? 0 : undefined;

  let x1Scale: ChartProps['x1Scale'];
  let x1Domain: ChartProps['x1Domain'];
  let x1Range: ChartProps['x1Range'];

  let y1Scale: ChartProps['y1Scale'];
  let y1Domain: ChartProps['y1Domain'];
  let y1Range: ChartProps['y1Range'];

  $: if (seriesLayout === 'group') {
    if (isVertical) {
      x1Scale = scaleBand().padding(groupPadding);
      x1Domain = visibleSeries.map((s) => s.key);
      x1Range = ({ xScale }) => [0, xScale.bandwidth?.()];
    } else {
      y1Scale = scaleBand().padding(groupPadding);
      y1Domain = visibleSeries.map((s) => s.key);
      y1Range = ({ yScale }) => [0, yScale.bandwidth?.()];
    }
  }

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    grid?: Partial<ComponentProps<Grid>>;
    rule?: Partial<ComponentProps<Rule>>;
    bars?: Partial<ComponentProps<Bars>>;
    legend?: Partial<ComponentProps<Legend>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    tooltip?: {
      context?: Partial<ComponentProps<Tooltip.Context>>;
      root?: Partial<ComponentProps<Tooltip.Root>>;
      header?: Partial<ComponentProps<Tooltip.Header>>;
      list?: Partial<ComponentProps<Tooltip.List>>;
      item?: Partial<ComponentProps<Tooltip.Item>>;
      separator?: Partial<ComponentProps<Tooltip.Separator>>;
      hideTotal?: boolean;
    };
  } = {};

  export let renderContext: 'svg' | 'canvas' = 'svg';

  /** Log initial render performance using `console.time` */
  export let profile = false;

  /** Enable debug mode */
  export let debug = false;

  $: allSeriesData = visibleSeries
    .flatMap((s) =>
      s.data?.map((d) => {
        return { seriesKey: s.key, ...d };
      })
    )
    .filter((d) => d) as Array<TData & { stackData?: any }>;

  $: chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<
    TData & { stackData?: any }
  >;

  $: if (stackSeries) {
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

    chartData = chartData.map((d, i) => {
      return {
        ...d,
        stackData: stackData.map((sd) => sd[i]),
      };
    });
  }

  let highlightSeriesKey: (typeof series)[number]['key'] | null = null;

  function setHighlightSeriesKey(seriesKey: typeof highlightSeriesKey) {
    highlightSeriesKey = seriesKey;
  }

  function getBarsProps(s: (typeof series)[number], i: number) {
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
    const barsProps: ComponentProps<Bars> = {
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
      onbarclick: (e, detail) => onbarclick(e, { ...detail, series: s }),
      ...props.bars,
      ...s.props,
      class: cls(
        'transition-opacity',
        highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-10',
        props.bars?.class,
        s.props?.class
      ),
    };

    return barsProps;
  }

  function getLabelsProps(s: (typeof series)[number], i: number) {
    const labelsProps: ComponentProps<Labels> = {
      // TODO: Improve placement when using `seriesLayout="group"`
      // data: s.data,
      // y: s.value ?? (s.data ? undefined : s.key),
      ...props.labels,
      ...(typeof labels === 'object' ? labels : null),
      class: cls(
        'stroke-surface-200 transition-opacity',
        highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-10',
        props.labels?.class,
        typeof labels === 'object' && labels.class
      ),
    };

    return labelsProps;
  }

  const selectedSeries = selectionStore();
  $: visibleSeries = series.filter((s) => {
    return (
      // @ts-expect-error
      $selectedSeries.selected.length === 0 || $selectedSeries.isSelected(s.key)
      // || highlightSeriesKey == s.key
    );
  });

  if (profile) {
    console.time('BarChart render');
    onMount(() => {
      console.timeEnd('BarChart render');
    });
  }
</script>

<Chart
  data={chartData}
  x={x ??
    (stackSeries
      ? (d) => visibleSeries.flatMap((s, i) => d.stackData[i])
      : visibleSeries.map((s) => s.value ?? s.key))}
  {xScale}
  {xBaseline}
  xNice={orientation === 'horizontal'}
  {x1Scale}
  {x1Domain}
  {x1Range}
  y={y ??
    (stackSeries
      ? (d) => visibleSeries.flatMap((s, i) => d.stackData[i])
      : visibleSeries.map((s) => s.value ?? s.key))}
  {yScale}
  {yBaseline}
  yNice={orientation === 'vertical'}
  {y1Scale}
  {y1Domain}
  {y1Range}
  c={isVertical ? y : x}
  cRange={['hsl(var(--color-primary))']}
  padding={defaultChartPadding(axis, legend)}
  {...$$restProps}
  tooltip={$$props.tooltip === false
    ? false
    : {
        mode: 'band',
        onclick: ontooltipclick,
        debug,
        ...props.tooltip?.context,
        ...$$props.tooltip,
      }}
  bind:tooltipContext
  let:x
  let:xScale
  let:y
  let:yScale
  let:c
  let:cScale
  let:width
  let:height
  let:padding
  let:tooltip
>
  {@const slotProps = {
    x,
    xScale,
    y,
    yScale,
    c,
    cScale,
    width,
    height,
    padding,
    tooltip,
    series,
    visibleSeries,
    getBarsProps,
    getLabelsProps,
    setHighlightSeriesKey,
  }}
  <slot {...slotProps}>
    <slot name="belowContext" {...slotProps} />

    <svelte:component this={renderContext === 'canvas' ? Canvas : Svg} {debug}>
      <slot name="grid" {...slotProps}>
        {#if grid}
          <Grid
            x={!isVertical}
            y={isVertical}
            {...typeof grid === 'object' ? grid : null}
            {...props.grid}
          />
        {/if}
      </slot>

      <slot name="belowMarks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each visibleSeries as s, i (s.key)}
          <Bars {...getBarsProps(s, i)} />
        {/each}
      </slot>

      <slot name="aboveMarks" {...slotProps} />

      <slot name="axis" {...slotProps}>
        {#if axis}
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
      </slot>

      <slot name="highlight" {...slotProps}>
        <Highlight area {...props.highlight} />
      </slot>

      {#if labels}
        {#each visibleSeries as s, i (s.key)}
          <Labels {...getLabelsProps(s, i)} />
        {/each}
      {/if}
    </svelte:component>

    <slot name="aboveContext" {...slotProps} />

    <slot name="legend" {...slotProps}>
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
          onclick={(e, item) => $selectedSeries.toggleSelected(item.value)}
          onpointerenter={(e, item) => (highlightSeriesKey = item.value)}
          onpointerleave={(e) => (highlightSeriesKey = null)}
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
    </slot>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root {...props.tooltip?.root} let:data>
        <Tooltip.Header
          value={isVertical ? x(data) : y(data)}
          {format}
          {...props.tooltip?.header}
        />

        <Tooltip.List {...props.tooltip?.list}>
          <!-- Reverse series order so tooltip items match stacks -->
          {@const seriesItems = stackSeries ? [...visibleSeries].reverse() : visibleSeries}
          {#each seriesItems as s}
            {@const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data}
            {@const valueAccessor = accessor(s.value ?? (s.data ? asAny(y) : s.key))}
            <Tooltip.Item
              label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
              value={seriesTooltipData ? valueAccessor(seriesTooltipData) : null}
              color={s.color ?? cScale?.(c(data))}
              {format}
              valueAlign="right"
              onpointerenter={() => (highlightSeriesKey = s.key)}
              onpointerleave={() => (highlightSeriesKey = null)}
              {...props.tooltip?.item}
            />
          {/each}

          {#if (stackSeries || groupSeries) && visibleSeries.length > 1 && !props.tooltip?.hideTotal}
            <Tooltip.Separator {...props.tooltip?.separator} />

            <Tooltip.Item
              label="total"
              value={sum(visibleSeries, (s) => {
                const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data;
                const valueAccessor = accessor(s.value ?? (s.data ? asAny(y) : s.key));
                return valueAccessor(seriesTooltipData);
              })}
              format="integer"
              valueAlign="right"
              {...props.tooltip?.item}
            />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
