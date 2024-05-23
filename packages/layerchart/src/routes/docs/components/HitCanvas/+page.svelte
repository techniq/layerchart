<script lang="ts">
  import { geoIdentity } from 'd3-geo';
  import { feature } from 'topojson-client';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import HitCanvas from '$lib/components/HitCanvas.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { Field, Switch } from 'svelte-ux';

  export let data;

  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);

  let debug = false;
</script>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>Canvas</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Debug:" dense labelPlacement="left" let:id>
      <Switch {id} bind:checked={debug} />
    </Field>
  </div>
</div>

<Preview data={states}>
  <div class="h-[600px] mt-10">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states,
      }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Canvas>
        <GeoPath geojson={states} class="stroke-surface-content" />
      </Canvas>
      <Canvas>
        <GeoPath geojson={counties} class="stroke-surface-content/20" />
      </Canvas>

      {#if tooltip.data}
        <Canvas>
          <GeoPath geojson={tooltip.data} class="stroke-surface-content fill-surface-content/20" />
        </Canvas>
      {/if}

      <HitCanvas
        let:nextColor
        let:setColorData
        on:pointermove={(e) => tooltip.show(e.detail.event, e.detail.data)}
        on:pointerleave={tooltip.hide}
        {debug}
      >
        <GeoPath
          render={(ctx, { geoPath }) => {
            for (var feature of counties.features) {
              const color = nextColor();

              ctx.beginPath();
              geoPath(feature);
              ctx.fillStyle = color;
              ctx.fill();

              // Stroking shape seems to help with dark border, but there is still antialising and thus gaps
              ctx.strokeStyle = color;
              ctx.stroke();

              setColorData(color, feature);
            }
          }}
        />
      </HitCanvas>

      <Tooltip header={(data) => data.properties.name} />
    </Chart>
  </div>
</Preview>
