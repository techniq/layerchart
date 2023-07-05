<script lang="ts">
  import { bin as d3bin } from 'd3-array';
  import { scaleBand } from 'd3-scale';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import HighlightRect from '$lib/components/HighlightRect.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import olympians from '../_data/olympians.json';
  import RangeField from '$lib/docs/RangeField.svelte';

  let thresholds = 10;

  $: bin = d3bin()
    .value((d) => d.weight)
    .thresholds(thresholds);

  $: data = bin(olympians);
</script>

<h1>Examples</h1>

<RangeField label="Thresholds" bind:value={thresholds} min={0} max={100} />

<h2>Vertical</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x={['x0', 'x1']}
      xScale={scaleBand().padding(0.2)}
      y="length"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 16 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid rule format="metric" />
        <Axis placement="bottom" rule ticks={4} />
        <Bars radius={4} strokeWidth={1} />
        <HighlightRect />
      </Svg>
      <Tooltip header={(data) => data.x0 + ' - ' + (data.x1 - 1)} let:data>
        <TooltipItem label="count" value={data.length} format="integer" />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Horizontal</h2>

<Preview>
  <div class="p-4 border rounded" style:height="{16 + 24 + data.length * 20}px">
    <Chart
      {data}
      x="length"
      xDomain={[0, null]}
      xNice
      y={['x0', 'x1']}
      yScale={scaleBand().padding(0.2)}
      padding={{ left: 16, bottom: 16 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" rule />
        <Axis placement="bottom" grid rule />
        <Bars radius={4} strokeWidth={1} />
        <HighlightRect />
      </Svg>
      <Tooltip header={(data) => data.x0 + ' - ' + (data.x1 - 1)} let:data>
        <TooltipItem label="count" value={data.length} format="integer" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
