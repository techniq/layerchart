<script lang="ts">
  import { index } from 'd3-array';
  import { scaleQuantile } from 'd3-scale';
  import { schemeBlues } from 'd3-scale-chromatic';
  import { geoIdentity } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { format as d3format } from 'd3-format';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Legend from '$lib/components/Legend.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import _population from '../_data/geo/us-county-population-2020.json';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);

  const statesById = index(states.features, (d) => d.id);

  const population = _population.map((d) => {
    return {
      id: d.state + d.county,
      state: statesById.get(d.state).properties.name,
      population: +d.DP05_0001E,
      populationUnder18: +d.DP05_0019E,
      percentUnder18: +d.DP05_0019PE,
    };
  });
  const populationByFips = index(population, (d) => d.id);

  $: enrichedCountiesFeatures = counties.features.map((feature) => {
    return {
      ...feature,
      properties: {
        ...feature.properties,
        data: populationByFips.get(feature.id),
      },
    };
  });

  $: colorScale = scaleQuantile()
    .domain(population.map((d) => d.population))
    .range(schemeBlues[9]);

  const format = d3format('.2s');
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
      tooltip={{ mode: 'manual', raiseTarget: true }}
      let:tooltip
    >
      <Svg>
        <g>
          {#each enrichedCountiesFeatures as feature}
            <GeoPath
              geojson={feature}
              {tooltip}
              fill={colorScale(feature.properties.data?.population)}
              class="stroke-none hover:stroke-white hover:stroke-2"
            />
          {/each}
        </g>
        <g>
          {#each states.features as feature}
            <GeoPath geojson={feature} class="fill-none stroke-black/30 pointer-events-none" />
          {/each}
        </g>
      </Svg>
      <Legend scale={colorScale} title="Population" tickFormat={format} />
      <Tooltip
        header={(data) => data.properties.name + ' - ' + data.properties.data?.state}
        let:data
      >
        {@const d = populationByFips.get(data.id)}
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
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states,
      }}
    >
      <!-- TODO: Determine how to support without bringing the browser to it's knees -->
      <!--
			{#each enrichedCountiesFeatures as feature}
				<Canvas>
					<GeoPath geojson={feature} stroke="transparent" fill={colorScale(feature.properties.data?.population)} />
				</Canvas>
			{/each}
			-->
      <Canvas>
        <GeoPath
          geojson={feature}
          render={(ctx, { geoPath }) => {
            for (var feature of enrichedCountiesFeatures) {
              ctx.beginPath();
              geoPath.context(ctx);
              geoPath(feature);
              ctx.fillStyle = colorScale(feature.properties.data?.population);
              ctx.fill();
            }
          }}
        />
      </Canvas>
      <Canvas>
        <GeoPath geojson={states} stroke="#0000004C" />
      </Canvas>
    </Chart>
  </div>
</Preview>
