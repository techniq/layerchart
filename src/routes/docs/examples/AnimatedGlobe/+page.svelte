<script lang="ts">
  import { spring } from 'svelte/motion';
  import { geoOrthographic, geoCentroid } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { index } from 'd3-array';

  import { mdiPlay, mdiStop } from '@mdi/js';

  import {
    Button,
    scrollIntoView,
    cls,
    sortFunc,
    ButtonGroup,
    timerStore,
    Duration,
  } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { timings } from './song.js';

  export let data;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

  const audioFile = new Audio('/audio/yakko_world.mp3');
  const audioCurrentTime = timerStore({ initial: 0, onTick: () => audioFile.currentTime });

  const countryFeaturesByName = index(countries.features, (f) => f.properties.name);

  const skipIntro = true;
  let isPlaying = false;

  async function play() {
    isPlaying = true;
    audioFile.currentTime = skipIntro ? 10 : 0;
    audioFile.play();

    for (const timing of timings) {
      if (skipIntro) {
        delay(10000);
      }

      await delay(timing.delay);

      if (!isPlaying) {
        return;
      }
      selectedFeature = countryFeaturesByName.get(timing.name);
    }
  }

  function stop() {
    isPlaying = false;
    audioFile.pause();
    audioFile.currentTime = 0;
    selectedFeature = null;
  }
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={countries}>
  <div class="h-[600px] grid grid-cols-[224px,1fr] relative">
    <div class="absolute top-0 left-0 bg-gray-100 w-full text-lg font-semibold">
      {selectedFeature?.properties.name ?? ''}
    </div>

    <div class="absolute top-0 right-0 z-10 flex items-center gap-3">
      <!-- <Duration duration={{ seconds: $audioCurrentTime }} class="text-sm text-black/50" /> -->
      <ButtonGroup variant="fill-light" color="blue" size="sm">
        <Button icon={mdiPlay} on:click={play} />
        <Button icon={mdiStop} on:click={stop} />
      </ButtonGroup>
    </div>

    <div class="overflow-auto scrollbar-none">
      {#each countries.features.sort(sortFunc('properties.name')) as country}
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
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-300" />
        <Graticule class="stroke-black/20" />
        {#each countries.features as country}
          <GeoPath
            geojson={country}
            class={cls(
              'fill-white cursor-pointer',
              selectedFeature === country ? 'fill-red-400' : 'hover:fill-gray-200'
            )}
            on:click={(e) => (selectedFeature = country)}
            {tooltip}
          />
        {/each}
      </Svg>

      <Tooltip>
        <div slot="header" let:data>{data.properties.name}</div>
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={countries}>
  <div class="h-[600px] grid grid-cols-[224px,1fr] relative">
    <div class="absolute top-0 left-0 bg-gray-100 w-full text-lg font-semibold">
      {selectedFeature?.properties.name ?? ''}
    </div>

    <div class="absolute top-0 right-0 z-10 flex items-center gap-3">
      <!-- <Duration duration={{ seconds: $audioCurrentTime }} class="text-sm text-black/50" /> -->
      <ButtonGroup variant="fill-light" color="blue" size="sm">
        <Button icon={mdiPlay} on:click={play} />
        <Button icon={mdiStop} on:click={stop} />
      </ButtonGroup>
    </div>

    <div class="overflow-auto scrollbar-none">
      {#each countries.features.sort(sortFunc('properties.name')) as country}
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
      <Canvas>
        <GeoPath geojson={selectedFeature} fill="#f87171" />
      </Canvas>
    </Chart>
  </div>
</Preview>
