<script lang="ts">
  import { Arc, Group, LinearGradient, PieChart, Text } from 'layerchart';
  import { group } from 'd3-array';
  import { quantize } from 'd3-interpolate';
  import { schemeTableau10, interpolateRainbow } from 'd3-scale-chromatic';

  import Preview from '$lib/docs/Preview.svelte';
  import { longData } from '$lib/utils/genData.js';

  const dataByYear = group(longData, (d) => d.year);
  const data = dataByYear.get(2019);

  const exerciseData = [
    { key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
    { key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
    { key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' },
  ];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} key="fruit" value="value" />
  </div>
</Preview>

<h2>Donut (innerRadius)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} key="fruit" value="value" innerRadius={-20} cornerRadius={5} padAngle={0.02} />
  </div>
</Preview>

<h2>Arc (range)</h2>

<Preview {data}>
  <div class="h-[300px] border rounded">
    <PieChart
      {data}
      key="fruit"
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

<h2>Single value</h2>

<Preview>
  <div class="h-[200px] p-4 border rounded">
    <PieChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
    />
  </div>
</Preview>

<h2>Single value gradient with text</h2>

<Preview {data}>
  <div class="h-[160px] p-4 border rounded">
    <PieChart>
      <svelte:fragment slot="marks">
        <LinearGradient class="from-secondary to-primary" let:url>
          <Group y={20}>
            <Arc
              value={70}
              domain={[0, 100]}
              outerRadius={80}
              innerRadius={-15}
              cornerRadius={10}
              padAngle={0.02}
              range={[-120, 120]}
              fill={url}
              track={{ class: 'fill-none stroke-surface-content/10' }}
              let:value
            >
              <Text
                value={Math.round(value) + '%'}
                textAnchor="middle"
                verticalAnchor="middle"
                class="text-4xl tabular-nums"
              />
            </Arc>
          </Group>
        </LinearGradient>
      </svelte:fragment>
    </PieChart>
  </div>
</Preview>

<h2>Single value (arc) with custom color</h2>

<Preview>
  <div class="h-[120px] p-4 border rounded">
    <PieChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      range={[-90, 90]}
      outerRadius={80}
      innerRadius={-20}
      cornerRadius={10}
      cRange={['hsl(var(--color-success))']}
      props={{
        group: { y: 45 },
      }}
    />
  </div>
</Preview>

<h2>Series data</h2>

<Preview data={dataByYear}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      key="fruit"
      value="value"
      series={Array.from(dataByYear, ([key, data]) => ({ key, data }))}
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
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
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
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
      range={[-90, 90]}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      props={{ group: { y: 70 } }}
    />
  </div>
</Preview>

<h2>Series data (track color)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
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

<h2>Series data (individual tracks, max value, and color)</h2>

<Preview data={exerciseData}>
  <div class="h-[200px] p-4 border rounded">
    <PieChart
      key="key"
      value="value"
      series={exerciseData.map((d) => {
        return {
          key: d.key,
          data: [d],
          maxValue: d.maxValue,
          color: d.color,
        };
      })}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
    />
  </div>
</Preview>

<h2>Series props</h2>

<Preview data={dataByYear}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      key="fruit"
      value="value"
      series={[
        { key: 2019, data: dataByYear.get(2019), props: { innerRadius: -20 } },
        { key: 2018, data: dataByYear.get(2018), props: { outerRadius: -30 } },
      ]}
    />
  </div>
</Preview>

<h2>Inner component props (Arc class)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} key="fruit" value="value" props={{ arc: { class: 'stroke-surface-100' } }} />
  </div>
</Preview>

<h2>Legend</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} key="fruit" value="value" legend />
  </div>
</Preview>

<h2>Legend (placement with orientation)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      {data}
      key="fruit"
      value="value"
      legend={{ placement: 'top-left', orientation: 'vertical' }}
    />
  </div>
</Preview>

<h2>Legend (custom label)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      {data}
      key="fruit"
      label={(d) => {
        switch (d.fruit) {
          case 'apples':
            return 'Apples 🍎';
          case 'bananas':
            return 'Bananas 🍌';
          case 'cherries':
            return 'Cherries 🍒';
          case 'grapes':
            return 'Grapes 🍇';
        }
      }}
      value="value"
      legend
    />
  </div>
</Preview>

<h2>Customize colors (CSS variables)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart
      {data}
      key="fruit"
      value="value"
      cRange={[
        'hsl(var(--color-success))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-danger))',
        'hsl(var(--color-info))',
      ]}
    />
  </div>
</Preview>

<h2>Customize colors (scheme)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} key="fruit" value="value" cRange={schemeTableau10} />
  </div>
</Preview>

<h2>Customize colors (interpolator)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} key="fruit" value="value" cRange={quantize(interpolateRainbow, 5)} />
  </div>
</Preview>

<!-- <h2>Centroid labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <PieChart {data} key="fruit" value="value" keys="centroid" />
  </div>
</Preview> -->
