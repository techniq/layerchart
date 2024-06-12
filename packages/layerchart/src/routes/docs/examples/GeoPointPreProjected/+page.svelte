<script lang="ts">
  // WIP: Example mixing pre-projected maps (using geoIdentity) with non-projected points

  import { geoIdentity, geoAlbersUsa } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Chart, GeoPath, GeoContext, GeoPoint, Svg, Text } from 'layerchart';
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
        _scale: 1300,
        _translate: [487.5, 305],
        fitGeojson: states,
      }}
      let:tooltip
      let:projection
    >
      <div>{projection.scale()}</div>
      <div>{projection.translate()}</div>
      <Svg>
        <GeoContext
          projection={geoIdentity}
          _scale={projection.scale()}
          scale={projection.scale() / 1300}
          _translate={[
            487.5 * (487.5 / projection.translate()[0]),
            305 * (305 / projection.translate()[1]),
          ]}
          __translate={[256.43 * 0.96, -13.11 * 0.96]}
          ___translate={[240, 5]}
          ____translate={[projection.translate()[0] - 487.5, projection.translate()[1] - 305]}
          geojson={states}
          let:projection
        >
          <g class="states">
            {#each states.features as feature}
              <GeoPath geojson={feature} {tooltip} class="fill-white hover:fill-gray-300" />
            {/each}
          </g>
          <text y={100}>{projection.scale()}</text>
          <text y={120}>{projection.translate()}</text>
        </GeoContext>
        <g class="points">
          {#each data.stateCaptitals as capital}
            <GeoPoint lat={capital.latitude} long={capital.longitude}>
              <circle r="2" fill="red" />
              <Text y="-6" value={capital.description} textAnchor="middle" class="text-[8px]" />
            </GeoPoint>
          {/each}
        </g>
      </Svg>
    </Chart>
  </div>
</Preview>
