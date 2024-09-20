<script lang="ts">
  import { PieChart } from 'layerchart';
  import { group } from 'd3-array';

  import Preview from '$lib/docs/Preview.svelte';
  import { longData } from '$lib/utils/genData.js';

  const dataByYear = group(longData, (d) => d.year);
  const data = dataByYear.get(2019);

  const exerciseData = [
    { label: 'move', value: 400, total: 1000, color: '#ef4444' },
    { label: 'exercise', value: 20, total: 30, color: '#a3e635' },
    { label: 'stand', value: 10, total: 12, color: '#22d3ee' },
  ];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} label="fruit" value="value" />
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

<h2>Arc (range)</h2>

<Preview {data}>
  <div class="h-[300px] border rounded">
    <PieChart
      {data}
      label="fruit"
      value="value"
      range={[-90, 90]}
      outerRadius={300 / 2}
      innerRadius={-20}
      cornerRadius={10}
      padAngle={0.02}
      props={{ group: { y: 80 } }}
    />
  </div>
</Preview>

<h2>Series data</h2>

<Preview data={dataByYear}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      label="fruit"
      value="value"
      series={Array.from(dataByYear).map(([key, data]) => {
        return { key, data };
      })}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.01}
    />
  </div>
</Preview>

<h2>Series data (individual tracks)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      label="fruit"
      value="value"
      series={data?.map((d) => {
        return {
          key: d.fruit,
          data: d,
        };
      })}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
    />
  </div>
</Preview>

<h2>Series data (arc)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      label="fruit"
      value="value"
      series={data?.map((d) => {
        return {
          key: d.fruit,
          data: d,
        };
      })}
      range={[-90, 90]}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      props={{ group: { y: 190 } }}
    />
  </div>
</Preview>

<h2>Series data (track color)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      label="fruit"
      value="value"
      series={data?.map((d) => {
        return {
          key: d.fruit,
          data: d,
        };
      })}
      props={{
        arc: {
          track: { fill: 'hsl(var(--color-surface-content) / 10%)' },
        },
      }}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
    />
  </div>
</Preview>

<h2>Series data (individual tracks and total)</h2>

<Preview data={exerciseData}>
  <div class="h-[200px] p-4 border rounded">
    <PieChart
      label="label"
      value="value"
      series={exerciseData.map((d) => {
        return {
          key: d.label,
          data: d,
          total: d.total,
          color: d.color,
        };
      })}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
    />
  </div>
</Preview>

<h2>Series data (single value)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      label="label"
      value="value"
      series={[{ key: 'test', data: { label: 'Test', value: 70 }, total: 100 }]}
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

<h2>Customize colors</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} label="fruit" value="value" cRange={['red', 'blue', 'green', 'orange']} />
  </div>
</Preview>

<!-- <h2>Centroid labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} label="fruit" value="value" labels="centroid" />
  </div>
</Preview> -->
