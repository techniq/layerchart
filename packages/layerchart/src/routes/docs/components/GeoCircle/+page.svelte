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
  import { range } from 'd3-array';
  import { feature } from 'topojson-client';

  import { Chart, GeoCircle, GeoPath, Graticule, Svg } from 'layerchart';
  import { Field, RangeField, SelectField, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  let example: 'single' | 'multi' = 'single';
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

  const step = 10;
  const coordinates = range(-80, 80 + step, step).flatMap((y) => {
    return range(-180, 180 + step, step).map((x) => {
      return [x, y];
    });
  });
</script>

<div class="grid grid-cols-2 gap-2 my-2">
  <Field label="Example">
    <ToggleGroup bind:value={example} variant="outline" inset class="w-full" size="sm">
      <ToggleOption value="single">Single</ToggleOption>
      <ToggleOption value="multi">Multi</ToggleOption>
    </ToggleGroup>
  </Field>

  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />

  <RangeField
    label="Latitude"
    bind:value={latitude}
    min={-90}
    max={90}
    disabled={example != 'single'}
  />
  <RangeField
    label="Longitude"
    bind:value={longitude}
    min={-180}
    max={180}
    disabled={example != 'single'}
  />
  <RangeField label="Radius (km)" bind:value={radius} max={6371} disabled={example != 'single'} />
  <RangeField label="Precision" bind:value={precision} max={90} disabled={example != 'single'} />
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

        {#each features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-surface-content/30 fill-surface-content/20 pointer-events-none"
          />
        {/each}

        {#if example === 'single'}
          <!-- TODO: Not sure why {#key} is needed to fix "ghosting" -->
          {#key [longitude, latitude]}
            <GeoCircle
              center={[longitude, latitude]}
              radius={(radius / (6371 * Math.PI * 2)) * 360}
              {precision}
              class="fill-danger stroke-none"
            />
          {/key}
        {:else if example === 'multi'}
          {#each coordinates as coords}
            <GeoCircle
              center={[coords[0], coords[1]]}
              radius={step / 4}
              {precision}
              class="stroke-danger"
            />
          {/each}
        {/if}
      </Svg>
    </Chart>
  </div>
</Preview>
