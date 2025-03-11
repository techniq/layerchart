<script lang="ts">
  import { Axis, Canvas, Highlight, Points, ScatterChart, Svg, Tooltip } from 'layerchart';
  import { format } from '@layerstack/utils';
  import { flatGroup } from 'd3-array';
  import { randomNormal } from 'd3-random';
  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import Blockquote from '$lib/docs/Blockquote.svelte';

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

  const pengiunSeries = penguinDataBySpecies.map(([species, data], i) => {
    return {
      key: species,
      data,
      color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
    };
  });

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

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" {renderContext} {debug} />
  </div>
</Preview>

<h2>Domain padding</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      xPadding={[20, 20]}
      yPadding={[20, 20]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radius via rScale</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      r="y"
      rRange={[2, 30]}
      xNice
      yNice
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>0 baseline/domain</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      xBaseline={0}
      yBaseline={0}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          data,
          color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
        };
      })}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series with radius</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      r="body_mass_g"
      rRange={[2, 20]}
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          data,
          color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
        };
      })}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" labels={{ offset: 10 }} {renderContext} {debug} />
  </div>
</Preview>

<h2>Legend</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          data,
          color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
        };
      })}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (show/hide series with tweening)</h2>

<Preview data={pengiunSeries}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={pengiunSeries}
      padding={{ left: 16, bottom: 48 }}
      props={{
        xAxis: { tweened: { duration: 200 } },
        yAxis: { tweened: { duration: 200 } },
        grid: { tweened: { duration: 200 } },
        points: { tweened: { duration: 200 } },
      }}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (custom labels)</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          label: species + ' 🐧',
          data,
          color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
        };
      })}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" axis="x" {renderContext} {debug} />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" axis="y" {renderContext} {debug} />
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
      grid={false}
      props={{ highlight: { lines: false } }}
      {renderContext}
      {debug}
    >
      <svelte:fragment slot="tooltip" let:data let:x>
        <Tooltip.Root let:data>
          {format(x(data))}
        </Tooltip.Root>
      </svelte:fragment>
    </ScatterChart>
  </div>
</Preview>

<h2>Tooltip click</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      ontooltipclick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" {renderContext} {debug}>
      <svelte:fragment slot="tooltip" let:x let:y let:padding let:height>
        <Tooltip.Root
          x={padding.left}
          y="data"
          anchor="right"
          contained={false}
          class="text-[10px] font-semibold text-primary bg-surface-100 mr-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap"
          let:data
        >
          {format(y(data), 'integer')}
        </Tooltip.Root>

        <Tooltip.Root
          x="data"
          y={height}
          anchor="top"
          class="text-[10px] font-semibold text-primary bg-surface-100 mt-[1px] px-2 py-[1px] border border-primary rounded-sm whitespace-nowrap"
          contained={false}
          let:data
        >
          {format(x(data), 'integer')}
        </Tooltip.Root>
      </svelte:fragment>
    </ScatterChart>
  </div>
</Preview>

<h2>Brushing</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      props={{
        points: { tweened: { duration: 200 } },
        xAxis: { tweened: { duration: 200 } },
        yAxis: { tweened: { duration: 200 } },
      }}
      brush
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" let:x let:y {renderContext} {debug}>
      <svelte:component this={renderContext === 'canvas' ? Canvas : Svg}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" grid rule />
        <Points class="fill-primary/10 stroke-primary" />
        <Highlight points lines axis="both" />
      </svelte:component>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data), 'integer')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={format(y(data), 'integer')} />
        </Tooltip.List>
      </Tooltip.Root>
    </ScatterChart>
  </div>
</Preview>
