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

  import { Canvas, Chart, GeoPath, Graticule, Svg, Tooltip } from 'layerchart';
  import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  let projection = geoOrthographic;
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    { label: 'Orthographic', value: geoOrthographic },
  ];

  let detailed = false;

  $: dataGeoJson = detailed ? data.geojsonDetail : data.geojson;
  $: geojson = feature(dataGeoJson, dataGeoJson.objects.countries);
  $: features =
    projection === geoAlbersUsa
      ? geojson.features.filter((f) => f.properties.name === 'United States of America')
      : geojson.features;

  let scale = 0;
  let yaw = 0;
  let pitch = 0;
  let roll = 0;
</script>

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
  <RangeField label="Scale" bind:value={scale} min={-100} max={3000} />
  <Field label="Detail" let:id>
    <Switch bind:checked={detailed} {id} />
  </Field>
</div>
<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">
  <RangeField label="Yaw" bind:value={yaw} min={-360} max={360} />
  <RangeField label="Pitch" bind:value={pitch} min={-90} max={90} />
  <RangeField label="Roll" bind:value={roll} min={-180} max={180} />
</div>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={geojson}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: geojson,
        rotate: {
          yaw,
          pitch,
          roll,
        },
        scale,
        // applyTransform: ['rotate'],
      }}
      padding={{ left: 100, right: 100 }}
      let:tooltip
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content fill-blue-400/50" />
        <Graticule class="stroke-surface-content/20 pointer-events-none" />
        {#each features as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            class="stroke-surface-content/50 fill-white hover:fill-gray-300"
          />
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        {data.properties.name}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={geojson}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection,
        fitGeojson: geojson,
        rotate: {
          yaw,
          pitch,
          roll,
        },
        scale,
        // applyTransform: ['rotate'],
      }}
    >
      <Canvas>
        <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content fill-blue-400/50" />
      </Canvas>
      <Canvas>
        <Graticule class="stroke-surface-content/20" />
      </Canvas>
      <Canvas>
        <GeoPath {geojson} class="stroke-surface-content/50 fill-white" />
      </Canvas>
    </Chart>
  </div>
</Preview>
