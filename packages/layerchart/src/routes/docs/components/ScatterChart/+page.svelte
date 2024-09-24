<script lang="ts">
  import { Axis, Highlight, Points, ScatterChart, Svg, Tooltip } from 'layerchart';
  import { format } from '@layerstack/utils';
  import { flatGroup } from 'd3-array';
  import { randomNormal } from 'd3-random';

  import Preview from '$lib/docs/Preview.svelte';
  import { getSpiral } from '$lib/utils/genData.js';

  export let data;

  const spiralData = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

  const penguinDataBySpecies = flatGroup(
    data.penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.bill_length_mm !== 'NA'),
    (d) => d.species
  );

  const random = randomNormal();
  const randomNormalData = Array.from({ length: 100 }, () => ({ value: random() }));
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart data={spiralData} x="x" y="y" />
  </div>
</Preview>

<h2>Radius via rScale</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart data={spiralData} x="x" y="y" r="y" rRange={[2, 30]} xNice yNice />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          data,
          color: [
            'hsl(var(--color-primary))',
            'hsl(var(--color-secondary))',
            'hsl(var(--color-success))',
          ][i],
        };
      })}
    />
  </div>
</Preview>

<h2>Series with radius</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      r="body_mass_g"
      rRange={[2, 20]}
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          data,
          color: [
            'hsl(var(--color-primary))',
            'hsl(var(--color-secondary))',
            'hsl(var(--color-success))',
          ][i],
        };
      })}
    />
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart data={spiralData} x="x" y="y" labels={{ offset: 10 }} />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart data={spiralData} x="x" y="y" axis="x" />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart data={spiralData} x="x" y="y" axis="y" />
  </div>
</Preview>

<h2>Single dimension</h2>

<Preview data={randomNormalData}>
  <div class="h-[24px]">
    <ScatterChart
      data={randomNormalData}
      x="value"
      y={(d) => 0}
      axis={false}
      props={{ highlight: { lines: false } }}
    >
      <svelte:fragment slot="tooltip" let:data let:x>
        <Tooltip.Root let:data>
          {format(x(data))}
        </Tooltip.Root>
      </svelte:fragment>
    </ScatterChart>
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart data={spiralData} x="x" y="y">
      <svelte:fragment slot="tooltip" let:x let:y let:padding let:height>
        <Tooltip.Root
          x={padding.left}
          y="data"
          anchor="right"
          contained={false}
          class="text-[10px] font-semibold text-primary bg-surface-100 mr-[2px] px-1 py-[2px] border border-primary rounded whitespace-nowrap"
          let:data
        >
          {format(y(data), 'integer')}
        </Tooltip.Root>

        <Tooltip.Root
          x="data"
          y={height}
          anchor="top"
          class="text-[10px] font-semibold text-primary bg-surface-100 mt-[1px] px-2 py-[1px] border border-primary rounded whitespace-nowrap"
          contained={false}
          let:data
        >
          {format(x(data), 'integer')}
        </Tooltip.Root>
      </svelte:fragment>
    </ScatterChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart data={spiralData} x="x" y="y" let:x let:y>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" grid rule />
        <Points class="fill-primary/10 stroke-primary" />
        <Highlight points lines axis="both" />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data), 'integer')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={format(y(data), 'integer')} />
        </Tooltip.List>
      </Tooltip.Root>
    </ScatterChart>
  </div>
</Preview>
