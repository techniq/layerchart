<script lang="ts">
  import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
  import { sort } from 'd3-array';
  import { feature } from 'topojson-client';

  import { Field } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import ChartClipPath from '$lib/components/ChartClipPath.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';

  export let data;

  const counties = feature(data.geojson, data.geojson.objects.counties);
  const states = feature(data.geojson, data.geojson.objects.states);

  const stateOptions = sort(
    states.features
      .filter((x) => Number(x.id) < 60)
      .map((x) => ({ name: x.properties.name, value: x.id })),
    (d) => d.value
  );
  let selectedStateId = '54'; // 'West Virginia';
  $: selectedStateFeature = states.features.find((f) => f.id === selectedStateId);
  $: selectedCountiesFeatures = counties.features.filter(
    (f) => f.id.slice(0, 2) === selectedStateId
  );

  let projection = geoAlbersUsa;
  const projections = [
    { name: 'Albers', value: geoAlbers },
    { name: 'Albers USA', value: geoAlbersUsa },
    { name: 'Mercator', value: geoMercator },
  ];
</script>

<div class="grid grid-cols-[1fr,1fr,1fr] gap-2 my-2">
  <Field label="State" let:id>
    <select bind:value={selectedStateId} class="w-full outline-none appearance-none text-sm" {id}>
      {#each stateOptions as option}
        <option value={option.value}>{option.name}</option>
      {/each}
    </select>
  </Field>
  <Field label="Projections" let:id>
    <select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
      {#each projections as option}
        <option value={option.value}>{option.name}</option>
      {/each}
    </select>
  </Field>
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
      tooltip={{ mode: 'manual' }}
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
      <Tooltip header={(data) => data.properties.name} />
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
      tooltip={{ mode: 'manual' }}
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
      <Tooltip header={(data) => data.properties.name} />
    </Chart>
  </div>
</Preview>
