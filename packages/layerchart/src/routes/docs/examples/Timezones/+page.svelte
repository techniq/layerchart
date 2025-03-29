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
  // @ts-expect-error
  import { century, equationOfTime, declination } from 'solar-calculator';

  import {
    Blur,
    Chart,
    ClipPath,
    GeoCircle,
    GeoPath,
    Graticule,
    Svg,
    Tooltip,
    antipode,
  } from 'layerchart';
  import { Field, SelectField, Switch } from 'svelte-ux';
  import { timerStore } from '@layerstack/svelte-stores';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  let enableClip = $state(false);
  let showDaylight = $state(false);

  let projection = $state(geoNaturalEarth1);
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    // { label: 'Orthographic', value: geoOrthographic },
  ];

  const geojson = $derived(feature(data.geojson, data.geojson.objects.countries));
  const features = $derived(
    projection === geoAlbersUsa
      ? geojson.features.filter((f) => f.properties.name === 'United States of America')
      : geojson.features
  );

  const timezoneGeojson = $derived(feature(data.timezones, data.timezones.objects.timezones));

  const colorScale = $derived(
    scaleSequential(
      // @ts-expect-error
      extent(timezoneGeojson.features, (d) => d.properties.zone),
      interpolateRdBu
    )
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
  const longitude = ((day - now.valueOf()) / 864e5) * 360 - 180;
  const sun = [longitude - equationOfTime(t) / 4, declination(t)] as [number, number];
</script>

<div class="grid grid-cols-[1fr_auto_auto_2fr] gap-2 my-2">
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
    >
      {#snippet children({ context })}
        <Svg>
          <GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content/30" id="globe" />
          <Graticule class="stroke-surface-content/20" />

          <GeoPath {geojson} id="clip" />
          <ClipPath useId="clip" disabled={!enableClip}>
            {#each timezoneGeojson.features as feature}
              <GeoPath
                geojson={feature}
                tooltipContext={context.tooltip}
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

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const { tz_name1st, time_zone } = data.properties}
            <Tooltip.List>
              <Tooltip.Item label="Name" value={tz_name1st} />
              <Tooltip.Item label="Timezone" value={time_zone} />
              <Tooltip.Item
                label="Current time"
                value={formatDate($dateTimer, time_zone.replace('UTC', '').replace('±', '+'))}
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
