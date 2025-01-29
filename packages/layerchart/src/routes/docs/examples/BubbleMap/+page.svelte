<script lang="ts">
  import { index, max } from 'd3-array';
  import { geoIdentity, type GeoProjection } from 'd3-geo';
  import { scaleSqrt, scaleThreshold } from 'd3-scale';
  import { interpolateViridis } from 'd3-scale-chromatic';
  import { quantize } from 'd3-interpolate';
  import { feature } from 'topojson-client';
  import { sortFunc } from '@layerstack/utils';

  import {
    Chart,
    Canvas,
    GeoPath,
    HitCanvas,
    Legend,
    Svg,
    Tooltip,
    renderPathData,
    circlePath,
  } from 'layerchart';
  import TransformControls from 'layerchart/components/TransformControls.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;
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
  $: rScale = scaleSqrt()
    .domain([0, max(population, (d) => d.population) ?? 0])
    .range([0, maxRadius]);

  $: colors = quantize(interpolateViridis, 5);
  // $: colorScale = scaleQuantize()
  // 	.domain([0, max(population, d => d.percentUnder18)])
  // 	.range(colors)
  $: colorScale = scaleThreshold<number, string>()
    .domain([16, 20, 24, 28, Math.ceil(max(population, (d) => d.percentUnder18) ?? 0)])
    .range(colors);

  $: enrichedCountiesFeatures = counties.features
    .map((feature) => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          data: populationByFips.get(String(feature.id)),
        },
      };
    })
    .sort(sortFunc('properties.data.population', 'desc'));
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
      let:tooltip
      let:transform
    >
      {@const strokeWidth = 1 / transform.scale}
      <TransformControls />

      <Svg>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="fill-surface-content/10 stroke-surface-100"
            {strokeWidth}
          />
        {/each}
        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} {strokeWidth} let:geoPath>
            {@const [cx, cy] = geoPath.centroid(feature)}
            {@const d = feature.properties.data}
            <circle
              {cx}
              {cy}
              r={rScale(d?.population ?? 0)}
              fill={colorScale(d?.percentUnder18 ?? 0)}
              fill-opacity={0.5}
              stroke={colorScale(d?.percentUnder18 ?? 0)}
              stroke-width={strokeWidth / 2}
              class="pointer-events-none"
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

      <Legend
        scale={colorScale}
        title="Est. Percent under 18"
        placement="top-left"
        class="absolute bg-surface-100/80 px-2 py-1 backdrop-blur-sm rounded m-1"
      />

      <Tooltip.Root let:data>
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
      </Tooltip.Root>
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

        <GeoPath
          render={(ctx, { newGeoPath }) => {
            for (var feature of enrichedCountiesFeatures) {
              const geoPath = newGeoPath();

              const [cx, cy] = geoPath.centroid(feature);
              const d = feature.properties.data;
              const r = rScale(d?.population ?? 0);
              const color = colorScale(d?.percentUnder18 ?? 0);

              const pathData = circlePath({ cx, cy, r });
              renderPathData(ctx, pathData, {
                styles: {
                  fill: color + (256 * 0.5).toString(16),
                  stroke: color,
                  strokeWidth,
                },
              });
            }
          }}
        />
      </Canvas>

      {#if tooltip.data}
        <Canvas>
          <GeoPath
            geojson={tooltip.data}
            class="stroke-none fill-surface-content/10"
            {strokeWidth}
          />
        </Canvas>
      {/if}

      <HitCanvas
        let:nextColor
        let:setColorData
        onpointermove={(e, data) => tooltip.show(e, data)}
        onpointerleave={tooltip.hide}
      >
        <GeoPath
          render={(ctx, { newGeoPath }) => {
            for (var feature of enrichedCountiesFeatures) {
              const color = nextColor();

              const geoPath = newGeoPath();
              // Stroking shape seems to help with dark border, but there is still antialising and thus gaps
              renderPathData(ctx, geoPath(feature), { styles: { fill: color, stroke: color } });

              setColorData(color, feature);
            }
          }}
        />
      </HitCanvas>

      <Legend scale={colorScale} title="Est. Percent under 18" placement="top-left" />

      <Tooltip.Root let:data>
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
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
