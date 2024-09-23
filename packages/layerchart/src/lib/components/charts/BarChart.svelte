<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';

  import Axis from '../Axis.svelte';
  import Bars from '../Bars.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  type ChartProps = ComponentProps<Chart<TData>>;

  interface $$Props extends ChartProps {
    series?: typeof series;
    seriesLayout?: typeof seriesLayout;
    labels?: typeof labels;
    axis?: typeof axis;
    orientation?: typeof orientation;
    bandPadding?: typeof bandPadding;
    props?: typeof props;
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
      color: 'hsl(var(--color-primary))',
    },
  ];

  /** Determine how to layout series.  Overlap (default), stack, or group side by side */
  export let seriesLayout: 'overlap' | 'stack' | 'group' = 'overlap';
  $: stackSeries = seriesLayout === 'stack';
  $: groupSeries = seriesLayout === 'group';

  export let axis: ComponentProps<Axis> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;

  /** Padding between primary x or y bands/bars, applied to scaleBand().padding() */
  export let bandPadding = 0.4;
  /** Padding between group/series items when using 'seriesLayout="group"', applied to scaleBand().padding() */
  export let groupPadding = 0;

  $: xScale = isVertical ? scaleBand().padding(bandPadding) : scaleLinear();
  $: xBaseline = isVertical ? undefined : 0;

  $: yScale = isVertical ? scaleLinear() : scaleBand().padding(bandPadding);
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
    bars?: Partial<ComponentProps<Bars>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
  } = {};

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
    const stackData = stack().keys(seriesKeys)(chartDataArray(data)) as any[];

    chartData = chartData.map((d, i) => {
      return {
        ...d,
        stackData: stackData.map((sd) => sd[i]),
      };
    });
  }
</script>

<Chart
  data={chartData}
  x={x ??
    (stackSeries
      ? (d) => series.map((s, i) => d.stackData[i][1])
      : series.map((s) => s.value ?? s.key))}
  {xScale}
  {xBaseline}
  xNice={orientation === 'horizontal'}
  {x1Scale}
  {x1Domain}
  {x1Range}
  y={y ??
    (stackSeries
      ? (d) => series.map((s, i) => d.stackData[i][1])
      : series.map((s) => s.value ?? s.key))}
  {yScale}
  {yBaseline}
  yNice={orientation === 'vertical'}
  {y1Scale}
  {y1Domain}
  {y1Range}
  padding={axis === false ? undefined : { left: 16, bottom: 16 }}
  tooltip={{ mode: 'band' }}
  {...$$restProps}
  let:x
  let:xScale
  let:y
  let:yScale
  let:width
  let:height
  let:padding
  let:tooltip
>
  {@const slotProps = { x, xScale, y, yScale, width, height, padding, tooltip, series }}
  <slot {...slotProps}>
    <Svg>
      <slot name="axis" {...slotProps}>
        {#if axis}
          <Axis
            placement="left"
            grid={isVertical}
            rule
            format={(value) => format(value, undefined, { variant: 'short' })}
            {...typeof axis === 'object' ? axis : null}
            {...props.yAxis}
          />
          <Axis
            placement="bottom"
            grid={!isVertical}
            rule
            format={(value) => format(value, undefined, { variant: 'short' })}
            {...typeof axis === 'object' ? axis : null}
            {...props.xAxis}
          />
        {/if}
      </slot>

      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s, i}
          <Bars
            data={s.data}
            x={!isVertical
              ? stackSeries
                ? (d) => d.stackData[i]
                : (s.value ?? (s.data ? undefined : s.key))
              : undefined}
            y={isVertical
              ? stackSeries
                ? (d) => d.stackData[i]
                : (s.value ?? (s.data ? undefined : s.key))
              : undefined}
            x1={isVertical && groupSeries ? (d) => s.value ?? s.key : undefined}
            y1={!isVertical && groupSeries ? (d) => s.value ?? s.key : undefined}
            radius={4}
            strokeWidth={1}
            fill={s.color}
            {...props.bars}
            {...s.props}
          />
        {/each}
      </slot>

      <slot name="above-marks" {...slotProps} />

      <slot name="highlight" {...slotProps}>
        <Highlight area {...props.highlight} />
      </slot>

      {#if labels}
        <Labels {...props.labels} {...typeof labels === 'object' ? labels : null} />
      {/if}
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(isVertical ? x(data) : y(data))}</Tooltip.Header>
        <Tooltip.List>
          <!-- Reverse series order so tooltip items match stacks -->
          {@const seriesItems = stackSeries ? [...series].reverse() : series}
          {#each seriesItems as s}
            {@const valueAccessor = accessor(s.value ?? s.key)}
            <Tooltip.Item
              label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
              value={valueAccessor(data)}
              color={s.color}
              {format}
              valueAlign="right"
            />
          {/each}

          {#if stackSeries || groupSeries}
            <Tooltip.Separator />

            <Tooltip.Item
              label="total"
              value={sum(series, (s) => {
                const valueAccessor = accessor(s.value ?? s.key);
                return valueAccessor(data);
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
