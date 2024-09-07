<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Points from '../Points.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    series?: typeof series;
    labels?: typeof labels;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  export let series: {
    key: string;
    label?: string;
    data: TData[];
    color?: string;
    props?: Partial<ComponentProps<Points>>;
  }[] = [{ key: 'default', data: chartDataArray(data), color: 'hsl(var(--color-primary))' }];

  export let labels: ComponentProps<Labels> | boolean = false;

  // Default xScale based on first data's `x` value
  $: xScale = accessor(x)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear();

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    points?: Partial<ComponentProps<Points>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
  } = {};

  let chartData = series
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData>;
</script>

<Chart
  data={chartData}
  {x}
  {xScale}
  {y}
  yNice
  padding={{ left: 16, bottom: 16 }}
  tooltip={{ mode: 'voronoi' }}
  {...$$restProps}
  let:x
  let:xScale
  let:y
  let:yScale
  let:width
  let:height
  let:padding
  let:tooltip
  let:config
>
  {@const slotProps = { x, xScale, y, yScale, width, height, padding, tooltip, series }}
  {@const activeSeries = tooltip.data
    ? (series.find((s) => s.key === tooltip.data.seriesKey) ?? series[0])
    : null}

  <slot {...slotProps}>
    <Svg>
      <slot name="axis" {...slotProps}>
        <Axis
          placement="left"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.yAxis}
        />
        <Axis
          placement="bottom"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.xAxis}
        />
      </slot>

      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s}
          <Points
            data={s.data}
            stroke={s.color}
            fill={s.color}
            fill-opacity={0.3}
            {...props.points}
            {...s.props}
          />
        {/each}
      </slot>

      <slot name="above-marks" {...slotProps} />

      <slot name="highlight" {...slotProps}>
        <Highlight points={{ fill: activeSeries?.color }} lines axis="both" {...props.highlight} />
      </slot>

      {#if labels}
        <Labels
          format={(value) => format(value)}
          {...props.highlight}
          {...typeof labels === 'object' ? labels : null}
        />
      {/if}
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        {#if activeSeries?.key !== 'default'}
          <Tooltip.Header color={activeSeries?.color}>
            {activeSeries?.label ?? activeSeries?.key}
          </Tooltip.Header>
        {/if}
        <Tooltip.List>
          <Tooltip.Item label={typeof config.x ? config.x : 'x'} value={x(data)} {format} />
          <Tooltip.Item label={typeof config.y ? config.y : 'y'} value={y(data)} {format} />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
