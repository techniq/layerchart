<script lang="ts">
  import { index, max } from 'd3-array';
  import { geoIdentity, type GeoProjection } from 'd3-geo';
  import { scaleSqrt, scaleThreshold } from 'd3-scale';
  import { interpolateViridis } from 'd3-scale-chromatic';
  import { quantize } from 'd3-interpolate';
  import { feature } from 'topojson-client';
  import { sortFunc } from '@layerstack/utils';

  import { Chart, Canvas, GeoPath, Legend, Svg, Tooltip, Circle } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);

  const projection = geoIdentity as unknown as () => GeoProjection;

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

  const maxRadius = 40;
  const rScale = $derived(
    scaleSqrt()
      .domain([0, max(population, (d) => d.population) ?? 0])
      .range([0, maxRadius])
  );

  const colors = $derived(quantize(interpolateViridis, 5));
  // $: colorScale = scaleQuantize()
  // 	.domain([0, max(population, d => d.percentUnder18)])
  // 	.range(colors)
  const colorScale = $derived(
    scaleThreshold<number, string>()
      .domain([16, 20, 24, 28, Math.ceil(max(population, (d) => d.percentUnder18) ?? 0)])
      .range(colors)
  );

  const enrichedCountiesFeatures = $derived(
    counties.features
      .map((feature) => {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            data: populationByFips.get(String(feature.id)),
          },
        };
      })
      .sort(sortFunc('properties.data.population', 'desc'))
  );
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
      padding={{ top: 60 }}
    >
      {#snippet children({ context })}
        {@const strokeWidth = 1 / context.transform.scale}
        <TransformControls />

        <Svg>
          <GeoPath
            geojson={states}
            class="fill-surface-content/10 stroke-surface-100"
            {strokeWidth}
          />

          {#each enrichedCountiesFeatures as feature}
            <GeoPath geojson={feature} {strokeWidth}>
              {#snippet children({ geoPath })}
                {@const [cx, cy] = geoPath?.centroid(feature) ?? []}
                {@const d = feature.properties.data}
                <Circle
                  {cx}
                  {cy}
                  r={rScale(d?.population ?? 0)}
                  fill={colorScale(d?.percentUnder18 ?? 0)}
                  fill-opacity={0.5}
                  stroke={colorScale(d?.percentUnder18 ?? 0)}
                  stroke-width={strokeWidth / 2}
                  class="pointer-events-none"
                />
              {/snippet}
            </GeoPath>
          {/each}

          {#each enrichedCountiesFeatures as feature}
            <GeoPath
              geojson={feature}
              tooltipContext={context.tooltip}
              class="stroke-none hover:fill-surface-content/10"
              {strokeWidth}
            />
          {/each}
        </Svg>

        <Legend
          scale={colorScale}
          title="Est. Percent under 18"
          placement="top-left"
          class="bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1"
        />

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const d = data.properties.data}
            <Tooltip.Header>
              {data.properties.name + ' - ' + data.properties.data?.state}
            </Tooltip.Header>
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
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection,
        fitGeojson: states,
      }}
      transform={{
        mode: 'canvas',
        initialScrollMode: 'scale',
      }}
      padding={{ top: 60 }}
    >
      {#snippet children({ context })}
        {@const strokeWidth = 1 / context.transform.scale}
        <TransformControls />

        <Canvas>
          <GeoPath
            geojson={states}
            class="fill-surface-content/10 stroke-surface-100"
            {strokeWidth}
          />

          {#each enrichedCountiesFeatures as feature}
            <GeoPath geojson={feature} {strokeWidth} tooltipContext={context.tooltip}>
              {#snippet children({ geoPath })}
                {@const [cx, cy] = geoPath?.centroid(feature) ?? []}
                {@const d = feature.properties.data}
                <Circle
                  {cx}
                  {cy}
                  r={rScale(d?.population ?? 0)}
                  fill={colorScale(d?.percentUnder18 ?? 0)}
                  fillOpacity={0.5}
                  stroke={colorScale(d?.percentUnder18 ?? 0)}
                  strokeWidth={strokeWidth / 2}
                />
              {/snippet}
            </GeoPath>
          {/each}
        </Canvas>

        <Canvas pointerEvents={false}>
          {#if context.tooltip.data}
            <GeoPath
              geojson={context.tooltip.data}
              class="stroke-none fill-surface-content/10"
              {strokeWidth}
            />
          {/if}
        </Canvas>

        <Legend
          scale={colorScale}
          title="Est. Percent under 18"
          placement="top-left"
          class="bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1"
        />

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const d = data.properties.data}
            <Tooltip.Header>
              {data.properties.name + ' - ' + data.properties.data?.state}
            </Tooltip.Header>
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
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
