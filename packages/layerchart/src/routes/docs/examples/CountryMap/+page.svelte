<script lang="ts">
  import { geoAlbersUsa } from 'd3-geo';
  import { feature } from 'topojson-client';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Text from '$lib/components/Text.svelte';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
    >
      <Svg>
        <g class="states">
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
            />
          {/each}
        </g>
        <g class="labels pointer-events-none">
          {#each states.features as feature}
            <GeoPath geojson={feature} let:geoPath>
              {@const [x, y] = geoPath.centroid(feature)}
              <Text
                {x}
                {y}
                value={feature.properties.name}
                textAnchor="middle"
                verticalAnchor="middle"
                class="text-[8px] stroke-surface-100 [stroke-width:2px]"
              />
            </GeoPath>
          {/each}
        </g>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
    >
      <Canvas>
        <GeoPath geojson={states} class="fill-surface-content/10 stroke-surface-100" />
      </Canvas>
      {#each states.features as feature}
        <Canvas>
          <GeoPath
            geojson={feature}
            class="fill-surface-content stroke-surface-100"
            render={(ctx, { geoPath }) => {
              const [x, y] = geoPath.centroid(feature);
              const computedStyle = window.getComputedStyle(ctx.canvas);
              ctx.font = '8px sans-serif';
              ctx.textAlign = 'center';

              ctx.lineWidth = 2;
              ctx.strokeStyle = computedStyle.stroke;
              ctx.strokeText(feature.properties.name, x, y);

              ctx.fillStyle = computedStyle.fill;
              ctx.fillText(feature.properties.name, x, y);
            }}
          />
        </Canvas>
      {/each}
    </Chart>
  </div>
</Preview>
