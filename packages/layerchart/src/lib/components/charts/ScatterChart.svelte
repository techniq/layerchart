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
    labels?: typeof labels;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  export let labels: ComponentProps<Labels> | boolean = false;

  // Default xScale based on first data's `x` value
  $: xScale = accessor(x)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear();
</script>

<Chart
  {data}
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
>
  {@const slotProps = { x, xScale, y, yScale, width, height, padding, tooltip }}
  <slot {...slotProps}>
    <Svg>
      <slot name="axis" {...slotProps}>
        <Axis
          placement="left"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
        <Axis
          placement="bottom"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
      </slot>

      <slot name="marks" {...slotProps}>
        <Points class="fill-primary/10 stroke-primary" />
      </slot>

      <slot name="highlight" {...slotProps}>
        <Highlight points lines axis="both" />
      </slot>

      {#if labels}
        <Labels {...typeof labels === 'object' ? labels : null} format={(value) => format(value)} />
      {/if}
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={format(y(data))} />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
