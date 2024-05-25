<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { geoOrthographic } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Button, ButtonGroup, Field, RangeField, timerStore } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoCircle from '$lib/components/GeoCircle.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TransformContext from '$lib/components/TransformContext.svelte';
  import { scaleSqrt } from 'd3-scale';

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
      transform={{
        mode: 'manual',
        scroll: 'none',
        tweened: { duration: 800, easing: cubicOut },
      }}
      on:dragstart={() => timer.stop()}
      on:dragend={() => {
        if (isSpinning) {
          // Restart
          timer.start();
        }
      }}
      bind:transformContext
      tooltip={{ mode: 'manual' }}
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
            on:pointermove={(e) => tooltip?.show(e, eq)}
            on:pointerleave={(e) => tooltip?.hide()}
          />
        {/each}
      </Svg>

      <Tooltip header={(d) => d.place} let:data>
        <TooltipItem label="Latitude" value={data.latitude} format="decimal" />
        <TooltipItem label="Longitude" value={data.longitude} format="decimal" />
        <TooltipItem label="Magnitude" value={data.magnitude} format="decimal" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
