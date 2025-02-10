<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { curveCatmullRomClosed } from 'd3-shape';
  import { feature } from 'topojson-client';
  import { presimplify, simplify } from 'topojson-simplify';

  import { Chart, GeoPath, Graticule, Svg, TransformContext } from 'layerchart';
  import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
  import { timerStore } from '@layerstack/svelte-stores';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  export let data;

  let curve = curveCatmullRomClosed;
  let minArea = 2;

  $: geojson = simplify(presimplify(data.geojson), Math.pow(10, 2 - minArea));
  $: land = feature(geojson, data.geojson.objects.land);

  let transformContext: TransformContext;

  let velocity = 3;
  let isSpinning = false;
  const timer = timerStore({
    delay: 1,
    onTick() {
      transformContext.translate.update((value) => {
        return {
          x: (value.x += velocity),
          y: value.y,
        };
      });
    },
    disabled: !isSpinning,
  });
  $: isSpinning ? timer.start() : timer.stop();
  $timer;
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2">
  <CurveMenuField bind:value={curve} showOpenClosed />
  <RangeField label="Min area" bind:value={minArea} min={0} max={3} step={0.01} />
</div>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>SVG</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Spin:" dense labelPlacement="left">
      <ButtonGroup size="sm" variant="fill-light">
        <Button
          on:click={() => {
            isSpinning = true;
          }}
          disabled={isSpinning}>Start</Button
        >
        <Button
          on:click={() => {
            isSpinning = false;
          }}
          disabled={!isSpinning}>Stop</Button
        >
      </ButtonGroup>
    </Field>

    <RangeField
      label="Velocity:"
      bind:value={velocity}
      min={-10}
      max={10}
      disabled={!isSpinning}
      labelPlacement="left"
    />
  </div>
</div>

<Preview data={land}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoOrthographic,
        fitGeojson: land,
        applyTransform: ['rotate'],
      }}
      ondragstart={() => timer.stop()}
      ondragend={() => {
        if (isSpinning) {
          // Restart
          timer.start();
        }
      }}
      bind:transformContext
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
        <Graticule class="stroke-surface-content/20" />
        <GeoPath geojson={land} {curve} class="stroke-surface-content/50 fill-white" />
      </Svg>
    </Chart>
  </div>
</Preview>
