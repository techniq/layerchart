<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

  import GeoDebug from '$lib/docs/GeoDebug.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import TilesetField from '$lib/docs/TilesetField.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoTile from '$lib/components/GeoTile.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TransformControls from '$lib/components/TransformControls.svelte';

  import { geoFitObjectTransform } from '$lib/utils/geo.js';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);

  $: filteredStates = {
    ...states,
    features: states.features.filter((d) => {
      // Contiguous states
      return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
    }),
  };

  let serviceUrl: ComponentProps<TilesetField>['serviceUrl'];
  let zoomDelta = 0;
  let scrollMode = 'scale';
  let debug = false;
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 my-2">
  <TilesetField bind:serviceUrl />
  <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
  <Field label="Scroll mode" let:id>
    <ToggleGroup bind:value={scrollMode} variant="outline" size="sm" inset class="w-full">
      <ToggleOption value="none">None</ToggleOption>
      <ToggleOption value="scale">Scale</ToggleOption>
      <ToggleOption value="translate">Translate</ToggleOption>
    </ToggleGroup>
  </Field>
  <Field label="Debug" let:id>
    <Switch bind:checked={debug} {id} />
  </Field>
</div>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={filteredStates}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection: geoMercator,
        applyTransform: ['translate', 'scale'],
      }}
      transform={{
        translateOnScale: true,
        scroll: scrollMode,
      }}
      fitGeoObject={filteredStates}
      tooltip={{ mode: 'manual' }}
      let:tooltip
      let:projection
      let:transform
      let:width
      let:height
    >
      {#if debug}
        <div class="absolute top-0 left-0 z-10 grid gap-1">
          <GeoDebug />
        </div>
      {/if}

      <TransformControls />

      <Svg>
        <GeoTile url={serviceUrl} {zoomDelta} {debug} />
        {#each filteredStates.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-none"
            {tooltip}
            on:click={(e) => {
              const { geoPath, event } = e.detail;

              const featureTransform = geoFitObjectTransform(projection, [width, height], feature);
              transform.setTranslate(featureTransform.translate);
              transform.setScale(featureTransform.scale);
            }}
          />
        {/each}
      </Svg>
      <Tooltip header={(data) => data.properties.name} let:data>
        {@const [longitude, latitude] = projection.invert([tooltip.x, tooltip.y])}
        <TooltipItem label="longitude" value={longitude} format="decimal" />
        <TooltipItem label="latitude" value={latitude} format="decimal" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
