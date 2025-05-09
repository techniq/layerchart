<script lang="ts">
  import { Spring } from 'svelte/motion';
  import { PieChart, Text } from 'layerchart';
  import { group, sum } from 'd3-array';
  import { quantize } from 'd3-interpolate';
  import { schemeTableau10, interpolateRainbow } from 'd3-scale-chromatic';
  import { Field, RangeField, Switch, Toggle, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import { longData } from '$lib/utils/genData.js';
  import { format } from '@layerstack/utils';
  import Arc from '$lib/components/Arc.svelte';

  const dataByYear = group(longData, (d) => d.year);
  const data = dataByYear.get(2019) ?? [];
  const dataWithColor =
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

  let segmentCount = $state(60);
  let segmentValue = new Spring(75);
  let segmentData = $derived(
    Array.from({ length: segmentCount }, (_, i) => {
      return {
        key: i + 1,
        value: 1,
        color:
          (i / segmentCount) * 100 < (segmentValue.current ?? 0)
            ? 'var(--color-success)'
            : 'color-mix(in lch, var(--color-surface-content) 10%, transparent)',
      };
    })
  );

  let renderContext: 'svg' | 'canvas' = $state('svg');
  let debug = $state(false);
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

<h2>onTooltipClick</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      {data}
      key="fruit"
      value="value"
      onTooltipClick={(e, detail) => {
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
      {#snippet aboveMarks()}
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
      {/snippet}
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
      props={{ group: { y: 90 } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<div class="flex items-end gap-2">
  <h2 class="grow">Segments</h2>
  <RangeField label="Segments" bind:value={segmentCount} min={2} class="mb-2" />
  <RangeField label="Value" bind:value={segmentValue.target} class="mb-2" />
</div>

<Preview data={segmentData}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      data={segmentData}
      key="key"
      value="value"
      c="color"
      innerRadius={-20}
      cornerRadius={4}
      padAngle={0.02}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks()}
        <Text
          value={Math.round(segmentValue.current ?? 0)}
          textAnchor="middle"
          verticalAnchor="middle"
          dy={16}
          class="text-6xl tabular-nums"
        />
      {/snippet}
    </PieChart>
  </div>
</Preview>

<h2>Series data</h2>

<Preview data={dataByYear}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart
      key="fruit"
      value="value"
      series={Array.from(dataByYear, ([key, data]) => ({ key: key.toString(), data }))}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.01}
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
        { key: '2019', data: dataByYear.get(2019), props: { innerRadius: -20 } },
        { key: '2018', data: dataByYear.get(2018), props: { outerRadius: -30 } },
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
      series={Array.from(dataByYear, ([key, data]) => ({ key: key.toString(), data }))}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={5}
      padAngle={0.01}
      onArcClick={(e, detail) => {
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

<h2>Offset Slice</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" {renderContext} {debug}>
      {#snippet arc({ index, props })}
        <Arc {...props} offset={index === 0 ? 16 : undefined} />
      {/snippet}
    </PieChart>
  </div>
</Preview>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2">
    <h2>Motion (tween)</h2>
    <Field label="Show" labelPlacement="left" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>
  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
      {#if show}
        <PieChart
          {data}
          key="fruit"
          value="value"
          props={{ pie: { motion: 'tween' } }}
          {renderContext}
          {debug}
        />
      {/if}
    </div>
  </Preview>
</Toggle>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2">
    <h2>Motion (spring)</h2>
    <Field label="Show" labelPlacement="left" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>
  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
      {#if show}
        <PieChart
          {data}
          key="fruit"
          value="value"
          props={{ pie: { motion: 'spring' } }}
          {renderContext}
          {debug}
        />
      {/if}
    </div>
  </Preview>
</Toggle>

<!-- <h2>Centroid labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <PieChart {data} key="fruit" value="value" keys="centroid" {renderContext} {debug} />
  </div>
</Preview> -->
