<script lang="ts">
  import { scaleOrdinal, scaleUtc } from 'd3-scale';
  import { utcDay } from 'd3-time';

  import { Axis, Bars, Chart, Highlight, Layer, Rule, Tooltip } from 'layerchart';

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
      y={['high', 'low']}
      yNice
      c={(d) => (d.close < d.open ? 'desc' : 'asc')}
      cScale={scaleOrdinal()}
      cDomain={['desc', 'asc']}
      cRange={['var(--color-danger)', 'var(--color-success)']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'quadtree-x' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule tickSpacing={20} />
        <Axis placement="bottom" rule tickMultiline />
        <Rule y={['high', 'low']} />
        <Rule y={['open', 'close']} strokeWidth={2} />
        <Highlight lines />
      </Layer>

      <Tooltip.Root>
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
    </Chart>
  </div>
</Preview>

<h2>Open/close line color</h2>

<Preview data={data.appleTicker}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={data.appleTicker}
      x="date"
      xScale={scaleUtc()}
      y={['high', 'low']}
      yNice
      c={(d) => (d.close < d.open ? 'desc' : 'asc')}
      cScale={scaleOrdinal()}
      cDomain={['desc', 'asc']}
      cRange={['var(--color-danger)', 'var(--color-success)']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'quadtree-x' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule tickSpacing={20} />
        <Axis placement="bottom" rule tickMultiline />
        <Rule y={['high', 'low']} class="stroke-surface-content" />
        <Rule y={['open', 'close']} strokeWidth={2} />
        <Highlight lines />
      </Layer>

      <Tooltip.Root>
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
    </Chart>
  </div>
</Preview>

<h2>Bars</h2>

<Preview data={data.appleTicker}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={data.appleTicker}
      x="date"
      xScale={scaleUtc()}
      xInterval={utcDay}
      y={['high', 'low']}
      yNice
      c={(d) => (d.close < d.open ? 'desc' : 'asc')}
      cScale={scaleOrdinal()}
      cDomain={['desc', 'asc']}
      cRange={['var(--color-danger)', 'var(--color-success)']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'quadtree-x' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule tickSpacing={20} />
        <Axis placement="bottom" rule tickMultiline />
        <Bars y={['high', 'low']} insets={{ x: 1.5 }} class="fill-surface-content" />
        <Bars y={['open', 'close']} insets={{ x: 0.5 }} />
        <Highlight area />
      </Layer>

      <Tooltip.Root>
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
    </Chart>
  </div>
</Preview>
