<script lang="ts">
  import { spring } from 'svelte/motion';
  import { geoOrthographic, geoCentroid } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Button, scrollIntoView, cls } from 'svelte-ux';
  import { createPropertySortFunc } from 'svelte-ux/utils/sort';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';

  export let data;

  const countries = feature(data.geojson, data.geojson.objects.countries);

  const springOptions = { stiffness: 0.04 };
  const yaw = spring(0, springOptions);
  const pitch = spring(0, springOptions);
  const roll = spring(0, springOptions);

  let selectedFeature;
  $: if (selectedFeature) {
    const centroid = geoCentroid(selectedFeature);
    $yaw = -centroid[0];
    $pitch = -centroid[1];
  }

  // TODO: Animate to Yakko's song
  // https://animaniacs.fandom.com/wiki/Yakko%27s_World_(song)#New_Updated_Verse
  // https://www.youtube.com/watch?v=BoaLSUKeGWw
  // https://www.youtube.com/watch?v=5pOFKmk7ytU
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview>
  <div class="h-[600px] grid grid-cols-[224px,1fr]">
    <div class="overflow-auto scrollbar-none">
      {#each countries.features.sort(createPropertySortFunc('properties.name')) as country}
        {@const isSelected = selectedFeature === country}
        <div use:scrollIntoView={{ condition: isSelected }}>
          <Button
            variant={isSelected ? 'fill-light' : 'default'}
            color={isSelected ? 'red' : 'default'}
            fullWidth
            on:click={() => (selectedFeature = country)}
          >
            {country.properties.name}
          </Button>
        </div>
      {/each}
    </div>
    <Chart
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        rotate: {
          yaw: $yaw,
          pitch: $pitch,
          roll: $roll,
        },
      }}
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-300" />
        <Graticule class="stroke-black/20" />
        {#each countries.features as country}
          <GeoPath
            geojson={country}
            class={cls(
              'fill-white',
              selectedFeature === country ? 'fill-red-400' : 'hover:fill-gray-200'
            )}
            on:click={(e) => (selectedFeature = country)}
          />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview>
  <div class="h-[600px] grid grid-cols-[224px,1fr]">
    <div class="overflow-auto">
      {#each countries.features.sort(createPropertySortFunc('properties.name')) as country}
        {@const isSelected = selectedFeature === country}
        <div use:scrollIntoView={{ condition: isSelected }}>
          <Button
            variant={isSelected ? 'fill-light' : 'default'}
            color={isSelected ? 'red' : 'default'}
            fullWidth
            on:click={() => (selectedFeature = country)}
          >
            {country.properties.name}
          </Button>
        </div>
      {/each}
    </div>
    <Chart
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        rotate: {
          yaw: $yaw,
          pitch: $pitch,
          roll: $roll,
        },
      }}
    >
      <Canvas>
        <GeoPath geojson={{ type: 'Sphere' }} fill="#93c5fd" />
      </Canvas>
      <Canvas>
        <Graticule stroke="rgba(0,0,0,.20)" />
      </Canvas>
      <Canvas>
        <GeoPath geojson={countries} fill="white" />
      </Canvas>
    </Chart>
  </div>
</Preview>
