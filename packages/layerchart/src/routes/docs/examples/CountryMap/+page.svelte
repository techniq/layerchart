<script lang="ts">
  import { geoAlbersUsa } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Canvas, Chart, GeoPath, renderText, Svg, Text } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

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

        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            render={(ctx, { newGeoPath }) => {
              const geoPath = newGeoPath();
              const [x, y] = geoPath.centroid(feature);
              renderText(
                ctx,
                feature.properties.name,
                { x, y },
                {
                  classes: 'text-[8px] text-center fill-surface-content stroke-surface-100',
                  styles: { paintOrder: 'stroke' },
                }
              );
            }}
          />
        {/each}
      </Canvas>
    </Chart>
  </div>
</Preview>
