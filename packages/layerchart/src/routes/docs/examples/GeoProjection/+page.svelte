<script lang="ts">
  import {
    geoAlbersUsa,
    geoAlbers,
    geoEqualEarth,
    geoEquirectangular,
    geoMercator,
    geoNaturalEarth1,
    geoOrthographic,
    geoStereographic,
    geoGnomonic,
  } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Chart, GeoPath, Graticule, Layer, Tooltip } from 'layerchart';
  import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  let config = $state({
    projection: geoOrthographic,
    detailed: false,
    rotate: {
      yaw: 0,
      pitch: 0,
      roll: 0,
    },
    scale: 0,
  });

  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    { label: 'Orthographic', value: geoOrthographic },
    { label: 'Stereographic', value: geoStereographic },
    { label: 'Gnomonic', value: geoGnomonic },
  ];

  const dataGeoJson = $derived(config.detailed ? data.geojsonDetail : data.geojson);

  const geojson = $derived(feature(dataGeoJson, dataGeoJson.objects.countries));
  const features = $derived(
    config.projection === geoAlbersUsa
      ? geojson.features.filter((f) => f.properties.name === 'United States of America')
      : geojson.features
  );
</script>

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={config.projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
  <RangeField label="Scale" bind:value={config.scale} min={-100} max={3000} />
  <Field label="Detail" let:id>
    <Switch bind:checked={config.detailed} {id} />
  </Field>
</div>
<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">
  <RangeField label="Yaw" bind:value={config.rotate.yaw} min={-360} max={360} />
  <RangeField label="Pitch" bind:value={config.rotate.pitch} min={-90} max={90} />
  <RangeField label="Roll" bind:value={config.rotate.roll} min={-180} max={180} />
</div>

<h1>Examples</h1>

<Preview data={geojson}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: config.projection,
        fitGeojson: geojson,
        rotate: config.rotate,
        scale: config.scale,
        // applyTransform: ['rotate'],
      }}
      padding={{ left: 100, right: 100 }}
    >
      {#snippet children({ context })}
        <Layer>
          <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content fill-blue-400/50" />
          <Graticule class="stroke-surface-content/20 pointer-events-none" />
          {#each features as feature}
            <GeoPath
              geojson={feature}
              tooltipContext={context.tooltip}
              class="stroke-surface-content/50 fill-white hover:fill-gray-300"
            />
          {/each}
        </Layer>

        <Tooltip.Root>
          {context.tooltip.data?.properties.name}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
