<script lang="ts">
  import { geoAlbersUsa } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Canvas, Chart, GeoPath, Svg, Tooltip } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

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
    >
      {#snippet children({ tooltipContext, geoContext })}
        <Svg>
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="stroke-surface-content fill-surface-100 hover:fill-surface-content/20"
              {tooltipContext}
            />
          {/each}

          <GeoPath
            geojson={counties}
            class="fill-none stroke-surface-content/10 pointer-events-none"
          />
        </Svg>

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const [longitude, latitude] =
              geoContext.projection?.invert?.([tooltipContext.x, tooltipContext.y]) ?? []}
            <Tooltip.Header>{data.properties.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="longitude" value={longitude} format="decimal" />
              <Tooltip.Item label="latitude" value={latitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
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
    >
      {#snippet children({ geoContext, tooltipContext })}
        <Canvas>
          {#each states.features as feature}
            <GeoPath geojson={feature} class="stroke-surface-content" {tooltipContext} />
          {/each}
        </Canvas>

        <Canvas pointerEvents={false}>
          <GeoPath geojson={counties} class="stroke-surface-content/10" />
        </Canvas>

        <!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
        <Canvas pointerEvents={false}>
          {#if tooltipContext.data}
            <GeoPath
              geojson={tooltipContext.data}
              class="stroke-surface-content fill-surface-content/20"
            />
          {/if}
        </Canvas>

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const [longitude, latitude] =
              geoContext.projection?.invert?.([tooltipContext.x, tooltipContext.y]) ?? []}
            <Tooltip.Header>{data.properties.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="longitude" value={longitude} format="decimal" />
              <Tooltip.Item label="latitude" value={latitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
