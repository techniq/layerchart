<script lang="ts">
  import { scaleOrdinal, scaleTime, scaleUtc } from 'd3-scale';
  import { utcDay } from 'd3-time';

  import { Axis, Bars, Chart, Highlight, Layer, Points, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={data.appleTicker}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={data.appleTicker}
      x="date"
      xScale={scaleUtc()}
      xDomain={[null, utcDay.offset(data.appleTicker[data.appleTicker.length - 1].date)]}
      xInterval={utcDay}
      y={['high', 'low']}
      yNice
      c={(d) => (d.close < d.open ? 'desc' : 'asc')}
      cScale={scaleOrdinal()}
      cDomain={['desc', 'asc']}
      cRange={['#e41a1c', '#4daf4a']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule tickSpacing={20} />
          <Axis placement="bottom" rule />
          <Points links r={0} />
          <Bars y={(d) => [d.open, d.close]} radius={2} insets={{ x: 1 }} />
          <Highlight area />
        </Layer>
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />
            <Tooltip.List>
              <Tooltip.Item label="Open" value={data.open} format="decimal" />
              <Tooltip.Item label="Close" value={data.close} format="decimal" />
              <Tooltip.Item label="High" value={data.high} format="decimal" />
              <Tooltip.Item label="Low" value={data.low} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
