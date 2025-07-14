<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Chart, GeoPath, GeoTile, Layer, Tooltip, geoFitObjectTransform } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';
  import { RangeField } from 'svelte-ux';

  import GeoDebug from '$lib/docs/GeoDebug.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import TilesetField from '$lib/docs/TilesetField.svelte';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const states = $derived(feature(data.geojson, data.geojson.objects.states));

  const filteredStates = $derived({
    ...states,
    features: states.features.filter((d) => {
      // Contiguous states
      return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
    }),
  });

  let serviceUrl = $state<ComponentProps<typeof GeoTile>['url']>(null!);
  let zoomDelta = $state(0);
  let debug = $derived(shared.debug);
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 my-2">
  <TilesetField bind:serviceUrl />
  <RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
</div>

<h1>Examples</h1>

<h2>Basic</h2>

{#if serviceUrl}
  <Preview data={filteredStates}>
    <div class="h-[600px] relative overflow-hidden">
      <Chart
        geo={{
          projection: geoMercator,
          fitGeojson: filteredStates,
          applyTransform: ['translate', 'scale'],
        }}
        transform={{
          initialScrollMode: 'scale',
        }}
      >
        {#snippet children({ context })}
          {#if debug}
            <div class="absolute top-0 left-0 z-10 grid gap-1">
              <GeoDebug />
            </div>
          {/if}

          <TransformControls />

          <Layer type={shared.renderContext}>
            <GeoTile url={serviceUrl} {zoomDelta} {debug} />

            {#each filteredStates.features as feature}
              <GeoPath
                geojson={feature}
                class="stroke-none"
                tooltipContext={context.tooltip}
                onclick={() => {
                  if (!context.geo.projection) return;
                  const featureTransform = geoFitObjectTransform(
                    context.geo.projection,
                    [context.width, context.height],
                    feature
                  );
                  context.transform.setTranslate(featureTransform.translate);
                  context.transform.setScale(featureTransform.scale);
                }}
              />
            {/each}
          </Layer>

          <Tooltip.Root>
            {#snippet children({ data })}
              {@const [longitude, latitude] =
                context.geo.projection?.invert?.([context.tooltip.x, context.tooltip.y]) ?? []}
              <Tooltip.Header>{data.properties.name}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="longitude" value={longitude} format="decimal" />
                <Tooltip.Item label="latitude" value={latitude} format="decimal" />
              </Tooltip.List>
            {/snippet}
          </Tooltip.Root>
        {/snippet}
      </Chart>
    </div>
  </Preview>

  <h2>With padding</h2>

  <Preview data={filteredStates}>
    <div class="h-[600px] relative overflow-hidden">
      <Chart
        geo={{
          projection: geoMercator,
          fitGeojson: filteredStates,
          applyTransform: ['translate', 'scale'],
        }}
        transform={{
          initialScrollMode: 'scale',
        }}
        padding={{
          top: 100,
          bottom: 100,
          left: 100,
          right: 100,
        }}
      >
        {#snippet children({ context })}
          {#if debug}
            <div class="absolute top-0 left-0 z-10 grid gap-1">
              <GeoDebug />
            </div>
          {/if}

          <TransformControls />

          <Layer type={shared.renderContext}>
            <GeoTile url={serviceUrl} {zoomDelta} {debug} />

            {#each filteredStates.features as feature}
              <GeoPath
                geojson={feature}
                class="stroke-none"
                tooltipContext={context.tooltip}
                onclick={() => {
                  if (!context.geo.projection) return;
                  const featureTransform = geoFitObjectTransform(
                    context.geo.projection,
                    [context.width, context.height],
                    feature
                  );
                  context.transform.setTranslate(featureTransform.translate);
                  context.transform.setScale(featureTransform.scale);
                }}
              />
            {/each}
          </Layer>

          <Tooltip.Root>
            {#snippet children({ data })}
              {@const [longitude, latitude] =
                context.geo.projection?.invert?.([
                  context.tooltip.x - context.padding.left,
                  context.tooltip.y - context.padding.top,
                ]) ?? []}
              <Tooltip.Header>{data.properties.name}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="longitude" value={longitude} format="decimal" />
                <Tooltip.Item label="latitude" value={latitude} format="decimal" />
              </Tooltip.List>
            {/snippet}
          </Tooltip.Root>
        {/snippet}
      </Chart>
    </div>
  </Preview>

  <h2>Seamless (multiple zoom layers)</h2>

  <Preview data={filteredStates}>
    <div class="h-[600px] relative overflow-hidden">
      <Chart
        geo={{
          projection: geoMercator,
          fitGeojson: filteredStates,
          applyTransform: ['translate', 'scale'],
        }}
        transform={{
          initialScrollMode: 'scale',
        }}
      >
        {#snippet children({ context })}
          {#if debug}
            <div class="absolute top-0 left-0 z-10 grid gap-1">
              <GeoDebug />
            </div>
          {/if}

          <TransformControls />

          <Layer type={shared.renderContext}>
            <!-- technique: https://observablehq.com/@d3/seamless-zoomable-map-tiles -->
            <GeoTile url={serviceUrl} zoomDelta={-100} />
            <GeoTile url={serviceUrl} zoomDelta={-4} />
            <GeoTile url={serviceUrl} zoomDelta={-1} />
            <GeoTile url={serviceUrl} {zoomDelta} {debug} />

            {#each filteredStates.features as feature}
              <GeoPath
                geojson={feature}
                class="stroke-none"
                tooltipContext={context.tooltip}
                onclick={() => {
                  if (!context.geo.projection) return;
                  const featureTransform = geoFitObjectTransform(
                    context.geo.projection,
                    [context.width, context.height],
                    feature
                  );
                  context.transform.setTranslate(featureTransform.translate);
                  context.transform.setScale(featureTransform.scale);
                }}
              />
            {/each}
          </Layer>

          <Tooltip.Root>
            {#snippet children({ data })}
              {@const [longitude, latitude] =
                context.geo.projection?.invert?.([context.tooltip.x, context.tooltip.y]) ?? []}
              <Tooltip.Header>{data.properties.name}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="longitude" value={longitude} format="decimal" />
                <Tooltip.Item label="latitude" value={latitude} format="decimal" />
              </Tooltip.List>
            {/snippet}
          </Tooltip.Root>
        {/snippet}
      </Chart>
    </div>
  </Preview>
{/if}
