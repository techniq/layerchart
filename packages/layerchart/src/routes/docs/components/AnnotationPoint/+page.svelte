<script lang="ts">
  import {
    AnnotationLine,
    AnnotationPoint,
    BarChart,
    defaultChartPadding,
    Layer,
    LineChart,
    Tooltip,
    type Placement,
  } from 'layerchart';
  import { Button, Field, Menu, RangeField, Switch, Toggle } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';
  import { maxIndex } from 'd3-array';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

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
  let placement: Placement = $state('top');
  let xOffset = $state(0);
  let yOffset = $state(0);
  let radius = $state(4);

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
  let debug = $state(false);
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2">
  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<h2>On axis with tooltip</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={data.appleStock} x="date" y="value" {renderContext} {debug}>
      <!-- Placed above context to fix overlap with Axis (might be refined to allow aboveMarks in future) -->
      {#snippet aboveContext({ context })}
        <Layer type={renderContext}>
          {#each annotations as annotation}
            <AnnotationPoint
              x={annotation.x}
              r={6}
              label={annotation.label}
              details={annotation.details}
              props={{
                circle: { class: 'fill-secondary' },
                label: { class: 'text-[10px] fill-secondary-content font-bold' },
              }}
            />
          {/each}
        </Layer>
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            {#if data.annotation}
              <!-- Annotation -->
              <div class="whitespace-nowrap">
                {data.annotation.details}
              </div>
            {:else}
              <!-- Normal tooltip -->
              <Tooltip.Header>{format(context.x(data), 'daytime')}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="value" value={context.y(data)} />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>On series with tooltip</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={data.appleStock} x="date" y="value" {renderContext} {debug}>
      {#snippet aboveContext({ context })}
        <Layer type={renderContext}>
          {#each annotations as annotation}
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
        </Layer>
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            {#if data.annotation}
              <!-- Annotation -->
              <div class="whitespace-nowrap">
                {data.annotation.details}
              </div>
            {:else}
              <!-- Normal tooltip -->
              <Tooltip.Header>{format(context.x(data), 'daytime')}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="value" value={context.y(data)} />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>On series with line and tooltip</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={data.appleStock} x="date" y="value" {renderContext} {debug}>
      {#snippet aboveContext({ context })}
        <Layer type={renderContext}>
          {#each annotations as annotation}
            <AnnotationLine
              x={annotation.x}
              y={annotation.y}
              r={6}
              props={{
                line: { class: '[stroke-dasharray:4,4] opacity-50' },
              }}
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
        </Layer>
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            {#if data.annotation}
              <!-- Annotation -->
              <div class="whitespace-nowrap">
                {data.annotation.details}
              </div>
            {:else}
              <!-- Normal tooltip -->
              <Tooltip.Header>{format(context.x(data), 'daytime')}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="value" value={context.y(data)} />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Series annotation</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      padding={{ ...defaultChartPadding(), right: 40 }}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks({ context })}
        {@const lastPoint = data.appleStock[data.appleStock.length - 1]}
        <AnnotationPoint
          x={lastPoint.date}
          y={lastPoint.value}
          label="Apple"
          labelPlacement="right"
          labelXOffset={4}
          props={{
            circle: { class: 'fill-primary' },
            label: { class: 'fill-primary font-bold' },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Label placement</h2>

<div class="grid grid-cols-4 gap-2 mb-2">
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

  <RangeField label="Radius" bind:value={radius} max={10} />
  <RangeField label="X Offset" bind:value={xOffset} max={10} />
  <RangeField label="Y Offset" bind:value={yOffset} max={10} />
</div>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={data.appleStock} x="date" y="value" {renderContext} {debug}>
      {#snippet aboveMarks({ context })}
        {@const maxPoint = data.appleStock[maxIndex(data.appleStock, (d) => d.value)]}
        <AnnotationPoint
          x={maxPoint.date}
          y={maxPoint.value}
          r={radius}
          label={placement}
          labelPlacement={placement}
          labelXOffset={xOffset}
          labelYOffset={yOffset}
          props={{
            circle: { class: 'fill-secondary' },
            label: { class: 'fill-secondary font-bold' },
          }}
        />
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Band scale on axis</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet aboveContext({ context })}
        <Layer type={renderContext}>
          <AnnotationPoint
            x={dateSeriesData[3].date}
            r={4}
            label="Featured"
            labelPlacement="bottom"
            labelYOffset={16}
            props={{
              circle: { class: 'fill-secondary' },
              label: { class: 'text-xs fill-secondary font-bold' },
            }}
          />
        </Layer>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Band scale on value</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet aboveContext({ context })}
        <Layer type={renderContext}>
          <AnnotationPoint
            x={dateSeriesData[3].date}
            y={dateSeriesData[3].value}
            r={4}
            label="Featured"
            labelPlacement="top"
            props={{
              circle: { class: 'fill-secondary' },
              label: { class: 'text-xs fill-secondary font-bold' },
            }}
          />
        </Layer>
      {/snippet}
    </BarChart>
  </div>
</Preview>
