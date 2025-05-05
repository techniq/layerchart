<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { scaleSqrt } from 'd3-scale';
  import { feature } from 'topojson-client';

  import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
  import { timerStore } from '@layerstack/svelte-stores';

  import {
    Chart,
    GeoCircle,
    GeoPath,
    Graticule,
    Svg,
    Tooltip,
    type ChartContextValue,
  } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  // https://observablehq.com/@tansi/earthquake
  // https://observablehq.com/@observablehq/plot-earthquake-globe

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let context = $state<ChartContextValue<(typeof data.earthquakes)[number]>>();

  let velocity = $state(3);
  let isSpinning = $state(false);
  const timer = timerStore({
    delay: 1,
    onTick() {
      if (!context) return;
      const curr = context.transform.translate;

      context.transform.translate = {
        x: (curr.x += velocity),
        y: curr.y,
      };
    },
  });

  $effect(() => {
    if (isSpinning) {
      timer.start();
    } else {
      timer.stop();
    }
  });

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
      bind:context
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
    >
      {#snippet children({ context })}
        <Svg>
          <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />

          <Graticule class="stroke-surface-content/20" />

          <GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />
          <GeoPath geojson={data.tectonicPlates} class="stroke-danger-100/30" />

          {#each data.earthquakes as eq}
            <GeoCircle
              center={[eq.longitude, eq.latitude]}
              radius={context.rScale(Math.exp(eq.magnitude))}
              class="stroke-danger fill-danger/20"
              onpointermove={(e) => context.tooltip.show(e, eq)}
              onpointerleave={() => context.tooltip.hide()}
            />
          {/each}
        </Svg>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.place}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
              <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
              <Tooltip.Item label="Magnitude" value={data.magnitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
