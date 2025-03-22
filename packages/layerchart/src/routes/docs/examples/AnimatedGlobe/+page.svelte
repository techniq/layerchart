<script lang="ts">
  import { geoOrthographic, geoCentroid } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { index } from 'd3-array';

  import { mdiPlay, mdiStop } from '@mdi/js';

  import { Canvas, Chart, GeoPath, Graticule, Tooltip, TransformContext, Svg } from 'layerchart';
  import { Button, ButtonGroup, Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { sortFunc } from '@layerstack/utils';
  import { scrollIntoView } from '@layerstack/svelte-actions';
  import { cls } from '@layerstack/tailwind';
  import { timerStore } from '@layerstack/svelte-stores';

  import Preview from '$lib/docs/Preview.svelte';
  import GeoDebug from '$lib/docs/GeoDebug.svelte';
  import TransformDebug from '$lib/docs/TransformDebug.svelte';

  import { timings } from './timings.js';
  import type { Component } from 'svelte';

  let { data } = $props();

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let Context: Component = $state(Svg);
  let transformContext = $state<TransformContext>();

  let selectedFeature: (typeof countries.features)[0] | null = $state(null);

  $effect.pre(() => {
    if (selectedFeature && transformContext) {
      const centroid = geoCentroid(selectedFeature);

      transformContext.setTranslate({
        x: -centroid[0],
        y: -centroid[1],
      });
    }
  });

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
  let currentIndex = $state(-1);
  let isPlaying = $state(false);

  $effect(() => {
    if (isPlaying && ($audioCurrentTime ?? 0) >= countryTimings[currentIndex + 1]?.audioTime) {
      const countryName = countryTimings[currentIndex + 1].country;
      selectedFeature = countryFeaturesByName.get(countryName) ?? null;
      currentIndex += 1;
    }
  });

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

  let debug = $state(false);
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-3">
  <Field label="Render context">
    <ToggleGroup bind:value={Context} variant="outline">
      <ToggleOption value={Svg}>Svg</ToggleOption>
      <ToggleOption value={Canvas}>Canvas</ToggleOption>
    </ToggleGroup>
  </Field>

  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<Preview data={countries}>
  <div class="h-[600px] grid grid-cols-[224px_1fr] relative">
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
    >
      {#snippet children({ tooltipContext })}
        {#if debug}
          <div class="absolute bottom-0 right-0 z-10 grid gap-1">
            <GeoDebug />
            <TransformDebug />
          </div>
        {/if}

        <Context {debug}>
          <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
          <Graticule class="stroke-surface-content/20" />

          {#each countries.features as country}
            <GeoPath
              geojson={country}
              class={cls(
                'stroke-surface-content/50 fill-white cursor-pointer',
                selectedFeature === country
                  ? 'stroke-primary-900 fill-primary'
                  : 'hover:fill-gray-200' // Canvas highlight handled below
              )}
              onclick={() => (selectedFeature = country)}
              {tooltipContext}
            />
          {/each}
        </Context>

        {#if Context === Canvas}
          <!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
          <Canvas pointerEvents={false}>
            {#if tooltipContext.data}
              <GeoPath geojson={tooltipContext.data} class="fill-surface-content/20" />
            {/if}
          </Canvas>
        {/if}

        <Tooltip.Root>
          {tooltipContext.data.properties.name}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
