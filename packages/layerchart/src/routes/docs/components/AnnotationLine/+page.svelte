<script lang="ts">
  import {
    AnnotationLine,
    AnnotationPoint,
    AnnotationRange,
    Canvas,
    LineChart,
    Svg,
    Tooltip,
  } from 'layerchart';
  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, PeriodType, sortFunc } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  let { data } = $props();

  let renderContext: 'svg' | 'canvas' = $state('svg');
  // @ts-expect-error - ignore
  const RenderComponent = $derived(renderContext === 'canvas' ? Canvas : Svg);

  let debug = $state(false);

  // Get a few random points to use for annotations
  const annotations = $derived(
    [...data.appleStock]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .sort(sortFunc('date'))
      .map((d, i) => ({
        x: d.date,
        y: d.value,
        label: String.fromCharCode(65 + i),
        details: `This is an annotation for ${format(d.date)}`,
      }))
  );
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

<h2>Vertical</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks({ context })}
        <AnnotationLine
          x={new Date('2010-03-30')}
          props={{ line: { class: '[stroke-dasharray:2,2] stroke-danger' } }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Horizontal</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks({ context })}
        <AnnotationLine
          y={500}
          props={{ line: { class: '[stroke-dasharray:2,2] stroke-danger' } }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Horizontal with label</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks({ context })}
        <AnnotationLine
          y={500}
          props={{ line: { class: '[stroke-dasharray:2,2] stroke-danger' } }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>
