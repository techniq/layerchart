<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { feature } from 'topojson-client';

  import {
    Chart,
    GeoContext,
    GeoPath,
    Graticule,
    Svg,
    Tooltip,
    TransformContext,
  } from 'layerchart';
  import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
  import { timerStore } from '@layerstack/svelte-stores';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

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

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
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
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        applyTransform: ['rotate'],
      }}
      on:dragstart={() => timer.stop()}
      on:dragend={() => {
        if (isSpinning) {
          // Restart
          timer.start();
        }
      }}
      bind:transformContext
      let:tooltip
      let:projection
    >
      {@const [yaw, pitch, roll] = projection.rotate()}
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/20" />

        <!-- Back -->
        <GeoContext
          projection={geoOrthographic}
          fitGeojson={countries}
          rotate={{ yaw: yaw + 180, pitch: -pitch, roll: -roll }}
          reflectX
        >
          <Graticule class="stroke-surface-content/5" />
          {#each countries.features as country}
            <GeoPath
              geojson={country}
              class="stroke-surface-content/5 fill-surface-content/10"
              reflectX
            />
          {/each}
        </GeoContext>

        <!-- Front -->
        <Graticule class="stroke-surface-content/20" />
        {#each countries.features as country}
          <GeoPath
            geojson={country}
            class="stroke-surface-100/30 fill-surface-content/70 cursor-pointer hover:fill-primary/70"
            {tooltip}
          />
        {/each}
      </Svg>

      <Tooltip>
        <div slot="header" let:data>{data.properties.name}</div>
      </Tooltip>
    </Chart>
  </div>
</Preview>
