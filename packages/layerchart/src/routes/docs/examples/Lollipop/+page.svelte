<script lang="ts">
  import { Axis, Chart, Highlight, Layer, Points, Rule, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';
  import { sort } from '@layerstack/utils';

  let { data } = $props();

  const chartData = $derived(sort(data.alphabet, (d) => d.letter));
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={chartData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart
      data={chartData}
      x="letter"
      y="frequency"
      yNice
      padding={{ left: 20, bottom: 32 }}
      tooltip={{ mode: 'band' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule format="percentRound" />
        <Axis placement="bottom" rule />
        <Rule />
        <Points />
        <Highlight area />
      </Layer>

      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.letter} />
          <Tooltip.List>
            <Tooltip.Item label="Frequency" value={data.frequency} format="percent" />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
