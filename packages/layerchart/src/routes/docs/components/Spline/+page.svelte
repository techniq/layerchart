<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { Field, RangeField, Switch, Toggle } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Points from '$lib/components/Points.svelte';
  import Spline from '$lib/components/Spline.svelte';
  import Text from '$lib/components/Text.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import Blockquote from '$lib/docs/Blockquote.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';

  let pointCount = 100;
  let showPoints = false;
  let tweened = true;
  let draw = false;

  let pathGenerator = (x: number) => x;
  let curve: ComponentProps<CurveMenuField>['value'] = undefined;

  let amplitude = 1;
  let frequency = 10;
  let phase = 0;

  $: data = Array.from({ length: pointCount }).map((_, i) => {
    return {
      x: i + 1,
      y: pathGenerator(i / pointCount) ?? i,
    };
  });
</script>

<h1>Playground</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr,1fr,1fr,auto] gap-2">
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
    <Field label="Show points" let:id>
      <Switch bind:checked={showPoints} {id} size="md" />
    </Field>
  </div>

  <!-- <div class="grid grid-cols-[1fr,1fr,1fr] gap-2">
    <RangeField label="Frequency" bind:value={frequency} min={1} />
    <RangeField label="Amplitude" bind:value={amplitude} min={1} />
    <RangeField label="Phase" bind:value={phase} min={1} />
  </div> -->

  <div class="grid grid-cols-[100px,100px,1fr] gap-2">
    <Field label="Draw" let:id>
      <Switch bind:checked={draw} {id} size="md" />
    </Field>
    <Field label="Tweened" let:id>
      <Switch bind:checked={tweened} {id} size="md" />
    </Field>
  </div>
</div>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Spline {curve} {tweened} {draw} class="stroke-primary stroke-2" />
        {#if showPoints}
          <Points {tweened} />
        {/if}
      </Svg>
    </Chart>
  </div>
</Preview>

<h1>Examples</h1>

<h2>draw</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} draw class="stroke-primary stroke-2" />
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>tweened</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} tweened class="stroke-primary stroke-2" />
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>basic start and end slots</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} class="stroke-primary stroke-2">
              <circle slot="start" r={5} class="fill-primary" />
              <circle slot="end" r={5} class="fill-primary" />
            </Spline>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>label using start/end slots</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded">
      <Chart {data} x="x" y="y" yNice padding={{ left: 48, bottom: 24, right: 48 }}>
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} class="stroke-primary stroke-2">
              <svelte:fragment slot="start">
                <circle r={5} class="fill-primary" />
                <Text value="start" textAnchor="end" verticalAnchor="middle" dx={-8} />
              </svelte:fragment>

              <svelte:fragment slot="end">
                <circle r={5} class="fill-primary" />
                <Text value="end" verticalAnchor="middle" dx={8} />
              </svelte:fragment>
            </Spline>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>end slot with draw</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Show" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded">
      <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#if show}
            <Spline {curve} draw={{ duration: 3000 }} class="stroke-primary stroke-2">
              <circle slot="end" r={5} class="fill-primary" />
            </Spline>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<Blockquote>
  Because the draw transition and tweened store use different timers, there is no guarantee they
  will start at the same time
</Blockquote>
