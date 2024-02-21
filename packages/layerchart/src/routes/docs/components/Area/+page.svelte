<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { Field, RangeField, Switch } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Points from '$lib/components/Points.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  let pathGenerator = (x: number) => x;
  let curve: ComponentProps<CurveMenuField>['value'] = undefined;
  let pointCount = 10;

  $: data = Array.from({ length: pointCount }).map((_, i) => {
    return {
      x: i + 1,
      y: pathGenerator?.(i / pointCount) ?? i,
    };
  });

  let showPoints = false;
  let showLine = true;
  let tweened = true;
</script>

<h1>Playground</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr,1fr,1fr,auto] gap-2">
    <PathDataMenuField bind:value={pathGenerator} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
    <Field label="Show points" let:id>
      <Switch bind:checked={showPoints} {id} size="md" />
    </Field>
  </div>

  <div class="grid grid-cols-[100px,100px,1fr] gap-2">
    <Field label="Line" let:id>
      <Switch bind:checked={showLine} {id} size="md" />
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
        <Area
          {curve}
          line={showLine && { class: 'stroke-primary stroke-2' }}
          {tweened}
          class="fill-primary/10"
        />
        {#if showPoints}
          <Points {tweened} r={3} class="fill-surface-100 stroke-primary" />
        {/if}
      </Svg>
    </Chart>
  </div>
</Preview>
