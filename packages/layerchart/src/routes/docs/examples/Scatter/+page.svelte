<script lang="ts">
  import { scaleThreshold } from 'd3-scale';

  import { Axis, Chart, Highlight, Labels, Layer, Points, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  const data = createDateSeries({ min: 10, max: 100, value: 'integer' });

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
</script>

<h1>Examples</h1>

<Blockquote>
  See also: <a href="/docs/components/ScatterChart">ScatterChart</a> for simplified examples
</Blockquote>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={{ left: 16, bottom: 24 }}>
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Points class="fill-primary/10 stroke-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'quadtree-x' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Points class="fill-primary/10 stroke-primary" />
        <Highlight points lines />
      </Layer>

      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={{ left: 16, bottom: 24 }}>
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Points class="fill-primary/10 stroke-primary" />
        <Labels format="integer" offset={10} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Color via scale</h2>

<h3>red (0-49), yellow (50-89), green (90+)</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, null]}
      yNice
      c="value"
      cScale={scaleThreshold()}
      cDomain={[50, 90]}
      cRange={['var(--color-danger)', 'var(--color-warning)', 'var(--color-success)']}
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Points class="stroke-surface-content/50" />
      </Layer>
    </Chart>
  </div>
</Preview>
