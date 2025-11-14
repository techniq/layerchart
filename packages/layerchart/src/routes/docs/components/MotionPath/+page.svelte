<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { linear } from 'svelte/easing';

  import { Axis, Chart, Circle, Layer, MotionPath, Spline } from 'layerchart';
  import { Field, RangeField, Switch, Toggle } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { shared } from '../../shared.svelte.js';

  let pointCount = $state(100);

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

<h1>Examples</h1>

<h2>Repeat indefinitely</h2>

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
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <MotionPath duration="3s" repeatCount="indefinite">
              {#snippet children({ pathId, objectId })}
                <Spline id={pathId} {curve} />
                <Circle id={objectId} r={5} class="fill-surface-100 stroke-surface-content" />
              {/snippet}
            </MotionPath>
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Rotate object with path</h2>

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
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <MotionPath duration="5s" repeatCount="indefinite" rotate="auto">
              {#snippet children({ pathId, objectId })}
                <Spline id={pathId} {curve} />
                <rect
                  id={objectId}
                  x={-10}
                  y={-10}
                  width={20}
                  height={20}
                  class="fill-surface-100 stroke-surface-content"
                />
              {/snippet}
            </MotionPath>
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Sync with draw</h2>

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
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            {#key data}
              <MotionPath duration="3s">
                {#snippet children({ pathId, objectId })}
                  <Spline id={pathId} {curve} draw={{ duration: 3000, easing: linear }} />
                  <Circle id={objectId} r={5} class="fill-surface-100 stroke-surface-content" />
                {/snippet}
              </MotionPath>
            {/key}
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<Blockquote>
  Because the draw transition and `animateMotion` using different timers, there is no guarantee they
  will start at the same time
</Blockquote>
