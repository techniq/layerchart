<script lang="ts">
  import { geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Field, RangeField, Switch } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import TilesetField from '$lib/docs/TilesetField.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import ClipPath from '$lib/components/ClipPath.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoTile from '$lib/components/GeoTile.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import geojson from '../_data/geo/us-states-topojson.js';

  const states = feature(geojson, geojson.objects.collection);

  $: filteredStates = {
    ...states,
    features: states.features.filter(
      (d) => d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii'
    ),
  };
  // $: filteredStates = { ...states, features: states.features.filter(d => d.properties.name === 'West Virginia')}
  $: selectedFeature = filteredStates;

  let serviceUrl;
  let zoomDelta = 0;
  let debug = false;
</script>

<div class="grid grid-cols-[1fr,1fr,auto] gap-2 my-2">
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
      tooltip={{ mode: 'manual' }}
      let:tooltip
      let:projection
    >
      <Svg>
        <GeoTile url={serviceUrl} {zoomDelta} {debug} />
        {#each filteredStates.features as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            class="stroke-black/20 hover:fill-white/30"
            on:click={() =>
              (selectedFeature = selectedFeature === feature ? filteredStates : feature)}
          />
        {/each}
      </Svg>
      <Tooltip header={(data) => data.properties.name} let:data>
        {@const [longitude, latitude] = projection.invert([tooltip.left, tooltip.top])}
        <TooltipItem label="longitude" value={longitude} format="decimal" />
        <TooltipItem label="latitude" value={latitude} format="decimal" />
      </Tooltip>
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
      tooltip={{ mode: 'manual' }}
      let:tooltip
      let:projection
    >
      <Svg>
        <ClipPath useId="clip">
          <GeoTile url={serviceUrl} {zoomDelta} />
        </ClipPath>
        <GeoPath geojson={selectedFeature} id="clip" class="stroke-none" />
        {#each filteredStates.features as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            class="stroke-black/20 hover:fill-white/30"
            on:click={() =>
              (selectedFeature = selectedFeature === feature ? filteredStates : feature)}
          />
        {/each}
      </Svg>
      <Tooltip header={(data) => data.properties.name} let:data>
        {@const [longitude, latitude] = projection.invert([tooltip.left, tooltip.top])}
        <TooltipItem label="longitude" value={longitude} format="decimal" />
        <TooltipItem label="latitude" value={latitude} format="decimal" />
      </Tooltip>
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
        <GeoPath geojson={filteredStates} stroke="rgba(0,0,0,.2)" />
      </Canvas>
    </Chart>
  </div>
</Preview>
