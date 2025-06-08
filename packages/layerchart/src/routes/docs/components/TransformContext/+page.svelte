<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { cubicOut } from 'svelte/easing';

  import { Chart, Circle, Layer, Points, Spline } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';
  import { Field, RangeField, Switch } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import { getSpiral } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  let pointCount = $state(500);
  let angle = $state(137.5); //
  let showPoints = $state(true);
  let showPath = $state(false);
  let tweened = $state(true);

  const data = $derived(
    getSpiral({ angle, radius: 10, count: pointCount, width: 500, height: 500 })
  );

  let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-2">
  <RangeField label="Angle" bind:value={angle} min={1} max={360} />
  <Field label="Tweened" let:id>
    <Switch bind:checked={tweened} {id} size="md" />
  </Field>
</div>

<div class="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-2">
  <RangeField label="Points" bind:value={pointCount} min={1} max={2000} />
  <CurveMenuField bind:value={curve} showOpenClosed />
  <Field label="Show points" let:id>
    <Switch bind:checked={showPoints} {id} size="md" />
  </Field>
  <Field label="Show path" let:id>
    <Switch bind:checked={showPath} {id} size="md" />
  </Field>
</div>

<Preview {data}>
  <div class="h-[500px] aspect-square p-4 border rounded-sm relative overflow-hidden">
    <Chart
      {data}
      x="x"
      y="y"
      transform={{
        mode: 'canvas',
        motion: tweened ? { type: 'tween', duration: 800, easing: cubicOut } : undefined,
        initialScrollMode: 'scale',
      }}
    >
      <TransformControls />
      <Layer type={shared.renderContext}>
        {#if showPath}
          <Spline {curve} motion="tween" />
        {/if}
        {#if showPoints}
          <Points>
            {#snippet children({ points })}
              {#each points as point, index}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={2}
                  class={index % 2 ? 'fill-primary' : 'fill-secondary'}
                  motion={tweened ? 'tween' : undefined}
                />
              {/each}
            {/snippet}
          </Points>
        {/if}
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Pan/Zoom SVG image</h2>

<Preview>
  <div class="h-[500px] p-4 border rounded-sm relative overflow-hidden">
    <Chart
      transform={{
        mode: 'canvas',
        motion: { type: 'tween', duration: 800, easing: cubicOut },
        initialScrollMode: 'scale',
      }}
    >
      <TransformControls />
      <Layer type="svg">
        <image
          href="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg"
          width="100%"
          height="100%"
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Pan/Zoom HTML image</h2>

<Preview>
  <div class="h-[500px] p-4 border rounded-sm relative overflow-hidden">
    <Chart
      transform={{
        mode: 'canvas',
        motion: { type: 'tween', duration: 800, easing: cubicOut },
        initialScrollMode: 'scale',
      }}
    >
      <TransformControls />
      <Layer type="html">
        <div class="h-full flex justify-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ghostscript_Tiger.svg/512px-Ghostscript_Tiger.svg.png?20091116194118"
            alt="Ghostscript Tiger"
            class="h-full"
          />
        </div>
      </Layer>
    </Chart>
  </div>
</Preview>
