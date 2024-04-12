<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { geoOrthographic } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Button, ButtonGroup, Field, RangeField, cls, timerStore } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoCircle from '$lib/components/GeoCircle.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import Transform from '$lib/components/Transform.svelte';
  import GeoPoint from '$lib/components/GeoPoint.svelte';

  import { isVisible } from '$lib/utils/geo.js';
  import GeoVisible from '$lib/components/GeoVisible.svelte';

  export let data;

  // https://vizhub.com/curran/submarine-cables-globe

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let yaw = 0;
  let pitch = 0;
  let roll = 0;
  let sensitivity = 75;

  let velocity = 3;
  let isSpinning = false;
  const timer = timerStore({
    delay: 1,
    onTick() {
      yaw += velocity * 0.1;
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
        rotate: {
          yaw,
          pitch,
          roll,
        },
      }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
      let:projection
    >
      <Svg>
        <Transform
          mode="manual"
          scroll="none"
          tweened={{ duration: 800, easing: cubicOut }}
          on:dragstart={() => timer.stop()}
          on:dragend={() => {
            if (isSpinning) {
              // Restart
              timer.start();
            }
          }}
          on:transform={(e) => {
            yaw = e.detail.translate.x * (sensitivity / projection.scale());
            pitch = -e.detail.translate.y * (sensitivity / projection.scale());
          }}
        >
          <GeoPath
            geojson={{ type: 'Sphere' }}
            class="fill-surface-200 stroke-surface-content/20"
          />
          <Graticule class="stroke-surface-content/20" />
          <GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />

          {#each data.cables.features as feature}
            {@const hasColor = tooltip.data == null || tooltip.data.id === feature.properties.id}
            <GeoPath
              geojson={feature}
              stroke={hasColor ? feature.properties.color : undefined}
              class={cls(
                'stroke-2 fill-none transition-colors',
                !hasColor && 'stroke-surface-content/10'
              )}
              on:mousemove={(e) => tooltip?.show(e, feature.properties)}
              on:mouseleave={(e) => tooltip?.hide()}
            />
          {/each}

          <!-- Switch to Canvas for better performance -->
          <!-- {#each data.landingPoints.features as feature}
            {@const [long, lat] = feature.geometry.coordinates}
            <GeoCircle
              center={[long, lat]}
              radius={0.5}
              class="fill-surface-content stroke-surface-100 stroke"
              on:mousemove={(e) => tooltip?.show(e, feature.properties)}
              on:mouseleave={(e) => tooltip?.hide()}
            />
          {/each} -->

          {#each data.landingPoints.features as feature}
            {@const [long, lat] = feature.geometry.coordinates}
            <GeoVisible {lat} {long}>
              <GeoPoint {lat} {long}>
                <circle
                  r={2}
                  class="fill-surface-content stroke-surface-100 stroke"
                  on:mousemove={(e) => tooltip?.show(e, feature.properties)}
                  on:mouseleave={(e) => tooltip?.hide()}
                />
              </GeoPoint>
            </GeoVisible>
          {/each}
        </Transform>
      </Svg>

      <Tooltip header={(d) => d.name} let:data>
        <!-- <TooltipItem label="Latitude" value={data.latitude} format="decimal" />
        <TooltipItem label="Longitude" value={data.longitude} format="decimal" /> -->
      </Tooltip>
    </Chart>
  </div>
</Preview>
