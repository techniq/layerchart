<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Chart, GeoPath, GeoTile, Svg, Tooltip, geoFitObjectTransform } from 'layerchart';
  import TransformControls from 'layerchart/components/TransformControls.svelte';
  import { Field, RangeField, Switch } from 'svelte-ux';

  import GeoDebug from '$lib/docs/GeoDebug.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import TilesetField from '$lib/docs/TilesetField.svelte';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);

  $: filteredStates = {
    ...states,
    features: states.features.filter((d) => {
      // Contiguous states
      return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
    }),
  };

  let serviceUrl: ComponentProps<GeoTile>['url'];
  let zoomDelta = 0;
  let debug = false;
</script>

<div class="grid grid-cols-[1fr,1fr,auto] gap-2 my-2">
  <TilesetField bind:serviceUrl />
  <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
  <Field label="Debug" let:id>
    <Switch bind:checked={debug} {id} size="sm" />
  </Field>
</div>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: filteredStates,
        applyTransform: ['translate', 'scale'],
      }}
      transform={{
        translateOnScale: true,
        initialScrollMode: 'scale',
      }}
      let:tooltip
      let:projection
      let:transform
      let:width
      let:height
    >
      {#if debug}
        <div class="absolute top-0 left-0 z-10 grid gap-1">
          <GeoDebug />
        </div>
      {/if}

      <TransformControls />

      <Svg>
        <GeoTile url={serviceUrl} {zoomDelta} {debug} />

        {#each filteredStates.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-none"
            {tooltip}
            onclick={() => {
              const featureTransform = geoFitObjectTransform(projection, [width, height], feature);
              transform.setTranslate(featureTransform.translate);
              transform.setScale(featureTransform.scale);
            }}
          />
        {/each}
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

<h2>SVG with padding</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: filteredStates,
        applyTransform: ['translate', 'scale'],
      }}
      transform={{
        translateOnScale: true,
        initialScrollMode: 'scale',
      }}
      padding={{
        top: 100,
        bottom: 100,
        left: 100,
        right: 100,
      }}
      let:tooltip
      let:projection
      let:transform
      let:width
      let:height
    >
      {#if debug}
        <div class="absolute top-0 left-0 z-10 grid gap-1">
          <GeoDebug />
        </div>
      {/if}

      <TransformControls />

      <Svg>
        <GeoTile url={serviceUrl} {zoomDelta} {debug} />

        {#each filteredStates.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-none"
            {tooltip}
            onclick={() => {
              const featureTransform = geoFitObjectTransform(projection, [width, height], feature);
              transform.setTranslate(featureTransform.translate);
              transform.setScale(featureTransform.scale);
            }}
          />
        {/each}
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

<h2>Seamless (multiple zoom layers)</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        fitGeojson: filteredStates,
        applyTransform: ['translate', 'scale'],
      }}
      transform={{
        translateOnScale: true,
        initialScrollMode: 'scale',
      }}
      let:tooltip
      let:projection
      let:transform
      let:width
      let:height
    >
      {#if debug}
        <div class="absolute top-0 left-0 z-10 grid gap-1">
          <GeoDebug />
        </div>
      {/if}

      <TransformControls />

      <Svg>
        <!-- technique: https://observablehq.com/@d3/seamless-zoomable-map-tiles -->
        <GeoTile url={serviceUrl} zoomDelta={-100} />
        <GeoTile url={serviceUrl} zoomDelta={-4} />
        <GeoTile url={serviceUrl} zoomDelta={-1} />
        <GeoTile url={serviceUrl} {zoomDelta} {debug} />

        {#each filteredStates.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-none"
            {tooltip}
            onclick={() => {
              const featureTransform = geoFitObjectTransform(projection, [width, height], feature);
              transform.setTranslate(featureTransform.translate);
              transform.setScale(featureTransform.scale);
            }}
          />
        {/each}
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
