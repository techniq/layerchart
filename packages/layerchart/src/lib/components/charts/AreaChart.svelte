<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';
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
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

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
</script>

<Chart
  {data}
  {x}
  {xScale}
  y={y ?? series.map((d) => d.value)}
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
        {#each series as s}
          <Area
            y1={s.value}
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
          <Highlight y={s.value} points={{ fill: s.color }} lines={i == 0} {...props.highlight} />
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
            <Tooltip.Item label={s.label ?? 'value'} value={valueAccessor(data)} color={s.color} />
          {/each}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
