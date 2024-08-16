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

  import { type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    layout?: typeof layout;
    bandPadding?: typeof bandPadding;
    labels?: typeof labels;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  export let layout: 'vertical' | 'horizontal' = 'vertical';
  export let bandPadding = 0.4;
  export let labels: ComponentProps<Labels> | boolean = false;

  $: isVertical = layout === 'vertical';

  $: xScale = isVertical ? scaleBand().padding(bandPadding) : scaleLinear();
  $: xDomain = isVertical ? undefined : [0, null];

  $: yScale = isVertical ? scaleLinear() : scaleBand().padding(bandPadding);
  $: yDomain = isVertical ? [0, null] : undefined;
</script>

<Chart
  {data}
  {x}
  {xScale}
  {xDomain}
  xNice={layout === 'horizontal'}
  {y}
  {yScale}
  {yDomain}
  yNice={layout === 'vertical'}
  padding={{ left: 16, bottom: 16 }}
  tooltip={{ mode: 'band' }}
  {...$$restProps}
  let:x
  let:y
  let:tooltip
>
  <slot {x} {y} {tooltip}>
    <Svg>
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
      <Bars radius={4} strokeWidth={1} class="fill-primary" />
      <Highlight area />
      {#if labels}
        <Labels {...typeof labels === 'object' ? labels : null} />
      {/if}
    </Svg>

    <slot name="tooltip" {x} {y}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(isVertical ? x(data) : y(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={isVertical ? y(data) : x(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
