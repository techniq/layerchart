<script lang="ts">
  import { geoOrthographic, geoCentroid } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { index } from 'd3-array';

  import { mdiPlay, mdiStop } from '@mdi/js';

  import {
    Canvas,
    Chart,
    GeoPath,
    Graticule,
    HitCanvas,
    Tooltip,
    TransformContext,
    Svg,
    renderPathData,
  } from 'layerchart';
  import { Button, ButtonGroup } from 'svelte-ux';
  import { sortFunc } from '@layerstack/utils';
  import { scrollIntoView } from '@layerstack/svelte-actions';
  import { cls } from '@layerstack/tailwind';
  import { timerStore } from '@layerstack/svelte-stores';

  import Preview from '$lib/docs/Preview.svelte';
  import GeoDebug from '$lib/docs/GeoDebug.svelte';
  import TransformDebug from '$lib/docs/TransformDebug.svelte';

  import { timings } from './timings.js';

  export let data;

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let transformContext: TransformContext;
  let transformContext2: TransformContext; // second instance for canvas example

  let selectedFeature: (typeof countries.features)[0] | null;
  $: if (selectedFeature) {
    const centroid = geoCentroid(selectedFeature);

    transformContext.setTranslate({
      x: -centroid[0],
      y: -centroid[1],
    });

    transformContext2.setTranslate({
      x: -centroid[0],
      y: -centroid[1],
    });
  }

  // Animate to Yakko's song
  // https://animaniacs.fandom.com/wiki/Yakko%27s_World_(song)#New_Updated_Verse
  // https://www.youtube.com/watch?v=BoaLSUKeGWw
  // https://www.youtube.com/watch?v=5pOFKmk7ytU

  const countryFeaturesByName = index(countries.features, (f) => f.properties.name);

  const countryTimings = Object.entries(timings).map(([timing, country], index) => {
    const [hours, minutes, seconds, milli] = timing.split(':');

    return {
      country,
      audioTime: +hours * 60 * 60 + +minutes * 60 + +seconds + +milli / 1000,
    };
  });

  // Set to jump to a country
  let currentIndex = -1;
  let isPlaying = false;

  $: if (isPlaying && ($audioCurrentTime ?? 0) >= countryTimings[currentIndex + 1]?.audioTime) {
    const countryName = countryTimings[currentIndex + 1].country;
    selectedFeature = countryFeaturesByName.get(countryName) ?? null;
    currentIndex += 1;
  }

  const audioFile = new Audio('/audio/yakko_world.mp3');
  audioFile.addEventListener('ended', () => stop());

  const audioCurrentTime = timerStore({
    initial: 0,
    delay: 100,
    onTick: () => audioFile.currentTime,
  });

  async function play() {
    isPlaying = true;
    audioFile.currentTime = currentIndex !== -1 ? countryTimings[currentIndex].audioTime : 0;
    audioFile.play();
  }

  function stop() {
    isPlaying = false;
    audioFile.pause();
    audioFile.currentTime = 0;
    currentIndex = -1;
    selectedFeature = null;
  }

  let debug = false;
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={countries}>
  <div class="h-[600px] grid grid-cols-[224px,1fr] relative">
    <div class="absolute top-0 right-0 z-10 flex items-center gap-3">
      {#if isPlaying && selectedFeature}
        <span class="text-sm px-2 py-1 font-semibold text-primary bg-primary/5 rounded-full">
          {selectedFeature?.properties.name ?? ''}
        </span>
      {/if}
      <ButtonGroup variant="fill-light" color="primary" size="sm">
        <Button icon={mdiPlay} on:click={play} disabled={isPlaying} />
        <Button icon={mdiStop} on:click={stop} disabled={!isPlaying} />
      </ButtonGroup>
    </div>

    <div class="overflow-auto scrollbar-none">
      {#each countries.features.sort(sortFunc('properties.name')) as country}
        {@const isSelected = selectedFeature === country}
        <div use:scrollIntoView={{ condition: isSelected }}>
          <Button
            variant={isSelected ? 'fill-light' : 'default'}
            color={isSelected ? 'primary' : 'default'}
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
        applyTransform: ['rotate'],
      }}
      transform={{
        spring: { stiffness: 0.04 },
      }}
      bind:transformContext
      let:tooltip
    >
      {#if debug}
        <div class="absolute bottom-0 right-0 z-10 grid gap-1">
          <GeoDebug />
          <TransformDebug />
        </div>
      {/if}

      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
        <Graticule class="stroke-surface-content/20" />

        {#each countries.features as country}
          <GeoPath
            geojson={country}
            class={cls(
              'stroke-surface-content/50 fill-white cursor-pointer',
              selectedFeature === country
                ? 'stroke-primary-900 fill-primary'
                : 'hover:fill-gray-200'
            )}
            on:click={(e) => (selectedFeature = country)}
            {tooltip}
          />
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        {data.properties.name}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={countries}>
  <div class="h-[600px] grid grid-cols-[224px,1fr] relative">
    <div class="absolute top-0 right-0 z-10 flex items-center gap-3">
      {#if isPlaying && selectedFeature}
        <span class="text-sm px-2 py-1 font-semibold text-primary bg-primary/5 rounded-full">
          {selectedFeature?.properties.name ?? ''}
        </span>
      {/if}
      <ButtonGroup variant="fill-light" color="primary" size="sm">
        <Button icon={mdiPlay} on:click={play} disabled={isPlaying} />
        <Button icon={mdiStop} on:click={stop} disabled={!isPlaying} />
      </ButtonGroup>
    </div>

    <div class="overflow-auto scrollbar-none">
      {#each countries.features.sort(sortFunc('properties.name')) as country}
        {@const isSelected = selectedFeature === country}
        <div use:scrollIntoView={{ condition: isSelected }}>
          <Button
            variant={isSelected ? 'fill-light' : 'default'}
            color={isSelected ? 'primary' : 'default'}
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
        applyTransform: ['rotate'],
      }}
      transform={{ spring: { stiffness: 0.04 } }}
      bind:transformContext={transformContext2}
      let:tooltip
    >
      <Canvas>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
        <Graticule class="stroke-surface-content/20" />
        <GeoPath geojson={countries} class="stroke-surface-content/50 fill-white" />
        <GeoPath geojson={selectedFeature} class="stroke-primary-900 fill-primary" />
      </Canvas>

      <!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
      <Canvas>
        {#if tooltip.data}
          <GeoPath geojson={tooltip.data} class="fill-surface-content/20" />
        {/if}
      </Canvas>

      <HitCanvas
        let:nextColor
        let:setColorData
        on:pointermove={(e) => tooltip.show(e.detail.event, e.detail.data)}
        on:pointerleave={tooltip.hide}
        on:click={(e) => {
          selectedFeature = e.detail.data;
        }}
      >
        <GeoPath
          render={(ctx, { newGeoPath }) => {
            for (var feature of countries.features) {
              const color = nextColor();

              const geoPath = newGeoPath();
              // Stroking shape seems to help with dark border, but there is still antialising and thus gaps
              renderPathData(ctx, geoPath(feature), { styles: { fill: color, stroke: color } });

              setColorData(color, feature);
            }
          }}
        />
      </HitCanvas>

      <Tooltip.Root let:data>
        {data.properties.name}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
