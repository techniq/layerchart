<script lang="ts">
  import { Arc, Group, LinearGradient, PieChart, Text } from 'layerchart';
  import { group, sum } from 'd3-array';
  import { quantize } from 'd3-interpolate';
  import { schemeTableau10, interpolateRainbow } from 'd3-scale-chromatic';

  import Preview from '$lib/docs/Preview.svelte';
  import { longData } from '$lib/utils/genData.js';
  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  const dataByYear = group(longData, (d) => d.year);
  const data = dataByYear.get(2019) ?? [];
  $: dataWithColor =
    data?.map((d, i) => {
      return {
        ...d,
        color: [
          'var(--color-danger)',
          'var(--color-warning)',
          'var(--color-success)',
          'var(--color-info)',
        ][i],
      };
    }) ?? [];

  const exerciseData = [
    { key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
    { key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
    { key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' },
  ];

  let renderContext: 'svg' | 'canvas' = 'svg';
  let debug = false;
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2">
  <Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>

  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" {renderContext} {debug} />
  </div>
</Preview>

<h2>ontooltipclick</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      ontooltipclick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Outer radius (fixed)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" outerRadius={100} {renderContext} {debug} />
  </div>
</Preview>

<h2>Outer radius (offset)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" outerRadius={-20} {renderContext} {debug} />
  </div>
</Preview>

<h2>Donut (innerRadius)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.02}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Donut with inner text</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.02}
      {renderContext}
      {debug}
    >
      <svelte:fragment slot="aboveMarks">
        <Text
          value={format(sum(data, (d) => d.value))}
          textAnchor="middle"
          verticalAnchor="middle"
          class="text-4xl"
          dy={4}
        />
        <Text
          value="total"
          textAnchor="middle"
          verticalAnchor="middle"
          class="text-sm fill-surface-content/50"
          dy={26}
        />
      </svelte:fragment>
    </PieChart>
  </div>
</Preview>

<h2>Arc (range)</h2>

<Preview {data}>
  <div class="h-[300px] border rounded-sm resize overflow-auto">
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
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Single value</h2>

<Preview data={[{ key: 'Example', value: 70 }]}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Single value gradient with text</h2>

<Preview {data}>
  <div class="h-[160px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {renderContext} {debug}>
      <svelte:fragment slot="marks">
        <LinearGradient class="from-secondary to-primary" let:gradient>
          <Group y={20}>
            <Arc
              value={70}
              domain={[0, 100]}
              outerRadius={80}
              innerRadius={-15}
              cornerRadius={10}
              padAngle={0.02}
              range={[-120, 120]}
              fill={gradient}
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

<Preview data={[{ key: 'Example', value: 70 }]}>
  <div class="h-[120px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      range={[-90, 90]}
      outerRadius={80}
      innerRadius={-20}
      cornerRadius={10}
      cRange={['var(--color-success)']}
      props={{
        group: { y: 45 },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series data</h2>

<Preview data={dataByYear}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      key="fruit"
      value="value"
      series={Array.from(dataByYear, ([key, data]) => ({ key, data }))}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.01}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (individual tracks)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (arc)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
      range={[-90, 90]}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      props={{ group: { y: 70 } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (track color)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
      props={{
        arc: {
          track: { fill: 'var(--color-surface-content)', fillOpacity: 0.1 },
        },
      }}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (individual tracks, max value, and color)</h2>

<Preview data={exerciseData}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
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
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series props</h2>

<Preview data={dataByYear}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      key="fruit"
      value="value"
      series={[
        { key: 2019, data: dataByYear.get(2019), props: { innerRadius: -20 } },
        { key: 2018, data: dataByYear.get(2018), props: { outerRadius: -30 } },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (arc click)</h2>

<Preview data={dataByYear}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      key="fruit"
      value="value"
      series={Array.from(dataByYear, ([key, data]) => ({ key, data }))}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.01}
      onarcclick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Inner component props (Arc class)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      props={{ arc: { class: 'stroke-surface-100' } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" legend {renderContext} {debug} />
  </div>
</Preview>

<h2>Legend (placement with orientation)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      legend={{ placement: 'top-left', orientation: 'vertical' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (custom label)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
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
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Customize colors (CSS variables)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      cRange={[
        'var(--color-success)',
        'var(--color-warning)',
        'var(--color-danger)',
        'var(--color-info)',
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Customize colors (scheme)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" cRange={schemeTableau10} {renderContext} {debug} />
  </div>
</Preview>

<h2>Customize colors (interpolator)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      cRange={quantize(interpolateRainbow, 5)}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Customize colors (data prop)</h2>

<Preview data={dataWithColor}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart data={dataWithColor} key="fruit" value="value" c="color" {renderContext} {debug} />
  </div>
</Preview>

<h2>Legend with padding</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      padding={{ right: 80 }}
      legend={{ placement: 'right', orientation: 'vertical' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Placement (left)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      placement="left"
      legend={{ placement: 'right', orientation: 'vertical' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Placement (right)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      placement="right"
      legend={{ placement: 'left', orientation: 'vertical' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Custom placement</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      center={false}
      props={{ group: { x: 200, center: 'y' } }}
      legend={{ placement: 'right', orientation: 'vertical' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<!-- <h2>Centroid labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" keys="centroid" {renderContext} {debug} />
  </div>
</Preview> -->
