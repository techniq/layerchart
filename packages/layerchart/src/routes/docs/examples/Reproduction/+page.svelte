<script lang="ts">
  import { Area, Axis, Chart, Layer } from 'layerchart';
  import { createDateSeries } from '$lib/utils/genData.js';

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
</script>

{#each { length: 11 } as _}
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={dateSeriesData}
      x="date"
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type="svg">
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
      </Layer>
    </Chart>
  </div>
{/each}
