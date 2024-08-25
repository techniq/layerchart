<script lang="ts">
  import { PieChart } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries, longData } from '$lib/utils/genData.js';

  const data = longData.filter((d) => d.year === 2019);

  // const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
  const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} label="fruit" value="value" />
  </div>
</Preview>

<h2>Arc (range)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} label="fruit" value="value" range={[-90, 90]} innerRadius={-20} />
  </div>
</Preview>

<h2>Donut (innerRadius)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      {data}
      label="fruit"
      value="value"
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.02}
    />
  </div>
</Preview>

<h2>Separate tracks</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      {data}
      label="fruit"
      value="value"
      separateTracks
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
    />
  </div>
</Preview>

<h2>Inner component props (Arc class)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} label="fruit" value="value" props={{ arc: { class: 'stroke-surface-100' } }} />
  </div>
</Preview>

<!-- <h2>Centroid labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} label="fruit" value="value" labels="centroid" />
  </div>
</Preview> -->
