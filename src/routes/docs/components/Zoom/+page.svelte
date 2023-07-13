<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { cubicOut } from 'svelte/easing';

  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Circle from '$lib/components/Circle.svelte';
  import Spline from '$lib/components/Spline.svelte';
  import Points from '$lib/components/Points.svelte';
  import Zoom from '$lib/components/Zoom.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import RangeField from '$lib/docs/RangeField.svelte';
  import ZoomControls from '$lib/docs/ZoomControls.svelte';

  import { getSpiral } from '$lib/utils/genData';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  let zoom;
  let pointCount = 500;
  let angle = 137.5; //
  let showPoints = true;
  let showPath = false;
  let tweened = true;
  let scrollMode = 'scale';

  $: data = getSpiral({ angle, radius: 10, count: pointCount, width: 500, height: 500 });

  let curve: ComponentProps<CurveMenuField>['value'] = undefined;
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr,auto,2fr] gap-2 mb-2">
  <Field label="Scroll mode" let:id>
    <ToggleGroup bind:value={scrollMode} variant="outline" size="sm" inset class="w-full">
      <ToggleOption value="none">None</ToggleOption>
      <ToggleOption value="scale">Scale</ToggleOption>
      <ToggleOption value="translate">Translate</ToggleOption>
    </ToggleGroup>
  </Field>
  <Field label="Tweened" let:id>
    <Switch bind:checked={tweened} {id} size="md" />
  </Field>
  <RangeField label="Angle" bind:value={angle} min={1} max={360} />
</div>

<div class="grid grid-cols-[auto,1fr,auto,1fr] gap-2 mb-2">
  <Field label="Show points" let:id>
    <Switch bind:checked={showPoints} {id} size="md" />
  </Field>
  <RangeField label="Points" bind:value={pointCount} min={1} max={2000} />
  <Field label="Show path" let:id>
    <Switch bind:checked={showPath} {id} size="md" />
  </Field>
  <CurveMenuField bind:value={curve} />
</div>

<Preview>
  <div class="h-[500px] p-4 border rounded relative overflow-hidden">
    <ZoomControls {zoom} />
    <Chart {data} x="x" y="y">
      <Svg>
        <Zoom bind:this={zoom} scroll={scrollMode} tweened={{ duration: 800, easing: cubicOut }}>
          {#if showPath}
            <Spline {curve} {tweened} />
          {/if}
          {#if showPoints}
            <Points let:points>
              {#each points as point, index}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={2}
                  class={index % 2 ? 'fill-blue-500' : 'fill-green-500'}
                  {tweened}
                />
              {/each}
            </Points>
          {/if}
        </Zoom>
      </Svg>
    </Chart>
  </div>
</Preview>
