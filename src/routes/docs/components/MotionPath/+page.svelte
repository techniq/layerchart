<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { linear } from 'svelte/easing';

  import { Field, Switch, Toggle } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import LinePath from '$lib/components/LinePath.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';
  import RangeField from '$lib/docs/RangeField.svelte';
  import MotionPath from '$lib/components/MotionPath.svelte';

  let pointCount = 100;

  let pathGenerator = (x: number) => x;
  let curve: ComponentProps<CurveMenuField>['value'] = undefined;

  let amplitude = 1;
  let frequency = 10;
  let phase = 0;

  $: data = Array.from({ length: pointCount }).map((_, i) => {
    return {
      x: i + 1,
      y: pathGenerator(i / pointCount) ?? i
    };
  });
</script>

<h1>Examples</h1>

<h2>Sync with draw</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview>
    <div class="h-[300px] p-4 border rounded">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <MotionPath duration="3s" let:pathId let:objectId>
              <LinePath id={pathId} {curve} draw={{ duration: 3000, easing: linear }} />
              <circle id={objectId} r={5} class="fill-white stroke-black" />
            </MotionPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Repeat indefinitely</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview>
    <div class="h-[300px] p-4 border rounded">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <MotionPath duration="3s" repeatCount="indefinite" let:pathId let:objectId>
              <LinePath id={pathId} {curve} />
              <circle id={objectId} r={5} class="fill-white stroke-black" />
            </MotionPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>
