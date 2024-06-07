<script lang="ts">
  import {
    geoAlbersUsa,
    geoAlbers,
    geoEqualEarth,
    geoEquirectangular,
    geoMercator,
    geoNaturalEarth1,
    geoOrthographic,
    geoIdentity,
    type GeoPermissibleObjects,
  } from 'd3-geo';
  import { feature } from 'topojson-client';

  import {
    CopyButton,
    EmptyMessage,
    RangeField,
    SelectField,
    TextField,
    ToggleGroup,
    ToggleOption,
  } from 'svelte-ux';

  import Chart, { Canvas } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoTile from '$lib/components/GeoTile.svelte';
  import TilesetField from '$lib/docs/TilesetField.svelte';
  import Json from '$lib/docs/Json.svelte';

  let topojsonStr = '';
  let topojson: Parameters<typeof feature>[0];
  let geojson: GeoPermissibleObjects;
  let error = '';

  let selectedTab: 'input' | 'topojson' | 'geojson' = 'input';

  $: if (topojsonStr) {
    try {
      topojson = JSON.parse(topojsonStr);
      // TODO: Add dropdown to select features instead of only using first
      const features = Object.keys(topojson.objects);
      geojson = feature(topojson, topojson.objects[features[0]]);
      error = '';
    } catch (e) {
      error = 'Invalid object';
      console.error(e);
    }
  }

  let projection = geoMercator;
  const projections = [
    { label: 'Identity', value: geoIdentity },
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    { label: 'Orthographic', value: geoOrthographic },
  ];

  let serviceUrl;
  let zoomDelta = 0;
</script>

<div class="grid gap-2">
  <div class="grid grid-cols-3 gap-2">
    <SelectField
      label="Projections"
      options={projections}
      bind:value={projection}
      clearable={false}
    />

    <TilesetField bind:serviceUrl />
    <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
  </div>

  <div class="h-[600px] bg-surface-100/50 border rounded-lg overflow-hidden">
    {#if geojson}
      <Chart
        geo={{
          projection,
          fitGeojson: geojson,
        }}
        padding={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {#if projection === geoMercator}
          <Canvas>
            <GeoTile url={serviceUrl} {zoomDelta} />
          </Canvas>
        {/if}

        <Canvas>
          {#if projection === geoMercator}
            <GeoPath {geojson} class="stroke-black fill-black/50" />
          {:else}
            <GeoPath {geojson} class="stroke-surface-content fill-surface-100" />
          {/if}
        </Canvas>
      </Chart>
    {:else}
      <EmptyMessage class="h-full">Please enter input below</EmptyMessage>
    {/if}
  </div>

  <ToggleGroup
    bind:value={selectedTab}
    variant="underline"
    classes={{ options: 'justify-start h-10' }}
  >
    <ToggleOption value="input">Input</ToggleOption>
    <ToggleOption value="topojson">TopoJSON</ToggleOption>
    <ToggleOption value="geojson">GeoJSON</ToggleOption>
  </ToggleGroup>

  <div class="relative">
    {#if selectedTab === 'input'}
      <TextField
        label="TopoJSON"
        bind:value={topojsonStr}
        placeholder={'{"type":"Topology","objects": { ... }, arcs: [...], bbox: [...]}'}
        multiline
        classes={{
          input: 'h-[400px]',
        }}
      />
    {:else if selectedTab === 'topojson'}
      <Json value={topojson} />
    {:else if selectedTab === 'geojson'}
      <CopyButton value={JSON.stringify(geojson)} class="absolute top-0 right-0" />
      <Json value={geojson} />
    {/if}
  </div>
</div>
