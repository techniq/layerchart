<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import {
    Chart,
    GeoPath,
    GeoTile,
    Svg,
    Tooltip,
    TooltipItem,
    TransformControls,
    geoFitObjectTransform,
  } from 'layerchart';
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

  let serviceUrl: ComponentProps<TilesetField>['serviceUrl'];
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
            on:click={(e) => {
              const { geoPath, event } = e.detail;

              const featureTransform = geoFitObjectTransform(projection, [width, height], feature);
              transform.setTranslate(featureTransform.translate);
              transform.setScale(featureTransform.scale);
            }}
          />
        {/each}
      </Svg>
      <Tooltip header={(data) => data.properties.name} let:data>
        {@const [longitude, latitude] = projection.invert([tooltip.x, tooltip.y])}
        <TooltipItem label="longitude" value={longitude} format="decimal" />
        <TooltipItem label="latitude" value={latitude} format="decimal" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
