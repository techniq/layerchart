<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';

  import Arc from '../Arc.svelte';
  import Chart from '../Chart.svelte';
  import Group from '../Group.svelte';
  import Pie from '../Pie.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  /*
    TODO:
    - [ ] Centroid labels
    - [ ] Outside/offset labels
    - [x] Multiple/concentric charts (data prop, with different domains) - http://localhost:3002/docs/examples/Arc#concentric
    - [ ] Segmented arcs - http://localhost:3002/docs/examples/Arc#segmented_arc
  */

  interface $$Props extends ComponentProps<Chart<TData>> {
    label?: typeof label;
    value?: typeof label;
    range?: typeof range;
    innerRadius?: typeof innerRadius;
    outerRadius?: typeof outerRadius;
    cornerRadius?: typeof cornerRadius;
    padAngle?: typeof padAngle;
    placement?: typeof placement;
    props?: typeof props;
    series?: typeof series;
    // labels?: typeof labels;
  }

  export let data: $$Props['data'] = [];

  /** Label accessor */
  export let label: Accessor<TData> = 'label';
  $: labelAccessor = accessor(label);

  /** Value accessor */
  export let value: Accessor<TData> = 'value';
  $: valueAccessor = accessor(value);

  export let series: {
    key: string | number;
    label?: string;
    value?: Accessor<TData>;
    /** Provider series data, else uses chart data (with value/key accessor) */
    data?: TData | TData[];
    /** Maximum possible value, required when `data` is single item */
    total?: number;
    color?: string;
    props?: Partial<ComponentProps<Arc>>;
  }[] = [{ key: 'default', value: value /*, color: 'hsl(var(--color-primary))'*/ }];

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

  export let placement: 'left' | 'center' | 'right' | 'none' = 'center';

  export let props: {
    pie?: Partial<ComponentProps<Pie>>;
    group?: Partial<ComponentProps<Group>>;
    arc?: Partial<ComponentProps<Arc>>;
  } = {};

  $: allSeriesData = series
    .flatMap((s) =>
      Array.isArray(s.data)
        ? s.data.map((d) => ({ seriesKey: s.key, ...d }))
        : s.data
          ? [s.data]
          : null
    )
    .filter((d) => d) as Array<TData & { stackData?: any }>;

  $: chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<TData>;

  $: seriesColors = series.map((s) => s.color).filter((d) => d != null);
</script>

<Chart
  data={chartData}
  x={value}
  y={label}
  c={label}
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
  {@const slotProps = { label, value, x, xScale, y, yScale, width, height, padding, tooltip }}
  <slot {...slotProps}>
    <Svg>
      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s, i}
          <!-- Redundant logic to make Typescript happy -->
          <Group center={s.data && !Array.isArray(s.data)} {...props.group}>
            {#if s.data && !Array.isArray(s.data)}
              <Arc
                value={valueAccessor(s.data)}
                domain={[0, s.total ?? sum(chartData, valueAccessor)]}
                {range}
                {innerRadius}
                outerRadius={i * (outerRadius ?? 0)}
                {cornerRadius}
                {padAngle}
                fill={s.color ?? cScale(c(s.data))}
                track={{ fill: s.color ?? cScale(c(s.data)), 'fill-opacity': 0.1 }}
                {tooltip}
                data={s.data}
                {...props.arc}
              />
            {:else}
              <Pie
                data={s.data}
                {range}
                {innerRadius}
                {outerRadius}
                {cornerRadius}
                {padAngle}
                {placement}
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
                    fill={cScale(c(arc.data))}
                    data={arc.data}
                    {tooltip}
                    {...props.arc}
                  />
                {/each}
              </Pie>
            {/if}
          </Group>
        {/each}
      </slot>

      <slot name="above-marks" {...slotProps} />
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.List>
          <Tooltip.Item
            label={labelAccessor(data)}
            value={valueAccessor(data)}
            color={cScale(c(data))}
            {format}
          />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
