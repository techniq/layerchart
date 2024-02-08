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
  import { extent } from 'd3-array';
  import { scaleSequential } from 'd3-scale';
  import { interpolateRdBu } from 'd3-scale-chromatic';
  import { feature } from 'topojson-client';

  import { SelectField } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import timezones from '../_data/geo/timezones.json';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  export let data;

  let projection = geoNaturalEarth1;
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    // { label: 'Orthographic', value: geoOrthographic },
  ];

  $: geojson = feature(data.geojson, data.geojson.objects.countries);
  $: features =
    projection === geoAlbersUsa
      ? geojson.features.filter((f) => f.properties.name === 'United States of America')
      : geojson.features;

  $: timezoneGeojson = feature(timezones, timezones.objects.timezones);

  $: colorScale = scaleSequential(
    extent(timezoneGeojson.features, (d) => d.properties.zone),
    interpolateRdBu
  );
</script>

<div class="grid grid-cols-[1fr,2fr] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
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
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        <!-- <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content fill-blue-400/50" /> -->

        {#each timezoneGeojson.features as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            fill={colorScale(feature.properties.zone)}
            class="stroke-gray-900/50 hover:brightness-110"
          />
        {/each}

        {#each features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-gray-900/10 fill-gray-900/20 pointer-events-none"
          />
        {/each}
      </Svg>
      <Tooltip let:data>
        <TooltipItem label="Name" value={data.properties.tz_name1st} />
        <TooltipItem label="Timezone" value={data.properties.time_zone} />
      </Tooltip>
    </Chart>
  </div>
</Preview>
