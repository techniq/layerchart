<script lang="ts">
  import { geoAlbersUsa } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Canvas, Chart, GeoPath, HitCanvas, Svg, Tooltip, renderPathData } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
      let:projection
      let:tooltip
    >
      <Svg>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            class="stroke-surface-content fill-surface-100 hover:fill-surface-content/20"
          />
        {/each}

        <GeoPath
          geojson={counties}
          class="fill-none stroke-surface-content/20 pointer-events-none"
        />
      </Svg>

      <Tooltip.Root let:data>
        {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={states}>
  <div class="h-[600px] mt-10">
    <Chart
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
      let:projection
      let:tooltip
    >
      <Canvas>
        <GeoPath geojson={states} class="stroke-surface-content" />
        <GeoPath geojson={counties} class="stroke-surface-content/20" />
      </Canvas>

      <!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
      <Canvas>
        {#if tooltip.data}
          <GeoPath geojson={tooltip.data} class="stroke-surface-content fill-surface-content/20" />
        {/if}
      </Canvas>

      <HitCanvas
        let:nextColor
        let:setColorData
        on:pointermove={(e) => tooltip.show(e.detail.event, e.detail.data)}
        on:pointerleave={tooltip.hide}
      >
        <GeoPath
          render={(ctx, { newGeoPath }) => {
            for (var feature of states.features) {
              const color = nextColor();
              const geoPath = newGeoPath();
              // Stroking shape seems to help with dark border, but there is still antialising and thus gaps
              renderPathData(ctx, geoPath(feature), { fill: color, stroke: color });
              setColorData(color, feature);
            }
          }}
        />
      </HitCanvas>

      <Tooltip.Root let:data>
        {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
