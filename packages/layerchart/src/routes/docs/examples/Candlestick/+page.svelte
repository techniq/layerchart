<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';

  import { Chart, Svg } from 'layerchart';
  import Axis from '$lib/components/Axis.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Points from '$lib/components/Points.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import { PeriodType, formatDate } from 'svelte-ux';

  export let data;
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<!-- TODO: Should use xScale={scaleTime()} once `<Bar>` / createDimensionGetter() supports it -->
<Preview data={data.appleTicker}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={data.appleTicker}
      x="date"
      xScale={scaleBand().paddingInner(0.4)}
      y={['high', 'low']}
      yNice
      r={(d) => (d.close < d.open ? 'desc' : 'asc')}
      rScale={scaleOrdinal()}
      rDomain={['desc', 'asc']}
      rRange={['#e41a1c', '#4daf4a']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule ticks={10} />
        <Axis placement="bottom" rule format={(d) => ''} />
        <Points links r={0} />
        <Bars y={(d) => [d.open, d.close]} radius={2} />
        <Highlight area />
      </Svg>
      <Tooltip header={(data) => formatDate(data.date, PeriodType.Day)} let:data>
        <TooltipItem label="Open" value={data.open} format="decimal" />
        <TooltipItem label="Close" value={data.close} format="decimal" />
        <TooltipItem label="High" value={data.high} format="decimal" />
        <TooltipItem label="Low" value={data.low} format="decimal" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
