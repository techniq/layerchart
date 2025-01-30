<script lang="ts">
  import { index, max, descending } from 'd3-array';
  import { geoIdentity, type GeoProjection } from 'd3-geo';
  import { scaleLinear } from 'd3-scale';
  import { feature } from 'topojson-client';

  import { Canvas, Chart, GeoPath, spikePath, Spline, Svg, Tooltip } from 'layerchart';
  import TransformControls from 'layerchart/components/TransformControls.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const projection = geoIdentity as unknown as () => GeoProjection;

  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);

  const statesById = index(states.features, (d) => d.id);

  const population = data.population.map((d) => {
    return {
      fips: d.state + d.county,
      state: statesById.get(d.state)?.properties.name,
      population: +d.DP05_0001E,
      populationUnder18: +d.DP05_0019E,
      percentUnder18: +d.DP05_0019PE,
    };
  });
  const populationByFips = index(population, (d) => d.fips);

  const width = 7;
  const maxHeight = 200;
  $: heightScale = scaleLinear()
    .domain([0, max(population, (d) => d.population) ?? 0])
    .range([0, maxHeight]);

  $: enrichedCountiesFeatures = counties.features
    .map((feature) => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          data: populationByFips.get(feature.id as string),
        },
      };
    })
    .sort((a, b) => descending(a.properties.data?.population, b.properties.data?.population));
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: states,
      }}
      transform={{
        mode: 'canvas',
        initialScrollMode: 'scale',
      }}
      let:tooltip
      let:transform
    >
      {@const strokeWidth = 1 / transform.scale}

      <TransformControls />

      <Svg>
        <GeoPath
          geojson={states}
          class="fill-surface-content/10 stroke-surface-100"
          {strokeWidth}
        />

        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} {strokeWidth} let:geoPath>
            {@const [x, y] = geoPath.centroid(feature)}
            {@const d = feature.properties.data}
            {@const height = heightScale(d?.population ?? 0)}
            <path
              d={spikePath({ x, y, width, height })}
              class="stroke-danger fill-danger/25"
              stroke-width={strokeWidth}
            />
          </GeoPath>
        {/each}

        {#each enrichedCountiesFeatures as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            class="stroke-none hover:fill-surface-content/10"
            {strokeWidth}
          />
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        {@const d = data.properties.data}
        <Tooltip.Header>{data.properties.name + ' - ' + data.properties.data?.state}</Tooltip.Header
        >
        <Tooltip.List>
          <Tooltip.Item
            label="Total Population"
            value={d?.population}
            format="integer"
            valueAlign="right"
          />
          <Tooltip.Item
            label="Est. Population under 18"
            value={d?.populationUnder18}
            format="integer"
            valueAlign="right"
          />
          <Tooltip.Item
            label="Est. Percent under 18"
            value={d?.percentUnder18 / 100}
            format="percentRound"
            valueAlign="right"
          />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={states}>
  <div class="h-[600px] mt-10">
    <Chart
      geo={{
        projection,
        fitGeojson: states,
      }}
      transform={{
        mode: 'canvas',
        initialScrollMode: 'scale',
      }}
      let:tooltip
      let:transform
    >
      {@const strokeWidth = 1 / transform.scale}
      <TransformControls />

      <Canvas>
        <GeoPath
          geojson={states}
          class="fill-surface-content/10 stroke-surface-100"
          {strokeWidth}
        />

        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} {strokeWidth} {tooltip} let:geoPath>
            {@const [x, y] = geoPath.centroid(feature)}
            {@const d = feature.properties.data}
            {@const height = heightScale(d?.population ?? 0)}
            <Spline
              pathData={spikePath({ x, y, width, height })}
              class="stroke-danger fill-danger/25"
              {strokeWidth}
            />
          </GeoPath>
        {/each}
      </Canvas>

      <Canvas pointerEvents={false}>
        {#if tooltip.data}
          <GeoPath
            geojson={tooltip.data}
            class="stroke-none fill-surface-content/10"
            {strokeWidth}
          />
        {/if}
      </Canvas>

      <Tooltip.Root let:data>
        {@const d = data.properties.data}
        <Tooltip.Header>{data.properties.name + ' - ' + data.properties.data?.state}</Tooltip.Header
        >
        <Tooltip.List>
          <Tooltip.Item
            label="Total Population"
            value={d?.population}
            format="integer"
            valueAlign="right"
          />
          <Tooltip.Item
            label="Est. Population under 18"
            value={d?.populationUnder18}
            format="integer"
            valueAlign="right"
          />
          <Tooltip.Item
            label="Est. Percent under 18"
            value={d?.percentUnder18 / 100}
            format="percentRound"
            valueAlign="right"
          />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
