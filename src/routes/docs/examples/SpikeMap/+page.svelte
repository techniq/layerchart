<script lang="ts">
  import { index, max, descending } from 'd3-array';
  import { geoIdentity } from 'd3-geo';
  import { scaleLinear, scaleThreshold } from 'd3-scale';
  import { interpolateViridis } from 'd3-scale-chromatic';
  import { quantize } from 'd3-interpolate';
  import { feature } from 'topojson-client';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Group from '$lib/components/Group.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import _population from '../_data/geo/us-county-population-2020.json';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);

  const statesById = index(states.features, (d) => d.id);

  const population = _population.map((d) => {
    return {
      fips: d.state + d.county,
      state: statesById.get(d.state).properties.name,
      population: +d.DP05_0001E,
      populationUnder18: +d.DP05_0019E,
      percentUnder18: +d.DP05_0019PE
    };
  });
  const populationByFips = index(population, (d) => d.fips);

  const width = 7;
  const maxHeight = 200;
  $: heightScale = scaleLinear()
    .domain([0, max(population, (d) => d.population)])
    .range([0, maxHeight]);

  $: colors = quantize(interpolateViridis, 5);
  // $: colorScale = scaleQuantize()
  // 	.domain([0, max(population, d => d.percentUnder18)])
  // 	.range(colors)
  $: colorScale = scaleThreshold()
    .domain([16, 20, 24, 28, Math.ceil(max(population, (d) => d.percentUnder18))])
    .range(colors);

  $: enrichedCountiesFeatures = counties.features
    .map((feature) => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          data: populationByFips.get(feature.id)
        }
      };
    })
    .sort((a, b) => descending(a.properties.data?.population, b.properties.data?.population));
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states
      }}
      let:projection
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        {#each states.features as feature}
          <GeoPath geojson={feature} class="fill-black/10 stroke-white" />
        {/each}
        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} let:geoPath>
            {@const [x, y] = geoPath.centroid(feature)}
            {@const d = feature.properties.data}
            {@const height = heightScale(d?.population)}
            <Group {x} {y}>
              <path
                d="M{-width / 2},0 L0,{-height} L{width / 2},0"
                class="stroke-red-500 fill-red-500/25"
              />
            </Group>
          </GeoPath>
        {/each}
        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} {tooltip} class="stroke-none hover:fill-black/10" />
        {/each}
      </Svg>
      <Tooltip
        header={(data) => data.properties.name + ' - ' + data.properties.data?.state}
        let:data
      >
        {@const d = data.properties.data}
        <TooltipItem
          label="Total Population"
          value={d?.population}
          format="integer"
          valueAlign="right"
        />
        <TooltipItem
          label="Est. Population under 18"
          value={d?.populationUnder18}
          format="integer"
          valueAlign="right"
        />
        <TooltipItem
          label="Est. Percent under 18"
          value={d?.percentUnder18 / 100}
          format="percentRound"
          valueAlign="right"
        />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview>
  <div class="h-[600px] mt-10">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states
      }}
    >
      <Canvas>
        <GeoPath geojson={states} fill="rgba(0,0,0,.1)" stroke="white" />
      </Canvas>
      <Canvas>
        <GeoPath
          geojson={feature}
          render={(ctx, { geoPath }) => {
            for (var feature of enrichedCountiesFeatures) {
              const [x, y] = geoPath.centroid(feature);
              const d = feature.properties.data;
              const height = heightScale(d?.population);
              const color = '#FF0000';
              const radius = 5;
              ctx.strokeStyle = color;
              ctx.fillStyle = '#FF0000' + (256 * 0.25).toString(16);
              ctx.beginPath();
              const startPoint = [x - width / 2, y];
              const midPoint = [x, y - height];
              const endPoint = [x + width / 2, y];
              ctx.moveTo(...startPoint);
              ctx.lineTo(...midPoint);
              ctx.lineTo(...endPoint);
              ctx.fill();
              ctx.stroke();
            }
          }}
        />
      </Canvas>
    </Chart>
  </div>
</Preview>
