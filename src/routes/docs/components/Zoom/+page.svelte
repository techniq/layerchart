<script lang="ts">
  import * as d3shapes from 'd3-shape';
  import { cubicOut } from 'svelte/easing';

  import { Button, Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

  import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Circle from '$lib/components/Circle.svelte';
  import Path from '$lib/components/Path.svelte';
  import Points from '$lib/components/Points.svelte';
  import Zoom from '$lib/components/Zoom.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import RangeField from '$lib/docs/RangeField.svelte';
  import ZoomControls from '$lib/docs/ZoomControls.svelte';

  import { getSpiral } from '$lib/utils/genData';

  let zoom;
  let pointCount = 500;
  let angle = 137.5; //
  let showPoints = true;
  let showPath = false;
  let tweened = true;
  let scrollMode = 'scale';

  $: data = getSpiral({ angle, radius: 10, count: pointCount, width: 500, height: 500 });

  let curve = d3shapes['curveLinear'];
  const curveOptions = Object.keys(d3shapes)
    .filter((key) => key.startsWith('curve'))
    .filter((key) => !key.endsWith('Open') && !key.endsWith('Closed'))
    .map((key) => {
      return {
        name: key.replace('curve', ''),
        value: d3shapes[key]
      };
    });

  function prev(options, current) {
    const index = options.findIndex((x) => x.value === current);
    if (index === 0) {
      return options[options.length - 1].value;
    } else {
      return options[index - 1].value;
    }
  }

  function next(options, current) {
    const index = options.findIndex((x) => x.value === current);
    if (index === options.length - 1) {
      return options[0].value;
    } else {
      return options[index + 1].value;
    }
  }
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr,auto,2fr] gap-2 mb-2">
  <Field label="Scroll mode" let:id>
    <ToggleGroup
      bind:value={scrollMode}
      variant="contained"
      classes={{ root: 'w-full', options: 'w-full' }}
    >
      <ToggleOption value="none">None</ToggleOption>
      <ToggleOption value="scale">Scale</ToggleOption>
      <ToggleOption value="translate">Translate</ToggleOption>
    </ToggleGroup>
  </Field>
  <Field label="Tweened" let:id>
    <Switch bind:checked={tweened} {id} />
  </Field>
</div>

<div class="grid grid-cols-[1fr,auto,1fr,auto,1fr,auto] gap-2 mb-2">
  <RangeField label="Points" bind:value={pointCount} min={1} max={2000} />
  <Field label="Show points" let:id>
    <Switch bind:checked={showPoints} {id} />
  </Field>
  <RangeField label="Angle" bind:value={angle} min={1} max={360} />
  <Field label="Show path" let:id>
    <Switch bind:checked={showPath} {id} />
  </Field>
  <Field label="Curve" let:id>
    <Button
      icon={mdiChevronLeft}
      on:click={() => (curve = prev(curveOptions, curve))}
      class="mr-2"
      size="sm"
    />
    <select bind:value={curve} class="w-full outline-none appearance-none text-sm" {id}>
      {#each curveOptions as option}
        <option value={option.value}>{option.name}</option>
      {/each}
    </select>
    <Button
      icon={mdiChevronRight}
      on:click={() => (curve = next(curveOptions, curve))}
      class="ml-2"
      size="sm"
    />
  </Field>
</div>

<Preview>
  <div class="h-[500px] p-4 border rounded relative overflow-hidden">
    <ZoomControls {zoom} />
    <Chart {data} x="x" y="y">
      <Svg>
        <Zoom bind:this={zoom} scroll={scrollMode} tweened={{ duration: 800, easing: cubicOut }}>
          {#if showPath}
            <Path {curve} {tweened} />
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
