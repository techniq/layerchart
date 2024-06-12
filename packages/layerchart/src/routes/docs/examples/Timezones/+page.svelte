<script lang="ts">
  import {
    geoAlbersUsa,
    geoAlbers,
    geoEqualEarth,
    geoEquirectangular,
    geoMercator,
    geoNaturalEarth1,
  } from 'd3-geo';
  import { extent } from 'd3-array';
  import { scaleSequential } from 'd3-scale';
  import { interpolateRdBu } from 'd3-scale-chromatic';
  import { feature } from 'topojson-client';
  import { century, equationOfTime, declination } from 'solar-calculator';

  import { Field, SelectField, Switch, timerStore } from 'svelte-ux';

  import { Chart, Svg } from 'layerchart';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import Blur from '$lib/components/Blur.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import ClipPath from '$lib/components/ClipPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import GeoCircle from '$lib/components/GeoCircle.svelte';
  import { antipode } from '$lib/utils/geo.js';

  export let data;

  let enableClip = false;
  let showDaylight = false;

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

  $: timezoneGeojson = feature(data.timezones, data.timezones.objects.timezones);

  $: colorScale = scaleSequential(
    extent(timezoneGeojson.features, (d) => d.properties.zone),
    interpolateRdBu
  );

  const dateTimer = timerStore();

  function formatDate(date: Date, timeZone: string | null) {
    let result = '-';
    if (timeZone) {
      try {
        result = new Intl.DateTimeFormat(undefined, {
          timeStyle: 'medium',
          dateStyle: 'short',
          timeZone,
        }).format(date);
      } catch {}
    }

    return result;
  }

  const now = new Date();
  const day = new Date(+now).setUTCHours(0, 0, 0, 0);
  const t = century(now);
  const longitude = ((day - now) / 864e5) * 360 - 180;
  const sun = [longitude - equationOfTime(t) / 4, declination(t)];
</script>

<div class="grid grid-cols-[1fr,auto,auto,2fr] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />

  <Field label="Clip" let:id>
    <Switch bind:checked={enableClip} {id} size="md" />
  </Field>

  <Field label="Daylight" let:id>
    <Switch bind:checked={showDaylight} {id} size="md" />
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
      let:tooltip
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content/30" id="globe" />
        <Graticule class="stroke-surface-content/20" />

        <GeoPath {geojson} id="clip" />
        <ClipPath useId="clip" disabled={!enableClip}>
          {#each timezoneGeojson.features as feature}
            <GeoPath
              geojson={feature}
              {tooltip}
              fill={colorScale(feature.properties.zone)}
              class="stroke-gray-900/50 hover:brightness-110"
            />
          {/each}
        </ClipPath>

        {#each features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-gray-900/10 fill-gray-900/20 pointer-events-none"
          />
        {/each}

        {#if showDaylight}
          <ClipPath useId="globe">
            <Blur>
              <GeoCircle
                center={antipode(sun)}
                class="stroke-none fill-black/50 pointer-events-none"
              />
            </Blur>
          </ClipPath>
        {/if}
      </Svg>

      <Tooltip let:data>
        {@const { tz_name1st, time_zone } = data.properties}
        <TooltipItem label="Name" value={tz_name1st} />
        <TooltipItem label="Timezone" value={time_zone} />
        <TooltipItem
          label="Current time"
          value={formatDate($dateTimer, time_zone.replace('UTC', '').replace('±', '+'))}
        />
      </Tooltip>
    </Chart>
  </div>
</Preview>
