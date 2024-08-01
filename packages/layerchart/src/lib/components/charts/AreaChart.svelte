<script lang="ts" generics="TData">
  import { format } from 'svelte-ux';

  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';

  import Area from '../Area.svelte';
  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Svg from '../layout/Svg.svelte';
  import TooltipItem from '../TooltipItem.svelte';
  import Tooltip from '../Tooltip.svelte';
  import TooltipHeader from '../TooltipHeader.svelte';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {}

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

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
>
  <slot {x} {y}>
    <Svg>
      <Axis placement="left" grid rule />
      <Axis placement="bottom" rule />
      <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
      <Highlight points lines />
    </Svg>

    <slot name="tooltip" {x} {y}>
      <Tooltip let:data>
        <TooltipHeader>{format(x(data))}</TooltipHeader>
        <TooltipItem label="value" value={y(data)} />
      </Tooltip>
    </slot>
  </slot>
</Chart>
