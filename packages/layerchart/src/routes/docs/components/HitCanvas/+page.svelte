<script lang="ts">
  import { geoIdentity, type GeoProjection } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Chart, Canvas, GeoPath, HitCanvas, Tooltip } from 'layerchart';
  import { Field, Switch } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const projection = geoIdentity as unknown as () => GeoProjection;

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
        projection,
        fitGeojson: states,
      }}
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
