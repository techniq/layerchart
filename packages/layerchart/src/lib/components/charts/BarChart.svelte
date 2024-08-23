<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import Axis from '../Axis.svelte';
  import Bars from '../Bars.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    series?: typeof series;
    labels?: typeof labels;
    layout?: typeof layout;
    bandPadding?: typeof bandPadding;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  export let layout: 'vertical' | 'horizontal' = 'vertical';
  $: isVertical = layout === 'vertical';

  export let series: {
    label?: string;
    value: Accessor<TData>;
    color?: string;
    props?: ComponentProps<Bars>;
  }[] = [{ value: layout === 'vertical' ? y : x, color: 'hsl(var(--color-primary))' }];

  export let labels: ComponentProps<Labels> | boolean = false;
  export let bandPadding = 0.4;

  $: xScale = isVertical ? scaleBand().padding(bandPadding) : scaleLinear();
  $: xDomain = isVertical ? undefined : [0, null];

  $: yScale = isVertical ? scaleLinear() : scaleBand().padding(bandPadding);
  $: yDomain = isVertical ? [0, null] : undefined;
</script>

<Chart
  {data}
  x={x ?? series.map((s) => s.value)}
  {xScale}
  {xDomain}
  xNice={layout === 'horizontal'}
  y={y ?? series.map((d) => d.value)}
  {yScale}
  {yDomain}
  yNice={layout === 'vertical'}
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
  {@const slotProps = { x, xScale, y, yScale, width, height, padding, tooltip }}
  <slot {...slotProps}>
    <Svg>
      <slot name="axis" {...slotProps}>
        <Axis
          placement="left"
          grid={isVertical}
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
        <Axis
          placement="bottom"
          grid={!isVertical}
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
      </slot>

      <slot name="before-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s}
          <Bars
            x={isVertical ? undefined : s.value}
            y={isVertical ? s.value : undefined}
            radius={4}
            strokeWidth={1}
            fill={s.color}
            {...s.props}
          />
        {/each}
      </slot>

      <slot name="after-marks" {...slotProps} />

      <slot name="highlight" {...slotProps}>
        <Highlight area />
      </slot>

      {#if labels}
        <Labels {...typeof labels === 'object' ? labels : null} />
      {/if}
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(isVertical ? x(data) : y(data))}</Tooltip.Header>
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
