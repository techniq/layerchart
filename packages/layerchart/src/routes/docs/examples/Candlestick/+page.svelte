<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';

  import { Axis, Bars, Chart, Highlight, Points, Svg, Tooltip } from 'layerchart';
  import { PeriodType, formatDate } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

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
      c={(d) => (d.close < d.open ? 'desc' : 'asc')}
      cScale={scaleOrdinal()}
      cDomain={['desc', 'asc']}
      cRange={['#e41a1c', '#4daf4a']}
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
      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, PeriodType.Day)}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="Open" value={data.open} format="decimal" />
          <Tooltip.Item label="Close" value={data.close} format="decimal" />
          <Tooltip.Item label="High" value={data.high} format="decimal" />
          <Tooltip.Item label="Low" value={data.low} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
