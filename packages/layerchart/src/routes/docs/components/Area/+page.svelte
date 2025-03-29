<script lang="ts">
  import type { Component, ComponentProps } from 'svelte';

  import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { Area, Axis, Chart, Svg, Points, Canvas, Spline } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  let pointCount = $state(10);
  let showPoints = $state(false);
  let showLine = $state(true);
  let show = $state(true);
  let tweened = $state(true);
  let Context: Component = $state(Svg);
  const motion = $derived(tweened ? 'tween' : 'none');

  let pathGenerator = $state((x: number) => x);
  let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

  const data = $derived(
    Array.from({ length: pointCount }).map((_, i) => {
      return {
        x: i + 1,
        y: pathGenerator?.(i / pointCount) ?? i,
      };
    })
  );
</script>

<h1>Playground</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2">
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

  <div class="grid grid-cols-[100px_auto_auto_1fr] gap-2">
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
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
      </Svg>

      <Context>
        {#if show}
          <Area
            {curve}
            line={showLine && { class: 'stroke-primary stroke-2' }}
            {motion}
            class="fill-primary/10"
          />

          {#if showPoints}
            <Points {motion} r={3} class="fill-surface-100 stroke-primary" />
          {/if}
        {/if}
      </Context>
    </Chart>
  </div>
</Preview>

<h1>Canvas</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2">
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

  <div class="grid grid-cols-[100px_auto_auto_1fr] gap-2">
    <Field label="Show" let:id>
      <Switch bind:checked={show} {id} size="md" />
    </Field>

    <Field label="Tweened" let:id>
      <Switch bind:checked={tweened} {id} size="md" />
    </Field>
  </div>
</div>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }}>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
      </Svg>

      <Canvas>
        {#if show}
          <Area {curve} {motion} class="fill-primary/10" />

          {#if showLine}
            <Spline {curve} {motion} class="stroke-primary stroke-2" />
          {/if}

          {#if showPoints}
            <Points {motion} r={3} class="fill-surface-100 stroke-primary" />
          {/if}
        {/if}
      </Canvas>
    </Chart>
  </div>
</Preview>
