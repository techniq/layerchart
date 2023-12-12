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

  import { EmptyMessage, Field, RangeField, TextField, autoHeight } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoTile from '$lib/components/GeoTile.svelte';
  import TilesetField from '$lib/docs/TilesetField.svelte';

  let geojsonStr = '';
  let geojson: GeoPermissibleObjects;
  let error = '';

  $: try {
    geojson = JSON.parse(geojsonStr);
    error = '';
  } catch (e) {
    error = 'Invalid object';
  }

  let projection = geoMercator;
  const projections = [
    { name: 'Identity', value: geoIdentity },
    { name: 'Albers', value: geoAlbers },
    { name: 'Albers USA', value: geoAlbersUsa },
    { name: 'Equal Earth', value: geoEqualEarth },
    { name: 'Equirectangular', value: geoEquirectangular },
    { name: 'Mercator', value: geoMercator },
    { name: 'Natural Earth', value: geoNaturalEarth1 },
    { name: 'Orthographic', value: geoOrthographic },
  ];

  let serviceUrl;
  let zoomDelta = 0;
</script>

<div class="grid grid-cols-[1fr,2fr] gap-2 h-full items-start">
  <div class="grid gap-2">
    <Field label="Projections" let:id class="mb-2">
      <select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
        {#each projections as option}
          <option value={option.value}>{option.name}</option>
        {/each}
      </select>
    </Field>

    <TilesetField bind:serviceUrl />
    <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />

    <TextField
      label="GeoJSON"
      bind:value={geojsonStr}
      placeholder="Please enter valid geojson"
      multiline
      actions={(node) => [autoHeight(node)]}
      _classes={{ root: 'h-full', container: 'h-full', input: 'h-full' }}
    />
  </div>

  {#if geojson}
    <div class="h-[600px] bg-surface-100/50 border rounded-lg overflow-hidden">
      <Chart
        geo={{
          projection,
          fitGeojson: geojson,
        }}
        padding={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Svg>
          <GeoTile url={serviceUrl} {zoomDelta} />
          <GeoPath {geojson} fill="rgba(0,0,0,.5)" />
        </Svg>
      </Chart>
    </div>
  {:else}
    <EmptyMessage class="py-4 mx-1">Please enter geojson field</EmptyMessage>
  {/if}
</div>
