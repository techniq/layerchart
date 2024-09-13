<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleOrdinal } from 'd3-scale';
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
    - [ ] Multiple/concentric charts (data prop, with different domains) - http://localhost:3002/docs/examples/Arc#concentric
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
    separateTracks?: typeof separateTracks;
    props?: typeof props;
    // series?: typeof series;
    // labels?: typeof labels;
  }

  export let data: $$Props['data'] = [];
  $: chartData = chartDataArray(data);

  /** Label accessor */
  export let label: Accessor<TData> = 'label';
  $: labelAccessor = accessor(label);

  /** Value accessor */
  export let value: Accessor<TData> = 'value';
  $: valueAccessor = accessor(value);

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

  /**
   * Show values as individual, concentric arcs
   */
  export let separateTracks = false;

  export let colorScale = scaleOrdinal();
  export let colorKeys = [...new Set(chartDataArray(data).map((d) => accessor(label)(d)))];
  export let colors = [
    'hsl(var(--color-info))',
    'hsl(var(--color-success))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ];

  export let props: {
    pie?: Partial<ComponentProps<Pie>>;
    group?: Partial<ComponentProps<Group>>;
    arc?: Partial<ComponentProps<Arc>>;
  } = {};
</script>

<Chart
  {data}
  x={value}
  y={label}
  r={label}
  rScale={colorScale}
  rDomain={colorKeys}
  rRange={colors}
  {...$$restProps}
  let:x
  let:xScale
  let:y
  let:r
  let:rScale
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
        <Pie
          {range}
          {innerRadius}
          {outerRadius}
          {cornerRadius}
          {padAngle}
          {placement}
          {...props.pie}
          let:arcs
        >
          <Group {...props.group}>
            {#if separateTracks}
              {@const sumValue = Number(sum(chartData, valueAccessor))}
              {#each chartData as d, i}
                <Arc
                  value={valueAccessor(d)}
                  domain={[0, sumValue]}
                  outerRadius={i * (outerRadius ?? 0)}
                  {innerRadius}
                  {cornerRadius}
                  {padAngle}
                  fill={rScale(r(d))}
                  track={{ fill: rScale(r(d)), 'fill-opacity': 0.1 }}
                  {tooltip}
                  data={d}
                  {...props.arc}
                />
              {/each}
            {:else}
              {#each arcs as arc}
                <Arc
                  startAngle={arc.startAngle}
                  endAngle={arc.endAngle}
                  {outerRadius}
                  {innerRadius}
                  {cornerRadius}
                  {padAngle}
                  fill={rScale(r(arc.data))}
                  data={arc.data}
                  {tooltip}
                  {...props.arc}
                />
              {/each}
            {/if}
          </Group>
        </Pie>
      </slot>

      <slot name="above-marks" {...slotProps} />
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.List>
          <Tooltip.Item
            label={labelAccessor(data)}
            value={valueAccessor(data)}
            color={rScale(r(data))}
            {format}
          />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
