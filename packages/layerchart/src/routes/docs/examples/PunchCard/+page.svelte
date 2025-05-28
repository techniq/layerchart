<script lang="ts">
  import { scaleBand } from 'd3-scale';
  import { range } from 'd3-array';
  import { getDay, getWeek } from 'date-fns';

  import { Highlight, ScatterChart, Tooltip } from 'layerchart';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <ScatterChart
      {data}
      x={(d) => getWeek(d.date)}
      xScale={scaleBand()}
      y={(d) => getDay(d.date)}
      yScale={scaleBand()}
      yDomain={range(7)}
      r="value"
      rRange={[0, 16]}
      padding={{ left: 48, bottom: 16 }}
      props={{
        xAxis: { format: (d) => 'Week ' + d },
        yAxis: { format: (d) => daysOfWeek[d] },
        rule: { x: true, y: false },
        grid: { x: false, y: true, bandAlign: 'between' },
        tooltip: { context: { mode: 'band' } },
      }}
    >
      {#snippet highlight()}
        <Highlight area axis="x" />
        <Highlight area axis="y" />
      {/snippet}

      {#snippet tooltip()}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(data.date, 'day')}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={data.value} valueAlign="right" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </ScatterChart>
  </div>
</Preview>
