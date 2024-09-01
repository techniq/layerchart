<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { format } from '@layerstack/utils';

  import Area from '../Area.svelte';
  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    series?: typeof series;
    labels?: typeof labels;
    props?: typeof props;
    stackSeries?: typeof stackSeries;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  /** Stack instead of overlap series */
  export let stackSeries = false;

  export let series: {
    label?: string;
    value: Accessor<TData>;
    color?: string;
    props?: Partial<ComponentProps<Area>>;
  }[] = [{ value: y, color: 'hsl(var(--color-primary))' }];

  export let labels: ComponentProps<Labels> | boolean = false;

  // Default xScale based on first data's `x` value
  $: xScale = accessor(x)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear();

  export let props: {
    axisLeft?: Partial<ComponentProps<Axis>>;
    axisBottom?: Partial<ComponentProps<Axis>>;
    area?: Partial<ComponentProps<Area>>;
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
  {x}
  {xScale}
  y={y ??
    (stackSeries ? (d) => series.map((s, i) => d.stackData[i][1]) : series.map((s) => s.value))}
  yDomain={[0, null]}
  yNice
  padding={{ left: 16, bottom: 16 }}
  tooltip={{ mode: 'bisect-x' }}
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
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.axisLeft}
        />
        <Axis
          placement="bottom"
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.axisBottom}
        />
      </slot>

      <slot name="before-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s, i}
          <Area
            y0={stackSeries ? (d) => d.stackData[i][0] : undefined}
            y1={stackSeries ? (d) => d.stackData[i][1] : s.value}
            line={{ class: 'stroke-2', stroke: s.color }}
            fill={s.color}
            fill-opacity={0.3}
            {...props.area}
            {...s.props}
          />
        {/each}
      </slot>

      <slot name="after-marks" {...slotProps} />

      <slot name="highlight" {...slotProps}>
        {#each series as s, i}
          <Highlight
            y={stackSeries ? (d) => d.stackData[i][1] : s.value}
            points={{ fill: s.color }}
            lines={i == 0}
            {...props.highlight}
          />
        {/each}
      </slot>

      {#if labels}
        <Labels {...props.labels} {...typeof labels === 'object' ? labels : null} />
      {/if}
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          {#each series as s}
            {@const valueAccessor = accessor(s.value)}
            <Tooltip.Item
              label={s.label ?? 'value'}
              value={valueAccessor(data)}
              color={s.color}
              {format}
            />
          {/each}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
