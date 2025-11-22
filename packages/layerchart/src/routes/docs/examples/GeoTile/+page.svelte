<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { ClipPath, Chart, GeoPath, GeoTile, Layer, Tooltip, getSettings } from 'layerchart';
  import { RangeField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import TilesetField from '$lib/docs/TilesetField.svelte';

  let { data } = $props();

  const states = feature(data.geojson, data.geojson.objects.states);

  const filteredStates = {
    ...states,
    features: states.features.filter(
      (d) => Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii'
    ),
  };
  // $: filteredStates = { ...states, features: states.features.filter(d => d.properties.name === 'West Virginia')}
  let selectedFeature: typeof filteredStates | (typeof filteredStates.features)[0] =
    $state(filteredStates);

  let serviceUrl = $state<ComponentProps<typeof GeoTile>['url']>(null!);
  let zoomDelta = $state(0);

  let settings = getSettings();
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 my-2">
  <TilesetField bind:serviceUrl />
  <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
</div>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: selectedFeature,
      }}
    >
      {#snippet children({ context })}
        <Layer>
          <GeoTile url={serviceUrl} {zoomDelta} debug={settings.debug} />
          {#each filteredStates.features as feature}
            <!-- TODO: Renders on canvas if put on separate Layer  -->
            <GeoPath
              geojson={feature}
              tooltipContext={context.tooltip}
              class="stroke-black/20 hover:fill-white/30"
              onclick={() =>
                (selectedFeature = selectedFeature === feature ? filteredStates : feature)}
            />
          {/each}
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const [longitude, latitude] =
              context.geo.projection?.invert?.([context.tooltip.x, context.tooltip.y]) ?? []}
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

<h2>Clippped (currently svg-only)</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: selectedFeature,
      }}
    >
      {#snippet children({ context })}
        <Layer>
          <ClipPath useId="clip">
            <GeoTile url={serviceUrl} {zoomDelta} />
          </ClipPath>
          <GeoPath geojson={selectedFeature} id="clip" class="stroke-none" />
          {#each filteredStates.features as feature}
            <GeoPath
              geojson={feature}
              tooltipContext={context.tooltip}
              class="stroke-black/20 hover:fill-white/30"
              onclick={() =>
                (selectedFeature = selectedFeature === feature ? filteredStates : feature)}
            />
          {/each}
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const [longitude, latitude] =
              context.geo.projection?.invert?.([context.tooltip.x, context.tooltip.y]) ?? []}
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
