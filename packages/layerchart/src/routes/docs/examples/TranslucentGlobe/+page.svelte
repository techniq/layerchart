<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { feature } from 'topojson-client';

  import {
    Chart,
    GeoContext,
    GeoPath,
    Graticule,
    Layer,
    Tooltip,
    type ChartState,
  } from 'layerchart';
  import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
  import { TimerState } from '@layerstack/svelte-state';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let context = $state<ChartState>();

  let velocity = $state(3);
  const timer = new TimerState({
    delay: 1,
    tick: () => {
      if (!context) return;
      const curr = context.transform.translate;

      context.transform.translate = {
        x: (curr.x += velocity),
        y: curr.y,
      };
    },
    disabled: true,
  });
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>Basic</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Spin:" dense labelPlacement="left" let:id>
      <ButtonGroup size="sm" variant="fill-light">
        <Button on:click={timer.start} disabled={timer.running}>Start</Button>
        <Button on:click={timer.stop} disabled={!timer.running}>Stop</Button>
      </ButtonGroup>
    </Field>

    <RangeField
      label="Velocity:"
      bind:value={velocity}
      min={-10}
      max={10}
      disabled={!timer.running}
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
      ondragstart={timer.stop}
      bind:context
    >
      {#snippet children({ context })}
        {@const [yaw, pitch, roll] = context.geo.projection?.rotate() ?? [0, 0, 0]}
        <Layer>
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
              <GeoPath geojson={country} class="stroke-surface-content/5 fill-surface-content/10" />
            {/each}
          </GeoContext>

          <!-- Front -->
          <Graticule class="stroke-surface-content/20" />
          {#each countries.features as country}
            <GeoPath
              geojson={country}
              class="stroke-surface-100/30 fill-surface-content/70 cursor-pointer hover:fill-primary/70"
              tooltipContext={context.tooltip}
            />
          {/each}
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            {data.properties.name}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
