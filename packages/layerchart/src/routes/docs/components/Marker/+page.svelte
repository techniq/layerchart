<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { Chart, Line, Spline, Svg } from 'layerchart';
  import { Field, RangeField, Switch, Toggle } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import PathDataMenuField from '$lib/docs/PathDataMenuField.svelte';

  let pointCount = 10;

  let pathGenerator = (x: number) => x;
  let curve: ComponentProps<CurveMenuField>['value'] = undefined;

  let amplitude = 1;
  let frequency = 10;
  let phase = 0;

  let markerStart = true;
  let markerMid = false;
  let markerEnd = true;

  $: data = Array.from({ length: pointCount }).map((_, i) => {
    return {
      x: i + 1,
      y: pathGenerator(i / pointCount) ?? i,
    };
  });

  const markerTypes = ['arrow', 'triangle', 'dot', 'circle', 'circle-outline', 'line'] as const;
</script>

<h1>Examples</h1>

<h2>Spline</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,auto,auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Start" let:id>
      <Switch bind:checked={markerStart} {id} size="md" />
    </Field>
    <Field label="Mid" let:id>
      <Switch bind:checked={markerMid} {id} size="md" />
    </Field>
    <Field label="End" let:id>
      <Switch bind:checked={markerEnd} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="grid gap-2">
      {#each markerTypes as marker}
        <div>{marker}</div>
        <div class="h-[100px] p-4 border rounded">
          <Chart {data} x="x" y="y">
            <Svg>
              <Spline
                {curve}
                class="stroke-primary"
                markerStart={markerStart ? marker : undefined}
                markerMid={markerMid ? marker : undefined}
                markerEnd={markerEnd ? marker : undefined}
              />
            </Svg>
          </Chart>
        </div>
      {/each}
    </div>
  </Preview>
</Toggle>

<h2>Spline w/ thicker stroke</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,auto,auto,1fr,1fr,1fr] gap-2 mb-2">
    <Field label="Start" let:id>
      <Switch bind:checked={markerStart} {id} size="md" />
    </Field>
    <Field label="Mid" let:id>
      <Switch bind:checked={markerMid} {id} size="md" />
    </Field>
    <Field label="End" let:id>
      <Switch bind:checked={markerEnd} {id} size="md" />
    </Field>
    <PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
    <CurveMenuField bind:value={curve} />
    <RangeField label="Points" bind:value={pointCount} min={2} />
  </div>

  <Preview {data}>
    <div class="grid gap-2">
      {#each markerTypes as marker}
        <div>{marker}</div>
        <div class="h-[100px] p-4 border rounded">
          <Chart {data} x="x" y="y">
            <Svg>
              <Spline
                {curve}
                class="stroke-primary stroke-2"
                markerStart={markerStart ? { type: marker, 'stroke-width': 2 } : undefined}
                markerMid={markerMid ? { type: marker, 'stroke-width': 2 } : undefined}
                markerEnd={markerEnd ? { type: marker, 'stroke-width': 2 } : undefined}
              />
            </Svg>
          </Chart>
        </div>
      {/each}
    </div>
  </Preview>
</Toggle>

<h2>Line</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[60px,60px] gap-2 mb-2">
    <Field label="Start" let:id>
      <Switch bind:checked={markerStart} {id} size="md" />
    </Field>
    <Field label="End" let:id>
      <Switch bind:checked={markerEnd} {id} size="md" />
    </Field>
  </div>

  <Preview {data}>
    <div class="grid gap-2">
      {#each markerTypes as marker}
        <div>{marker}</div>
        <div class="h-[35px] p-4 border rounded">
          <Chart {data} x="x" y="y" let:width>
            <Svg>
              <Line
                x1={0}
                x2={width}
                y1={0}
                y2={0}
                class="stroke-primary"
                markerStart={markerStart ? marker : undefined}
                markerMid={markerMid ? marker : undefined}
                markerEnd={markerEnd ? marker : undefined}
              />
            </Svg>
          </Chart>
        </div>
      {/each}
    </div>
  </Preview>
</Toggle>
