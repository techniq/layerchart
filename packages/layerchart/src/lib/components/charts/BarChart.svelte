<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleBand, scaleOrdinal, scaleLinear } from 'd3-scale';
  import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';

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

  type ChartProps = ComponentProps<Chart<TData>>;

  interface $$Props extends ChartProps {
    axis?: typeof axis;
    grid?: typeof grid;
    bandPadding?: typeof bandPadding;
    groupPadding?: typeof groupPadding;
    labels?: typeof labels;
    legend?: typeof legend;
    orientation?: typeof orientation;
    props?: typeof props;
    rule?: typeof rule;
    series?: typeof series;
    seriesLayout?: typeof seriesLayout;
    renderContext?: typeof renderContext;
    onBarClick?: typeof onBarClick;
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

  // TODO: Need to find a way to have this play nice with `tooltip={{ mode: 'band' }}`
  /** Event dispatched when individual Bar is clicked (useful with multiple series) */
  export let onBarClick: (e: { data: any; series: (typeof series)[number] }) => void = () => {};

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
      x1Domain = series.map((s) => s.key);
      x1Range = ({ xScale }) => [0, xScale.bandwidth?.()];
    } else {
      y1Scale = scaleBand().padding(groupPadding);
      y1Domain = series.map((s) => s.key);
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
  } = {};

  export let renderContext: 'svg' | 'canvas' = 'svg';

  $: allSeriesData = series
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
    const seriesKeys = series.map((s) => s.key);
    // const stackData = stack().keys(seriesKeys)(chartDataArray(data)) as any[];

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

  function getBarsProps(s: (typeof series)[number], i: number) {
    const valueAccesor = stackSeries
      ? (d: any) => d.stackData[i]
      : (s.value ?? (s.data ? undefined : s.key));
    const barsProps: ComponentProps<Bars> = {
      data: s.data,
      x: !isVertical ? valueAccesor : undefined,
      y: isVertical ? valueAccesor : undefined,
      x1: isVertical && groupSeries ? (d) => s.value ?? s.key : undefined,
      y1: !isVertical && groupSeries ? (d) => s.value ?? s.key : undefined,
      rounded: seriesLayout.startsWith('stack') && i !== series.length - 1 ? 'none' : 'edge',
      radius: 4,
      strokeWidth: 1,
      fill: s.color,
      onBarClick: (e) => onBarClick({ data: e.data, series: s }),
      ...props.bars,
      ...s.props,
    };

    return barsProps;
  }
</script>

<Chart
  data={chartData}
  x={x ??
    (stackSeries
      ? (d) => series.flatMap((s, i) => d.stackData[i])
      : series.map((s) => s.value ?? s.key))}
  {xScale}
  {xBaseline}
  xNice={orientation === 'horizontal'}
  {x1Scale}
  {x1Domain}
  {x1Range}
  y={y ??
    (stackSeries
      ? (d) => series.flatMap((s, i) => d.stackData[i])
      : series.map((s) => s.value ?? s.key))}
  {yScale}
  {yBaseline}
  yNice={orientation === 'vertical'}
  {y1Scale}
  {y1Domain}
  {y1Range}
  c={isVertical ? y : x}
  cRange={['hsl(var(--color-primary))']}
  padding={defaultChartPadding(axis, legend)}
  tooltip={{ mode: 'band' }}
  {...$$restProps}
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
    getBarsProps,
  }}
  <slot {...slotProps}>
    <svelte:component this={renderContext === 'canvas' ? Canvas : Svg}>
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
        {#each series as s, i (s.key)}
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
        <Labels {...props.labels} {...typeof labels === 'object' ? labels : null} />
      {/if}
    </svelte:component>

    <slot name="legend" {...slotProps}>
      {#if legend}
        <Legend
          scale={isDefaultSeries
            ? undefined
            : scaleOrdinal(
                series.map((s) => s.label ?? s.key),
                series.map((s) => s.color)
              )}
          placement="bottom"
          variant="swatches"
          {...props.legend}
          {...typeof legend === 'object' ? legend : null}
        />
      {/if}
    </slot>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(isVertical ? x(data) : y(data))}</Tooltip.Header>
        <Tooltip.List>
          <!-- Reverse series order so tooltip items match stacks -->
          {@const seriesItems = stackSeries ? [...series].reverse() : series}
          {#each seriesItems as s}
            {@const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data}
            {@const valueAccessor = accessor(s.value ?? (s.data ? (y as any) : s.key))}
            <Tooltip.Item
              label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
              value={seriesTooltipData ? valueAccessor(seriesTooltipData) : null}
              color={s.color ?? cScale?.(c(data))}
              {format}
              valueAlign="right"
            />
          {/each}

          {#if stackSeries || groupSeries}
            <Tooltip.Separator />

            <Tooltip.Item
              label="total"
              value={sum(series, (s) => {
                const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data;
                const valueAccessor = accessor(s.value ?? (s.data ? (y as any) : s.key));
                return valueAccessor(seriesTooltipData);
              })}
              format="integer"
              valueAlign="right"
            />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
