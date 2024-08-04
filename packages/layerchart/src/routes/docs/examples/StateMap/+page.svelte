<script lang="ts">
  import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Chart, ChartClipPath, GeoPath, Svg, Tooltip } from 'layerchart';
  import { SelectField, sort } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const counties = feature(data.geojson, data.geojson.objects.counties);
  const states = feature(data.geojson, data.geojson.objects.states);

  const stateOptions = sort(
    states.features
      .filter((x) => Number(x.id) < 60)
      .map((x) => ({ label: x.properties.name, value: x.id })),
    (d) => d.value
  );
  let selectedStateId = '54'; // 'West Virginia';
  $: selectedStateFeature = states.features.find((f) => f.id === selectedStateId);
  $: selectedCountiesFeatures = counties.features.filter(
    (f) => String(f.id).slice(0, 2) === selectedStateId
  );

  let projection = geoAlbersUsa;
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Mercator', value: geoMercator },
  ];
</script>

<div class="grid grid-cols-[1fr,1fr,1fr] gap-2 my-2">
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
      <Svg>
        <GeoPath geojson={selectedStateFeature} class="stroke-surface-content" />
      </Svg>
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
      let:tooltip
    >
      <Svg>
        {#each selectedCountiesFeatures as feature}
          <GeoPath
            geojson={feature}
            class="fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20"
            {tooltip}
          />
        {/each}
        <GeoPath
          geojson={selectedStateFeature}
          class="fill-none stroke-surface-content pointer-events-none"
        />
      </Svg>

      <Tooltip.Root let:data>
        {data.properites.name}
      </Tooltip.Root>
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
      let:tooltip
    >
      <Svg>
        <ChartClipPath>
          {#each counties.features as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20"
              {tooltip}
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
      </Svg>

      <Tooltip.Root let:data>
        {data.properites.name}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
