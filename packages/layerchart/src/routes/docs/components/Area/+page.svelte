<script lang="ts">
  import type { Component, ComponentProps } from 'svelte';

  import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { Area, Axis, Chart, Svg, Points, Canvas, Spline } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  let pointCount = 10;
  let showPoints = false;
  let showLine = true;
  let show = true;
  let tweened = true;
  let Context: Component = Svg;

  let pathGenerator = (x: number) => x;
  let curve: ComponentProps<CurveMenuField>['value'] = undefined;

  $: data = Array.from({ length: pointCount }).map((_, i) => {
    return {
      x: i + 1,
      y: pathGenerator?.(i / pointCount) ?? i,
    };
  });
</script>

<h1>Playground</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2">
    <PathDataMenuField bind:value={pathGenerator} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
    <Field label="Show points" let:id>
      <Switch bind:checked={showPoints} {id} size="md" />
    </Field>
    <Field label="Show Line" let:id>
      <Switch bind:checked={showLine} {id} size="md" />
    </Field>
  </div>

  <div class="grid grid-cols-[100px,auto,auto,1fr] gap-2">
    <Field label="Show" let:id>
      <Switch bind:checked={show} {id} size="md" />
    </Field>

    <Field label="Context" classes={{ input: 'mt-1 mb-[6px]' }}>
      <ToggleGroup bind:value={Context} variant="outline" size="sm">
        <ToggleOption value={Svg}>Svg</ToggleOption>
        <ToggleOption value={Canvas}>Canvas</ToggleOption>
      </ToggleGroup>
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
      </Svg>

      <svelte:component this={Context}>
        {#if show}
          <Area
            {curve}
            line={showLine && { class: 'stroke-primary stroke-2' }}
            {tweened}
            class="fill-primary/10"
          />
        {/if}
      </svelte:component>

      <!--  Render separate context for Points to play nice with Canvas (clear, etc) -->
      <svelte:component this={Context}>
        {#if show && showPoints}
          <Points {tweened} r={3} class="fill-surface-100 stroke-primary" />
        {/if}
      </svelte:component>
    </Chart>
  </div>
</Preview>

<h1>Canvas</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2">
    <PathDataMenuField bind:value={pathGenerator} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
    <Field label="Show points" let:id>
      <Switch bind:checked={showPoints} {id} size="md" />
    </Field>
    <Field label="Show Line" let:id>
      <Switch bind:checked={showLine} {id} size="md" />
    </Field>
  </div>

  <div class="grid grid-cols-[100px,auto,auto,1fr] gap-2">
    <Field label="Show" let:id>
      <Switch bind:checked={show} {id} size="md" />
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
      </Svg>

      <!--  Render separate Canvas context for each component to play nice (clear, etc).  See: https://github.com/techniq/layerchart/issues/158#issuecomment-2543416108 -->
      <Canvas>
        {#if show}
          <Area {curve} {tweened} class="fill-primary/10" />
        {/if}
      </Canvas>

      <Canvas>
        {#if show && showLine}
          <Spline {curve} {tweened} class="stroke-primary stroke-2" />
        {/if}
      </Canvas>

      <Canvas>
        {#if show && showPoints}
          <Points {tweened} r={3} class="fill-surface-100 stroke-primary" />
        {/if}
      </Canvas>
    </Chart>
  </div>
</Preview>
