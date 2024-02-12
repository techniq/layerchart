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

  import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';

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

  let yaw = 0;
  let pitch = 0;
  let roll = 0;
  let scale = 0;
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,auto] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
  <RangeField label="Yaw" bind:value={yaw} min={-360} max={360} />
  <RangeField label="Pitch" bind:value={pitch} min={-90} max={90} />
  <RangeField label="Roll" bind:value={roll} min={-180} max={180} />
  <RangeField label="Scale" bind:value={scale} min={-100} max={3000} />
  <Field label="Detail" let:id>
    <Switch bind:checked={detailed} {id} />
  </Field>
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
      }}
      padding={{ left: 100, right: 100 }}
      tooltip={{ mode: 'manual' }}
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
      <Tooltip header={(data) => data.properties.name} let:data />
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
      }}
    >
      <Canvas>
        <GeoPath geojson={{ type: 'Sphere' }} fill="#93c5fd" />
      </Canvas>
      <Canvas>
        <Graticule stroke="rgba(0,0,0,.20)" />
      </Canvas>
      <Canvas>
        <GeoPath {geojson} fill="white" />
      </Canvas>
    </Chart>
  </div>
</Preview>
