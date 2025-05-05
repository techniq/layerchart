<script lang="ts">
  import { index } from 'd3-array';
  import { scaleQuantile } from 'd3-scale';
  import { schemeBlues } from 'd3-scale-chromatic';
  import { geoIdentity, type GeoProjection } from 'd3-geo';
  import { feature, transform } from 'topojson-client';
  import { format } from '@layerstack/utils';

  import { Canvas, Chart, GeoPath, Legend, Svg, Tooltip } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();
  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);

  const projection = geoIdentity as unknown as () => GeoProjection;

  const statesById = index(states.features, (d) => d.id);

  const population = data.population.map((d) => {
    return {
      id: d.state + d.county,
      state: statesById.get(d.state)?.properties.name,
      population: +d.DP05_0001E,
      populationUnder18: +d.DP05_0019E,
      percentUnder18: +d.DP05_0019PE,
    };
  });

  const populationByFips = index(population, (d) => d.id);

  const enrichedCountiesFeatures = $derived(
    counties.features.map((feature) => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          data: populationByFips.get(feature.id as string),
        },
      };
    })
  );

  const colorScale = $derived(
    scaleQuantile<string, string>()
      .domain(population.map((d) => d.population))
      .range(schemeBlues[9])
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
      tooltip={{ raiseTarget: true }}
    >
      {#snippet children({ context })}
        {@const strokeWidth = 1 / context.transform.scale}
        <TransformControls />

        <Svg>
          <g>
            {#each enrichedCountiesFeatures as feature}
              <GeoPath
                geojson={feature}
                fill={colorScale(feature.properties.data?.population ?? 0)}
                class="stroke-none hover:stroke-white"
                {strokeWidth}
                tooltipContext={context.tooltip}
              />
            {/each}
          </g>
          <GeoPath
            geojson={states}
            class="fill-none stroke-black/30 pointer-events-none"
            {strokeWidth}
          />
        </Svg>

        <Legend
          scale={colorScale}
          title="Population"
          tickFormat={(d) => format(d, 'metric', { maximumSignificantDigits: 2 })}
          class="absolute bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1"
        />

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const d = populationByFips.get(data.id)}
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
                value={d?.percentUnder18 ?? 0 / 100}
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
          {#each enrichedCountiesFeatures as feature}
            <GeoPath
              geojson={feature}
              fill={colorScale(feature.properties.data?.population ?? 0)}
              {strokeWidth}
              class="stroke-none"
              tooltipContext={context.tooltip}
            />
          {/each}
        </Canvas>

        <Canvas pointerEvents={false}>
          <GeoPath geojson={states} class="stroke-black/30" {strokeWidth} />
        </Canvas>

        <Canvas pointerEvents={false}>
          {#if context.tooltip.data}
            <GeoPath geojson={context.tooltip.data} class="stroke-white" {strokeWidth} />
          {/if}
        </Canvas>

        <Legend
          scale={colorScale}
          title="Population"
          tickFormat={(d) => format(d, 'metric', { maximumSignificantDigits: 2 })}
          placement="top-left"
          class="absolute bg-surface-100/80 px-2 py-1 backdrop-blur-xs rounded-sm m-1"
        />

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const d = populationByFips.get(data.id)}
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
                value={d?.percentUnder18 ?? 0 / 100}
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
