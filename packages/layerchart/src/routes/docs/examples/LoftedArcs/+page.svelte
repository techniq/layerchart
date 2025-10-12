<script lang="ts">
  import { geoOrthographic, geoNaturalEarth1 } from 'd3-geo';
  import { flatRollup } from 'd3-array';
  import { feature } from 'topojson-client';

  import { Chart, GeoEdgeFade, GeoPath, GeoPoint, GeoSpline, Graticule, Layer } from 'layerchart';
  import { Field, Switch } from 'svelte-ux';

  import GeoDebug from '$lib/docs/GeoDebug.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const countries = feature(data.geojson, data.geojson.objects.countries);

  // Use a single link per source
  const singleLinks = $derived(
    flatRollup(
      data.worldLinks,
      (values) => {
        return values[1];
      },
      (d) => d.sourceId
    ).map((d) => d[1])
  );

  let debug = $derived(shared.debug);
</script>

<h1>Examples</h1>

<h2>World map</h2>

<Preview data={countries}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoNaturalEarth1,
        fitGeojson: countries,
      }}
      padding={{ top: 16, bottom: 16, left: 16, right: 16 }}
    >
      <Layer type={shared.layer}>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
        <Graticule class="stroke-surface-content/20" />
        {#each countries.features as country}
          <GeoPath geojson={country} class="stroke-surface-content/50 fill-white" />
        {/each}
        {#each singleLinks as link}
          <GeoSpline {link} class="stroke-gray-500/30 stroke-2" />
          <GeoSpline {link} class="stroke-danger stroke-2" loft={1.3} />
          <GeoPoint lat={link.source[1]} long={link.source[0]} r={2} class="fill-black" />
          <GeoPoint lat={link.target[1]} long={link.target[0]} r={2} class="fill-black" />
        {/each}
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Draggable globe with EdgeFade</h2>

<Preview data={countries}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        applyTransform: ['rotate'],
      }}
      padding={{ top: 80, bottom: 80 }}
    >
      {#if debug}
        <GeoDebug class="absolute top-0 right-0 z-10" />
      {/if}
      <Layer type={shared.layer}>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
        <Graticule class="stroke-surface-content/20 pointer-events-none" />
        {#each countries.features as country}
          <GeoPath
            geojson={country}
            class="stroke-surface-content/50 fill-white pointer-events-none"
          />
        {/each}
        {#each data.worldLinks as link}
          <GeoEdgeFade {link}>
            <GeoPoint lat={link.source[1]} long={link.source[0]} r={2} class="fill-black" />
            <GeoPoint lat={link.target[1]} long={link.target[0]} r={2} class="fill-black" />
            <GeoSpline {link} class="stroke-gray-500/30 stroke-2" />
            <GeoSpline {link} class="stroke-danger stroke-2" loft={1.3} />
          </GeoEdgeFade>
        {/each}
      </Layer>
    </Chart>
  </div>
</Preview>
