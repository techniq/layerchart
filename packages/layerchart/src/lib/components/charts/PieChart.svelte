<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';

  import Arc from '../Arc.svelte';
  import Chart from '../Chart.svelte';
  import Group from '../Group.svelte';
  import Legend from '../Legend.svelte';
  import Pie from '../Pie.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  type ChartProps = ComponentProps<Chart<TData>>;

  interface $$Props extends ChartProps {
    cornerRadius?: typeof cornerRadius;
    innerRadius?: typeof innerRadius;
    key?: typeof key;
    label?: typeof label;
    legend?: typeof legend;
    maxValue?: typeof maxValue;
    outerRadius?: typeof outerRadius;
    padAngle?: typeof padAngle;
    props?: typeof props;
    range?: typeof range;
    series?: typeof series;
    value?: typeof label;
  }

  export let data: ChartProps['data'] = [];

  /** Key accessor */
  export let key: Accessor<TData> = 'key';
  $: keyAccessor = accessor(key);

  /** Label accessor */
  export let label: Accessor<TData> = 'label';
  $: labelAccessor = accessor(label);

  /** Value accessor */
  export let value: Accessor<TData> = 'value';
  $: valueAccessor = accessor(value);

  /** Maximum possible value, useful when `data` is single item */
  export let maxValue: number | undefined = undefined;

  export let series: {
    key: string | number;
    label?: string;
    value?: Accessor<TData>;
    /** Provider series data, else uses chart data (with value/key accessor) */
    data?: TData[];
    /** Maximum possible value, useful when `data` is single item */
    maxValue?: number;
    color?: string;
    props?: Partial<ComponentProps<Arc>>;
  }[] = [{ key: 'default', value: value /*, color: 'hsl(var(--color-primary))'*/ }];

  export let legend: ComponentProps<Legend> | boolean = false;

  /**
   * Range [min,max] in degrees.  See also startAngle/endAngle
   */
  export let range = [0, 360];

  /**
   * Define innerRadius.
   *   value >= 1: discrete value
   *   value >  0: percent of `outerRadius`
   *   value <  0: offset of `outerRadius`
   *   default: yRange min
   */
  export let innerRadius: number | undefined = undefined;

  /**
   * Define outerRadius.  Defaults to yRange max/2 (ie. chart height / 2)
   */
  export let outerRadius: number | undefined = undefined;

  export let cornerRadius = 0;
  export let padAngle = 0;

  export let props: {
    pie?: Partial<ComponentProps<Pie>>;
    group?: Partial<ComponentProps<Group>>;
    arc?: Partial<ComponentProps<Arc>>;
    legend?: Partial<ComponentProps<Legend>>;
  } = {};

  $: allSeriesData = series
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData>;

  $: chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<TData>;

  $: seriesColors = series.map((s) => s.color).filter((d) => d != null);
</script>

<Chart
  data={chartData}
  x={value}
  y={key}
  c={key}
  cRange={seriesColors.length
    ? seriesColors
    : [
        'hsl(var(--color-primary))',
        'hsl(var(--color-secondary))',
        'hsl(var(--color-info))',
        'hsl(var(--color-success))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-danger))',
      ]}
  padding={{ bottom: legend === true ? 32 : 0 }}
  {...$$restProps}
  let:x
  let:xScale
  let:y
  let:c
  let:cScale
  let:yScale
  let:width
  let:height
  let:padding
  let:tooltip
>
  {@const slotProps = {
    key,
    label,
    value,
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
  }}
  <slot {...slotProps}>
    <Svg center>
      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        <Group {...props.group}>
          {#each series as s, i}
            {@const singleArc = s.data?.length === 1 || chartData.length === 1}
            {#if singleArc}
              {@const d = s.data?.[0] || chartData[0]}
              <Arc
                value={valueAccessor(d)}
                domain={[0, s.maxValue ?? maxValue ?? sum(chartData, valueAccessor)]}
                {range}
                {innerRadius}
                outerRadius={(outerRadius ?? 0) < 0 ? i * (outerRadius ?? 0) : outerRadius}
                {cornerRadius}
                {padAngle}
                fill={s.color ?? cScale?.(c(d))}
                track={{ fill: s.color ?? cScale?.(c(d)), 'fill-opacity': 0.1 }}
                {tooltip}
                data={d}
                {...props.arc}
                {...s.props}
              />
            {:else}
              <Pie
                data={s.data}
                {range}
                {innerRadius}
                {outerRadius}
                {cornerRadius}
                {padAngle}
                {...props.pie}
                let:arcs
              >
                {#each arcs as arc}
                  <Arc
                    startAngle={arc.startAngle}
                    endAngle={arc.endAngle}
                    outerRadius={i * (outerRadius ?? 0)}
                    {innerRadius}
                    {cornerRadius}
                    {padAngle}
                    fill={cScale?.(c(arc.data))}
                    data={arc.data}
                    {tooltip}
                    {...props.arc}
                    {...s.props}
                  />
                {/each}
              </Pie>
            {/if}
          {/each}
        </Group>
      </slot>

      <slot name="above-marks" {...slotProps} />
    </Svg>

    <slot name="legend" {...slotProps}>
      {#if legend}
        <Legend
          tickFormat={(tick) => {
            const item = chartData.find((d) => keyAccessor(d) === tick);
            return item ? (labelAccessor(item) ?? tick) : tick;
          }}
          placement="bottom"
          variant="swatches"
          {...props.legend}
          {...typeof legend === 'object' ? legend : null}
        />
      {/if}
    </slot>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.List>
          <Tooltip.Item
            label={labelAccessor(data) || keyAccessor(data)}
            value={valueAccessor(data)}
            color={cScale?.(c(data))}
            {format}
          />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
