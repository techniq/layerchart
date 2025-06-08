<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import {
    geoAlbersUsa,
    geoAlbers,
    geoEqualEarth,
    geoEquirectangular,
    geoMercator,
    geoNaturalEarth1,
    geoOrthographic,
    geoIdentity,
    type GeoProjection,
  } from 'd3-geo';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';
  import { color } from 'd3-color';

  import { Chart, GeoPath, GeoTile, Layer, Tooltip } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';
  import {
    EmptyMessage,
    RangeField,
    SelectField,
    TextField,
    ToggleGroup,
    ToggleOption,
  } from 'svelte-ux';

  import TilesetField from '$lib/docs/TilesetField.svelte';
  import Json from '$lib/docs/Json.svelte';
  import { shared } from '../../shared.svelte.js';

  let geojsonStr = $state('');
  let geojson = $state<GeoJSON.FeatureCollection>();
  let error = $state('');

  let selectedTab: 'input' | 'geojson' = $state('input');

  $effect.pre(() => {
    if (geojsonStr) {
      try {
        geojson = JSON.parse(geojsonStr);
        error = '';
      } catch (e) {
        error = 'Invalid object';
        console.error(e);
      }
    }
  });

  let projection = $state(geoMercator);
  const projections = [
    { label: 'Identity', value: geoIdentity as () => GeoProjection },
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    { label: 'Orthographic', value: geoOrthographic },
  ];

  let serviceUrl = $state<ComponentProps<typeof GeoTile>['url']>();
  let zoomDelta = $state(0);

  const colorScale = scaleOrdinal<string>().range(
    schemeCategory10.map((hex) => {
      let c = color(hex)!;
      c.opacity = 0.5;
      return c.toString() ?? '';
    })
  );
</script>

<div class="grid gap-2">
  <div class="grid grid-cols-3 gap-2">
    <SelectField
      label="Projections"
      options={projections}
      bind:value={projection}
      clearable={false}
    />

    <TilesetField bind:serviceUrl />
    <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
  </div>

  <div class="h-[600px] bg-surface-100/50 border rounded-lg overflow-hidden">
    {#if geojson}
      <Chart
        geo={{
          projection,
          fitGeojson: geojson,
          applyTransform: ['translate', 'scale'],
        }}
        transform={{
          initialScrollMode: 'scale',
        }}
        padding={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {#snippet children({ context })}
          {#if projection === geoMercator && serviceUrl}
            <Layer type={shared.renderContext}>
              <!-- technique: https://observablehq.com/@d3/seamless-zoomable-map-tiles -->
              <GeoTile url={serviceUrl} zoomDelta={-100} />
              <GeoTile url={serviceUrl} zoomDelta={-4} />
              <GeoTile url={serviceUrl} zoomDelta={-1} />
              <GeoTile url={serviceUrl} {zoomDelta} />
            </Layer>
          {/if}

          <TransformControls />

          <Layer type={shared.renderContext}>
            {#if geojson?.features}
              {#each geojson?.features as feature}
                <GeoPath
                  geojson={feature}
                  fill={colorScale(String(feature.id))}
                  class="stroke-black"
                  tooltipContext={context.tooltip}
                />
              {/each}
            {/if}
          </Layer>

          <Tooltip.Root>
            {#snippet children({ data })}
              <Tooltip.List>
                {#each Object.entries(data.properties) as [key, value]}
                  <Tooltip.Item label={key} {value} />
                {/each}
              </Tooltip.List>
            {/snippet}
          </Tooltip.Root>
        {/snippet}
      </Chart>
    {:else}
      <EmptyMessage class="h-full">Please enter input below</EmptyMessage>
    {/if}
  </div>

  <ToggleGroup
    bind:value={selectedTab}
    variant="underline"
    classes={{ options: 'justify-start h-10' }}
  >
    <ToggleOption value="input">Input</ToggleOption>
    <ToggleOption value="geojson">Parsed</ToggleOption>
  </ToggleGroup>

  {#if selectedTab === 'input'}
    <TextField
      label="GeoJSON"
      bind:value={geojsonStr}
      placeholder={'{"type": "FeatureCollection", "features": [...] }'}
      multiline
      classes={{
        input: 'h-[400px]',
      }}
    />
  {:else if selectedTab === 'geojson'}
    <Json value={geojson} />
  {/if}
</div>
