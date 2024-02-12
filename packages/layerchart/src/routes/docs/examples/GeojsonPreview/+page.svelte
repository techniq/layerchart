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

  import { EmptyMessage, RangeField, SelectField, TextField, autoHeight } from 'svelte-ux';

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

<div class="grid grid-cols-[1fr,2fr] gap-2 h-full items-start">
  <div class="grid gap-2">
    <SelectField
      label="Projections"
      options={projections}
      bind:value={projection}
      clearable={false}
    />

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
