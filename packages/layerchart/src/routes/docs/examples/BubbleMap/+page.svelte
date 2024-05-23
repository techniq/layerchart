<script lang="ts">
  import { index, max, descending } from 'd3-array';
  import { geoIdentity } from 'd3-geo';
  import { scaleSqrt, scaleThreshold } from 'd3-scale';
  import { interpolateViridis } from 'd3-scale-chromatic';
  import { quantize } from 'd3-interpolate';
  import { feature } from 'topojson-client';
  import { sortFunc } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import HitCanvas from '$lib/components/HitCanvas.svelte';
  import Legend from '$lib/components/Legend.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);

  const statesById = index(states.features, (d) => d.id);

  const population = data.population.map((d) => {
    return {
      fips: d.state + d.county,
      state: statesById.get(d.state).properties.name,
      population: +d.DP05_0001E,
      populationUnder18: +d.DP05_0019E,
      percentUnder18: +d.DP05_0019PE,
    };
  });
  const populationByFips = index(population, (d) => d.fips);

  const maxRadius = 40;
  $: rScale = scaleSqrt()
    .domain([0, max(population, (d) => d.population)])
    .range([0, maxRadius]);

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
          data: populationByFips.get(feature.id),
        },
      };
    })
    .sort(sortFunc('properties.data.population', 'desc'));
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states,
      }}
      padding={{ top: 60 }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        {#each states.features as feature}
          <GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
        {/each}
        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} let:geoPath>
            {@const [cx, cy] = geoPath.centroid(feature)}
            {@const d = feature.properties.data}
            <circle
              {cx}
              {cy}
              r={rScale(d?.population)}
              fill={colorScale(d?.percentUnder18)}
              fill-opacity={0.5}
              stroke={colorScale(d?.percentUnder18)}
              stroke-width={0.5}
              class="pointer-events-none"
            />
          </GeoPath>
        {/each}
        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} {tooltip} class="stroke-none hover:fill-surface-content/10" />
        {/each}
      </Svg>

      <Legend scale={colorScale} title="Est. Percent under 18" placement="top-left" />

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

<Preview data={states}>
  <div class="h-[600px] mt-10">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states,
      }}
      padding={{ top: 60 }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Canvas>
        <GeoPath geojson={states} class="fill-surface-content/10 stroke-surface-100" />
      </Canvas>

      <Canvas>
        <GeoPath
          render={(ctx, { geoPath }) => {
            for (var feature of enrichedCountiesFeatures) {
              const [x, y] = geoPath.centroid(feature);
              const d = feature.properties.data;
              const radius = rScale(d?.population);
              const color = colorScale(d?.percentUnder18);
              ctx.strokeStyle = color;
              ctx.fillStyle = color + (256 * 0.5).toString(16);
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
              ctx.fill();
              ctx.stroke();
            }
          }}
        />
      </Canvas>

      {#if tooltip.data}
        <Canvas>
          <GeoPath geojson={tooltip.data} class="stroke-none fill-surface-content/10" />
        </Canvas>
      {/if}

      <HitCanvas
        let:nextColor
        let:setColorData
        on:pointermove={(e) => tooltip.show(e.detail.event, e.detail.data)}
        on:pointerleave={tooltip.hide}
      >
        <GeoPath
          render={(ctx, { geoPath }) => {
            for (var feature of enrichedCountiesFeatures) {
              const color = nextColor();

              ctx.beginPath();
              geoPath(feature);
              ctx.fillStyle = color;
              ctx.fill();

              setColorData(color, feature);
            }
          }}
        />
      </HitCanvas>

      <Legend scale={colorScale} title="Est. Percent under 18" placement="top-left" />

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
