<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Canvas, ClipPath, Chart, GeoPath, GeoTile, Svg, Tooltip } from 'layerchart';
  import { Field, RangeField, Switch } from 'svelte-ux';

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
  let debug = $state(false);
</script>

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2">
  <TilesetField bind:serviceUrl />
  <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
  <Field label="Debug" let:id>
    <Switch bind:checked={debug} {id} />
  </Field>
</div>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: selectedFeature,
      }}
    >
      {#snippet children({ tooltipContext, geoContext })}
        <Svg>
          <GeoTile url={serviceUrl} {zoomDelta} {debug} />
          {#each filteredStates.features as feature}
            <GeoPath
              geojson={feature}
              {tooltipContext}
              class="stroke-black/20 hover:fill-white/30"
              onclick={() =>
                (selectedFeature = selectedFeature === feature ? filteredStates : feature)}
            />
          {/each}
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

<h2>SVG (clipped)</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: selectedFeature,
      }}
    >
      {#snippet children({ tooltipContext, geoContext })}
        <Svg>
          <ClipPath useId="clip">
            <GeoTile url={serviceUrl} {zoomDelta} />
          </ClipPath>
          <GeoPath geojson={selectedFeature} id="clip" class="stroke-none" />
          {#each filteredStates.features as feature}
            <GeoPath
              geojson={feature}
              {tooltipContext}
              class="stroke-black/20 hover:fill-white/30"
              onclick={() =>
                (selectedFeature = selectedFeature === feature ? filteredStates : feature)}
            />
          {/each}
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

<Preview data={filteredStates}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: selectedFeature,
      }}
    >
      <Canvas>
        <GeoTile url={serviceUrl} {zoomDelta} />
      </Canvas>
      <Canvas>
        <GeoPath geojson={filteredStates} class="stroke-black/20" />
      </Canvas>
    </Chart>
  </div>
</Preview>
