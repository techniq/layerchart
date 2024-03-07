<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { geoOrthographic, geoNaturalEarth1 } from 'd3-geo';
  import { flatRollup } from 'd3-array';
  import { feature } from 'topojson-client';

  import { Field, Switch } from 'svelte-ux';

  import GeoDebug from '$lib/docs/GeoDebug.svelte';
  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoEdgeFade from '$lib/components/GeoEdgeFade.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import Zoom from '$lib/components/Zoom.svelte';

  import links from '../_data/geo/world-links.json';
  import GeoSpline from '$lib/components/GeoSpline.svelte';
  import GeoPoint from '$lib/components/GeoPoint.svelte';

  export let data;

  const countries = feature(data.geojson, data.geojson.objects.countries);

  const translate = [480, 350];

  let scale = 0;
  let yaw = 0;
  let pitch = 0;
  let roll = 0;
  let sensitivity = 75;

  let zoom;
  let scrollMode = 'scale';
  let debug = false;

  // Use a single link per source
  $: singleLinks = flatRollup(
    links,
    (values) => {
      return values[1];
    },
    (d) => d.sourceId
  ).map((d) => d[1]);
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
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
        <Graticule class="stroke-surface-content/20" />
        {#each countries.features as country}
          <GeoPath geojson={country} class="stroke-surface-content/50 fill-white" />
        {/each}
        {#each singleLinks as link}
          <GeoSpline {link} class="stroke-gray-500/30 stroke-2" />
          <GeoSpline {link} class="stroke-danger stroke-2" loft={1.3} />
          <GeoPoint lat={link.source[1]} long={link.source[0]} r={2} />
          <GeoPoint lat={link.target[1]} long={link.target[0]} r={2} />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Draggable globe with EdgeFade</h2>

<div class="grid grid-cols-[auto,1fr] gap-2 my-2">
  <Field label="Debug" let:id>
    <Switch bind:checked={debug} {id} />
  </Field>
</div>

<Preview data={countries}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoOrthographic,
        _fitGeojson: countries,
        rotate: {
          yaw,
          pitch,
          roll,
        },
        _scale: scale,
        translate: translate,
      }}
      let:projection
    >
      {#if debug}
        <GeoDebug class="absolute top-0 left-0 z-10" />
      {/if}
      <Svg>
        <Zoom
          mode="manual"
          _initialScale={projection.scale()}
          _initialTranslate={{ x: projection.translate()[0], y: projection.translate()[1] }}
          bind:this={zoom}
          scroll="none"
          tweened={{ duration: 800, easing: cubicOut }}
          let:zoomTo
          let:reset={resetZoom}
          on:zoom={(e) => {
            //scale = e.detail.scale;
            const scale = 250;
            yaw = e.detail.translate.x * (sensitivity / scale);
            pitch = -e.detail.translate.y * (sensitivity / scale);
          }}
        >
          <GeoPath
            geojson={{ type: 'Sphere' }}
            class="fill-blue-400/50"
            on:click={() => (yaw += 1)}
          />
          <Graticule class="stroke-surface-content/20 pointer-events-none" />
          {#each countries.features as country}
            <GeoPath
              geojson={country}
              class="stroke-surface-content/50 fill-white pointer-events-none"
            />
          {/each}
          {#each links as link}
            <GeoEdgeFade {link}>
              <GeoPoint lat={link.source[1]} long={link.source[0]} r={2} />
              <GeoPoint lat={link.target[1]} long={link.target[0]} r={2} />
              <GeoSpline {link} class="stroke-gray-500/30 stroke-2" />
              <GeoSpline {link} class="stroke-danger stroke-2" loft={1.3} />
            </GeoEdgeFade>
          {/each}
        </Zoom>
      </Svg>
    </Chart>
  </div>
</Preview>
