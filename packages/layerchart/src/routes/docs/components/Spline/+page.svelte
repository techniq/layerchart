<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { Axis, Canvas, Chart, Circle, Layer, Points, Spline, Text } from 'layerchart';
  import { Field, RangeField, Switch, Toggle, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';
  import { format } from '@layerstack/utils';
  import { shared } from '../../shared.svelte.js';

  let pointCount = $state(100);
  let showPoints = $state(false);
  let show = $state(true);
  let motion: 'draw' | 'tween' | 'none' = $state('tween');

  let pathGenerator = $state((x: number) => x);
  let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

  let amplitude = $state(1);
  let frequency = $state(10);
  let phase = $state(0);

  const data = $derived(
    Array.from({ length: pointCount }).map((_, i) => {
      return {
        x: i + 1,
        y: pathGenerator(i / pointCount) ?? i,
      };
    })
  );
</script>

<h1>Playground</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
    <Field label="Show points" let:id>
      <Switch bind:checked={showPoints} {id} size="md" />
    </Field>
  </div>

  <div class="grid grid-cols-[100px_auto_1fr] gap-2">
    <Field label="Show" let:id>
      <Switch bind:checked={show} {id} size="md" />
    </Field>

    <Field label="Motion" classes={{ input: 'mt-1 mb-[6px]' }}>
      <ToggleGroup bind:value={motion} variant="outline" size="sm">
        <ToggleOption value="tween">tween</ToggleOption>
        <ToggleOption value="draw">draw</ToggleOption>
        <ToggleOption value="none">none</ToggleOption>
      </ToggleGroup>
    </Field>
  </div>
</div>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="x" y="y" yNice padding={{ left: 24, bottom: 24, top: 4, right: 8 }}>
      <Layer type={shared.layer}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />

        {#if show}
          <Spline
            {curve}
            motion={motion === 'tween' ? 'tween' : 'none'}
            draw={motion === 'draw'}
            class="stroke-primary stroke-2"
          />

          {#if showPoints}
            <Points
              motion={motion === 'tween' ? 'tween' : 'none'}
              r={3}
              class="fill-surface-100 stroke-primary"
            />
          {/if}
        {/if}
      </Layer>
    </Chart>
  </div>
</Preview>

<h1>Examples</h1>

<h2>draw</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Layer type={shared.layer}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} draw class="stroke-primary stroke-2" />
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>tweened</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Layer type={shared.layer}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} motion="tween" class="stroke-primary stroke-2" />
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>markers / arrows</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Layer type={shared.layer}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline
              {curve}
              class="stroke-primary stroke-2"
              markerStart="circle"
              markerEnd={{ type: 'arrow', class: 'stroke-2' }}
            />
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>basic start and end snippets</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Layer type={shared.layer}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} class="stroke-primary stroke-2">
              {#snippet startContent()}
                <Circle r={5} class="fill-primary" />
              {/snippet}
              {#snippet endContent()}
                <Circle r={5} class="fill-primary" />
              {/snippet}
            </Spline>
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>label using start/end snippets</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart {data} x="x" y="y" yNice padding={{ left: 48, bottom: 24, right: 48 }}>
        <Layer type={shared.layer}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} class="stroke-primary stroke-2">
              {#snippet startContent()}
                <Circle r={5} class="fill-primary" />
                <Text value="start" textAnchor="end" verticalAnchor="middle" dx={-8} />
              {/snippet}

              {#snippet endContent()}
                <Circle r={5} class="fill-primary" />
                <Text value="end" verticalAnchor="middle" dx={8} />
              {/snippet}
            </Spline>
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>end snippet with draw</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Layer type={shared.layer}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} draw={{ duration: 3000 }} class="stroke-primary stroke-2">
              {#snippet endContent()}
                <Circle r={5} class="fill-primary" />
              {/snippet}
            </Spline>
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>end slot with draw with value</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, right: 40, bottom: 24 }}>
        <Layer type={shared.layer}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} draw={{ duration: 3000 }} class="stroke-primary stroke-2">
              {#snippet endContent({ value })}
                <Circle r={5} class="fill-primary" />
                <Text
                  value={format(value.y, 'decimal')}
                  textAnchor="start"
                  verticalAnchor="middle"
                  dx={8}
                />
              {/snippet}
            </Spline>
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<Blockquote>
  Because the draw transition and tweened store use different timers, there is no guarantee they
  will start at the same time
</Blockquote>
