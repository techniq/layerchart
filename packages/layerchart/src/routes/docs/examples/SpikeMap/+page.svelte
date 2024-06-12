<script lang="ts">
  import { index, max, descending } from 'd3-array';
  import { geoIdentity } from 'd3-geo';
  import { scaleLinear } from 'd3-scale';
  import { feature } from 'topojson-client';

  import { Canvas, Chart, GeoPath, Group,, HitCanvas, Svg, TransformControls, Tooltip, TooltipItem } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

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

  const width = 7;
  const maxHeight = 200;
  $: heightScale = scaleLinear()
    .domain([0, max(population, (d) => d.population)])
    .range([0, maxHeight]);

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
    .sort((a, b) => descending(a.properties.data?.population, b.properties.data?.population));
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px] overflow-hidden">
    <Chart
      geo={{
        projection: geoIdentity,
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
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="fill-surface-content/10 stroke-surface-100"
            {strokeWidth}
          />
        {/each}

        {#each enrichedCountiesFeatures as feature}
          <GeoPath geojson={feature} {strokeWidth} let:geoPath>
            {@const [x, y] = geoPath.centroid(feature)}
            {@const d = feature.properties.data}
            {@const height = heightScale(d?.population)}
            <Group {x} {y}>
              <path
                d="M{-width / 2},0 L0,{-height} L{width / 2},0"
                class="stroke-danger fill-danger/25"
                stroke-width={strokeWidth}
              />
            </Group>
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
      </Canvas>

      <Canvas>
        <GeoPath
          class="stroke-danger fill-danger/25"
          render={(ctx, { geoPath }) => {
            const computedStyle = window.getComputedStyle(ctx.canvas);

            for (var feature of enrichedCountiesFeatures) {
              const [x, y] = geoPath.centroid(feature);
              const d = feature.properties.data;
              const height = heightScale(d?.population);

              ctx.lineWidth = strokeWidth;
              ctx.strokeStyle = computedStyle.stroke;
              ctx.fillStyle = computedStyle.fill;

              const startPoint = [x - width / 2, y];
              const midPoint = [x, y - height];
              const endPoint = [x + width / 2, y];

              ctx.beginPath();
              ctx.moveTo(...startPoint);
              ctx.lineTo(...midPoint);
              ctx.lineTo(...endPoint);
              ctx.fill();
              ctx.stroke();
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
