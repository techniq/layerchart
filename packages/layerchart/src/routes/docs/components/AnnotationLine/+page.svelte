<script lang="ts">
  import {
    AnnotationLine,
    AnnotationPoint,
    AnnotationRange,
    BarChart,
    LineChart,
    type Placement,
  } from 'layerchart';
  import {
    Button,
    Field,
    Menu,
    RangeField,
    Switch,
    Toggle,
    ToggleGroup,
    ToggleOption,
  } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  let { data } = $props();

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

  const dateSeriesData = createDateSeries({
    count: 10,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });

  const placementOptions = [
    'top-left',
    'top',
    'top-right',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right',
  ] as const;
  let placement: Placement = $state('top-right');
  let offset = $state(0);

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
          label="Event"
          labelOffset={4}
          props={{
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
            label: { class: 'fill-danger' },
          }}
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
          label="Max"
          props={{
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
            label: { class: 'fill-danger' },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Horizontal placement</h2>

<div class="grid grid-cols-3 gap-2 mb-2">
  <Toggle let:on={open} let:toggle>
    <Field label="Placement" class="cursor-pointer" on:click={toggle}>
      <span class="text-sm">
        {placement}
      </span>
    </Field>

    <Menu {open} on:close={toggle} placement="bottom-start">
      <div class="grid grid-cols-3 gap-1 p-1">
        {#each placementOptions as option}
          <Button
            variant="outline"
            color={option === placement ? 'primary' : 'default'}
            on:click={() => (placement = option)}
          >
            {option}
          </Button>
        {/each}
      </div>
    </Menu>
  </Toggle>

  <RangeField label="Offset" bind:value={offset} max={10} />
</div>

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
          label={placement}
          labelPlacement={placement}
          labelOffset={offset}
          props={{
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
            label: { class: 'fill-danger' },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Vertical placement</h2>

<div class="grid grid-cols-3 gap-2 mb-2">
  <Toggle let:on={open} let:toggle>
    <Field label="Placement" class="cursor-pointer" on:click={toggle}>
      <span class="text-sm">
        {placement}
      </span>
    </Field>

    <Menu {open} on:close={toggle} placement="bottom-start">
      <div class="grid grid-cols-3 gap-1 p-1">
        {#each placementOptions as option}
          <Button
            variant="outline"
            color={option === placement ? 'primary' : 'default'}
            on:click={() => (placement = option)}
          >
            {option}
          </Button>
        {/each}
      </div>
    </Menu>
  </Toggle>

  <RangeField label="Offset" bind:value={offset} max={10} />
</div>

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
          label={placement}
          labelPlacement={placement}
          labelOffset={offset}
          props={{
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
            label: { class: 'fill-danger' },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Vertical to point</h2>

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
        {#each annotations as annotation}
          <AnnotationLine
            x={annotation.x}
            y={annotation.y}
            props={{ line: { class: '[stroke-dasharray:4,4] opacity-50' } }}
          />

          <AnnotationPoint
            x={annotation.x}
            y={annotation.y}
            r={6}
            label={annotation.label}
            details={annotation.details}
            props={{
              circle: { class: 'fill-secondary' },
              label: { class: 'text-[10px] fill-secondary-content font-bold' },
            }}
          />
        {/each}
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Horizontal with range</h2>

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
        <AnnotationRange
          y={[500, null]}
          pattern={{
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          }}
        />

        <AnnotationLine
          y={500}
          label="Max"
          labelPlacement="bottom-right"
          labelOffset={2}
          props={{
            line: { class: '[stroke-dasharray:2,2] _stroke-danger' },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Bar chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet aboveMarks({ context })}
        <AnnotationLine
          y={50}
          label="Avg"
          props={{
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
            label: { class: 'fill-danger' },
          }}
        />
      {/snippet}
    </BarChart>
  </div>
</Preview>
