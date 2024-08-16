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
  yDomain={[0, null]}
  yNice
  padding={{ left: 16, bottom: 16 }}
  tooltip={{ mode: 'bisect-x' }}
  {...$$restProps}
  let:x
  let:y
  let:tooltip
>
  <slot {x} {y} {tooltip}>
    <Svg>
      <Axis
        placement="left"
        grid
        rule
        format={(value) => format(value, undefined, { variant: 'short' })}
      />
      <Axis
        placement="bottom"
        rule
        format={(value) => format(value, undefined, { variant: 'short' })}
      />
      <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
      <Highlight points lines />
      {#if labels}
        <Labels {...typeof labels === 'object' ? labels : null} />
      {/if}
    </Svg>

    <slot name="tooltip" {x} {y}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
