<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleOrdinal } from 'd3-scale';
  import { sum } from 'd3-array';

  import Arc from '../Arc.svelte';
  import Chart from '../Chart.svelte';
  import Pie from '../Pie.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

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

  export let separateTracks = false;

  // export let series: {
  //   label?: string;
  //   value: Accessor<TData>;
  //   color?: string;
  //   props?: ComponentProps<Area>;
  // }[] = [{ value: y, color: 'hsl(var(--color-primary))' }];

  // export let labels: ComponentProps<Labels> | boolean = false;

  export let colorScale = scaleOrdinal();
  export let colors = [
    'hsl(var(--color-info))',
    'hsl(var(--color-success))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ];
  export let colorKeys = [...new Set(chartDataArray(data).map((d) => accessor(label)(d)))];
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
      <slot name="before-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#if separateTracks}
          <Pie {range} {innerRadius} {outerRadius} {padAngle} {cornerRadius} {placement} {tooltip}>
            {@const sumValue = Number(sum(chartData, valueAccessor))}
            {#each chartData as d, i}
              {console.log(chartData, i)}
              <Arc
                value={valueAccessor(d)}
                domain={[0, sumValue]}
                outerRadius={i * (outerRadius ?? 0)}
                {innerRadius}
                {cornerRadius}
                fill={rScale(r(d))}
                track={{ fill: rScale(r(d)), 'fill-opacity': 0.1 }}
                on:pointerenter={(e) => tooltip?.show(e, d)}
                on:pointermove={(e) => tooltip?.show(e, d)}
                on:pointerleave={(e) => tooltip?.hide()}
                on:touchmove={(e) => {
                  // Prevent touch to not interfer with pointer when using tooltip
                  e.preventDefault();
                }}
              />
            {/each}
          </Pie>
        {:else}
          <Pie
            {range}
            {innerRadius}
            {outerRadius}
            {padAngle}
            {cornerRadius}
            {placement}
            {tooltip}
          />
        {/if}
      </slot>

      <slot name="after-marks" {...slotProps} />
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.List>
          <Tooltip.Item
            label={labelAccessor(data)}
            value={valueAccessor(data)}
            color={rScale(r(data))}
            format="integer"
          />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
