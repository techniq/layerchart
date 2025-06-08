<script lang="ts">
  import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Chart, ChartClipPath, GeoPath, Layer, Tooltip } from 'layerchart';
  import { SelectField } from 'svelte-ux';
  import { sort } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const counties = feature(data.geojson, data.geojson.objects.counties);
  const states = feature(data.geojson, data.geojson.objects.states);

  const stateOptions = sort(
    states.features
      .filter((x) => Number(x.id) < 60)
      .map((x) => ({ label: x.properties.name, value: x.id })),
    (d) => d.value
  );
  let selectedStateId = $state('54'); // 'West Virginia';
  const selectedStateFeature = $derived(states.features.find((f) => f.id === selectedStateId));
  const selectedCountiesFeatures = $derived(
    counties.features.filter((f) => String(f.id).slice(0, 2) === selectedStateId)
  );

  let projection = $state(geoAlbersUsa);
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Mercator', value: geoMercator },
  ];
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">
  <SelectField
    label="State"
    options={stateOptions}
    bind:value={selectedStateId}
    clearable={false}
    toggleIcon={null}
    stepper
  />
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
</div>

<h1>Examples</h1>

<h2>State only</h2>

<Preview data={selectedStateFeature}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection,
        fitGeojson: selectedStateFeature,
      }}
    >
      <Layer type={shared.renderContext}>
        <GeoPath geojson={selectedStateFeature} class="stroke-surface-content" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>State with counties</h2>

<Preview data={selectedStateFeature}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection,
        fitGeojson: selectedStateFeature,
      }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          {#each selectedCountiesFeatures as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20"
              tooltipContext={context.tooltip}
            />
          {/each}
          <GeoPath
            geojson={selectedStateFeature}
            class="fill-none stroke-surface-content pointer-events-none"
          />
        </Layer>

        <Tooltip.Root>
          {context.tooltip.data?.properties.name}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>State with surrounding states (via ChartClipPath)</h2>

<Preview data={selectedStateFeature}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection,
        fitGeojson: selectedStateFeature,
      }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <ChartClipPath>
            {#each counties.features as feature}
              <GeoPath
                geojson={feature}
                class="fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20"
                tooltipContext={context.tooltip}
              />
            {/each}
            {#each states.features as feature}
              <GeoPath
                geojson={feature}
                class="fill-none pointer-events-none stroke-surface-content/10"
              />
            {/each}
            <GeoPath
              geojson={selectedStateFeature}
              class="fill-none stroke-surface-content pointer-events-none"
            />
          </ChartClipPath>
        </Layer>

        <Tooltip.Root>
          {context.tooltip.data?.properties.name}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
