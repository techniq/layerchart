<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { scaleSqrt } from 'd3-scale';
  import { feature } from 'topojson-client';

  import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
  import { timerStore } from '@layerstack/svelte-stores';

  import { Chart, GeoCircle, GeoPath, Graticule, Svg, Tooltip, TransformContext } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  // https://observablehq.com/@tansi/earthquake
  // https://observablehq.com/@observablehq/plot-earthquake-globe

  const countries = feature(data.geojson, data.geojson.objects.countries);

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

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>SVG</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Spin:" dense labelPlacement="left" let:id>
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

<Preview data={countries}>
  <div class="h-[600px]">
    <Chart
      data={data.earthquakes}
      x="longitude"
      y="latitude"
      r="magnitude"
      rScale={scaleSqrt()}
      rDomain={[0, 100]}
      rRange={[0, 1]}
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
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
      let:tooltip
      let:rScale
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />

        <Graticule class="stroke-surface-content/20" />

        <GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />
        <GeoPath geojson={data.tectonicPlates} class="stroke-danger-100/30" />

        {#each data.earthquakes as eq}
          <GeoCircle
            center={[eq.longitude, eq.latitude]}
            radius={rScale(Math.exp(eq.magnitude))}
            class="stroke-danger fill-danger/20"
            onpointermove={(e) => tooltip?.show(e, eq)}
            onpointerleave={() => tooltip?.hide()}
          />
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.place}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
          <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
          <Tooltip.Item label="Magnitude" value={data.magnitude} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
