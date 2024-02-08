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

  import { Field } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import timezones from '../_data/geo/timezones.json';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  export let data;

  let projection = geoNaturalEarth1;
  const projections = [
    { name: 'Albers', value: geoAlbers },
    { name: 'Albers USA', value: geoAlbersUsa },
    { name: 'Equal Earth', value: geoEqualEarth },
    { name: 'Equirectangular', value: geoEquirectangular },
    { name: 'Mercator', value: geoMercator },
    { name: 'Natural Earth', value: geoNaturalEarth1 },
    { name: 'Orthographic', value: geoOrthographic },
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
  <Field label="Projections" let:id>
    <select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
      {#each projections as option}
        <option value={option.value}>{option.name}</option>
      {/each}
    </select>
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
      }}
      padding={{ left: 100, right: 100 }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content fill-blue-400/50" />

        {#each timezoneGeojson.features as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            fill={colorScale(feature.properties.zone)}
            class="stroke-surface-content/50 hover:opacity-80"
          />
        {/each}

        {#each features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-surface-content/50 fill-surface-content/20 pointer-events-none"
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
