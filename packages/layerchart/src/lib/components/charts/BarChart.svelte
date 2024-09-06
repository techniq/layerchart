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

  interface $$Props extends ComponentProps<Chart<TData>> {
    series?: typeof series;
    stackSeries?: typeof stackSeries;
    labels?: typeof labels;
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
    label?: string;
    value: Accessor<TData>;
    color?: string;
    props?: Partial<ComponentProps<Bars>>;
  }[] = [{ value: orientation === 'vertical' ? y : x, color: 'hsl(var(--color-primary))' }];

  /** Stack instead of overlap series */
  export let stackSeries = false;

  export let labels: ComponentProps<Labels> | boolean = false;
  export let bandPadding = 0.4;

  $: xScale = isVertical ? scaleBand().padding(bandPadding) : scaleLinear();
  $: xDomain = isVertical ? undefined : [0, null];

  $: yScale = isVertical ? scaleLinear() : scaleBand().padding(bandPadding);
  $: yDomain = isVertical ? [0, null] : undefined;

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    bars?: Partial<ComponentProps<Bars>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
  } = {};

  let chartData = chartDataArray(data) as Array<TData & { stackData?: any }>;
  $: if (stackSeries) {
    const seriesKeys = series.map((s) => {
      if (typeof s.value === 'string') {
        return s.value;
      } else {
        throw new Error(
          `Unsupported series type: ${s.value}.  'stackSeries' currently requires string values`
        );
      }
    });

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
    (stackSeries ? (d) => series.map((s, i) => d.stackData[i][1]) : series.map((s) => s.value))}
  {xScale}
  {xDomain}
  xNice={orientation === 'horizontal'}
  y={y ??
    (stackSeries ? (d) => series.map((s, i) => d.stackData[i][1]) : series.map((s) => s.value))}
  {yScale}
  {yDomain}
  yNice={orientation === 'vertical'}
  padding={{ left: 16, bottom: 16 }}
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
        <Axis
          placement="left"
          grid={isVertical}
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.yAxis}
        />
        <Axis
          placement="bottom"
          grid={!isVertical}
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.xAxis}
        />
      </slot>

      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s, i}
          <Bars
            x={isVertical ? undefined : stackSeries ? (d) => d.stackData[i] : s.value}
            y={isVertical ? (stackSeries ? (d) => d.stackData[i] : s.value) : undefined}
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
            {@const valueAccessor = accessor(s.value)}
            <Tooltip.Item
              label={s.label ?? 'value'}
              value={valueAccessor(data)}
              color={s.color}
              {format}
              valueAlign="right"
            />
          {/each}

          {#if stackSeries}
            <Tooltip.Separator />

            <Tooltip.Item
              label="total"
              value={sum(series, (s) => {
                const valueAccessor = accessor(s.value);
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
