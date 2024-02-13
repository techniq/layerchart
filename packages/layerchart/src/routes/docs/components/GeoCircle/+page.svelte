<script lang="ts">
  import {
    geoAlbersUsa,
    geoAlbers,
    geoEqualEarth,
    geoEquirectangular,
    geoMercator,
    geoNaturalEarth1,
    geoOrthographic,
  } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { RangeField, SelectField } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoCircle from '$lib/components/GeoCircle.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  let latitude = 0;
  let longitude = 0;
  let radius = 600;
  let precision = 6;

  let projection = geoNaturalEarth1;
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    { label: 'Orthographic', value: geoOrthographic },
  ];

  $: geojson = feature(data.geojson, data.geojson.objects.countries);
  $: features =
    projection === geoAlbersUsa
      ? geojson.features.filter((f) => f.properties.name === 'United States of America')
      : geojson.features;
</script>

<div class="grid grid-cols-2 gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
    class="col-span-2"
  />
  <RangeField label="Latitude" bind:value={latitude} min={-90} max={90} />
  <RangeField label="Longitude" bind:value={longitude} min={-180} max={180} />
  <RangeField label="Radius (km)" bind:value={radius} max={6371} />
  <RangeField label="Precision" bind:value={precision} max={90} />
</div>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={geojson}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: geojson,
      }}
      padding={{ left: 100, right: 100 }}
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content/30" id="globe" />
        <Graticule class="stroke-surface-content/20" />

        <GeoPath {geojson} id="clip" />

        {#each features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-gray-900/10 fill-gray-900/20 pointer-events-none"
          />
        {/each}

        <GeoCircle
          center={[longitude, latitude]}
          radius={(radius / (6371 * Math.PI * 2)) * 360}
          {precision}
          class="fill-danger stroke-none"
        />
      </Svg>
    </Chart>
  </div>
</Preview>
