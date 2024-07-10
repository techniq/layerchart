<script lang="ts" generics="TData">
  import { format, PeriodType } from 'svelte-ux';

  import { type ComponentProps } from 'svelte';
  import { scaleTime } from 'd3-scale';

  import Area from '../Area.svelte';
  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Svg from '../layout/Svg.svelte';
  import TooltipItem from '../TooltipItem.svelte';
  import Tooltip from '../Tooltip.svelte';

  interface $$Props extends ComponentProps<Chart<TData>> {}

  export let data: $$Props['data'] = [];
</script>

<Chart
  {data}
  x="date"
  xScale={scaleTime()}
  y="value"
  yDomain={[0, null]}
  yNice
  padding={{ left: 16, bottom: 24 }}
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
      <Tooltip header={(data) => format(x(data))} let:data>
        <TooltipItem label="value" value={y(data)} />
      </Tooltip>
    </slot>
  </slot>
</Chart>
