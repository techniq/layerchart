<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Field, SelectField, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import TransformControls from '$lib/docs/TransformControls.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import Transform from '$lib/components/Transform.svelte';

  export let data;

  let projection = geoAlbersUsa;
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Mercator', value: geoMercator },
  ];

  const counties = feature(data.geojson, data.geojson.objects.counties);
  const states = feature(data.geojson, data.geojson.objects.states);

  function filterNonStates(features) {
    return features.filter((x) => Number(x.id) < 60);
  }

  let selectedStateId = null;
  $: selectedCountiesFeatures = selectedStateId
    ? counties.features.filter((f) => f.id.slice(0, 2) === selectedStateId)
    : [];

  let transform: Transform;
  let scrollMode = 'scale';
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
  <Field label="Scroll mode" let:id>
    <ToggleGroup bind:value={scrollMode} variant="outline" size="sm" inset class="w-full">
      <ToggleOption value="none">None</ToggleOption>
      <ToggleOption value="scale">Scale</ToggleOption>
      <ToggleOption value="translate">Translate</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px] relative overflow-hidden">
    <TransformControls {transform} />
    <Chart
      geo={{
        projection,
        fitGeojson: states,
      }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        <Transform
          bind:this={transform}
          scroll={scrollMode}
          tweened={{ duration: 800, easing: cubicOut }}
          let:zoomTo
          let:reset={resetZoom}
          let:scale
        >
          {#each filterNonStates(states.features) as feature}
            <GeoPath
              geojson={feature}
              class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
              stroke-width={1 / scale}
              {tooltip}
              on:click={(e) => {
                const { geoPath, event } = e.detail;
                let [[left, top], [right, bottom]] = geoPath.bounds(feature);
                if (selectedStateId === feature.id) {
                  selectedStateId = null;
                  resetZoom();
                } else {
                  selectedStateId = feature.id;
                  let width = right - left;
                  let height = bottom - top;
                  let x = (left + right) / 2;
                  let y = (top + bottom) / 2;
                  const padding = 20;
                  zoomTo({ x, y }, { width: width + padding, height: height + padding });
                }
              }}
            />
          {/each}

          {#each selectedCountiesFeatures as feature (feature.id)}
            <g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}>
              <GeoPath
                geojson={feature}
                {tooltip}
                stroke-width={1 / scale}
                class="stroke-surface-content/10 hover:fill-surface-content/10"
                on:click={() => {
                  selectedStateId = null;
                  resetZoom();
                }}
              />
            </g>
          {/each}
        </Transform>
      </Svg>
      <Tooltip header={(data) => data.properties.name} />
    </Chart>
  </div>
</Preview>
