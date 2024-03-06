<script lang="ts">
  import { geoAlbersUsa, geoNaturalEarth1 } from 'd3-geo';
  import { feature } from 'topojson-client';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoPoint from '$lib/components/GeoPoint.svelte';
  import Text from '$lib/components/Text.svelte';

  export let data;

  const states = feature(data.us.geojson, data.us.geojson.objects.states);
  const countries = feature(data.world.geojson, data.world.geojson.objects.countries);
</script>

<h1>Examples</h1>

<h2>US State Capitals</h2>

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
        <g class="points pointer-events-none">
          {#each data.us.stateCaptitals as capital}
            <GeoPoint lat={capital.latitude} long={capital.longitude}>
              <circle r="2" class="fill-white stroke-danger" />
              <Text
                y="-6"
                value={capital.description}
                textAnchor="middle"
                class="text-[8px] stroke-surface-100 [stroke-width:2px]"
              />
            </GeoPoint>
          {/each}
        </g>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>World Airports</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoNaturalEarth1,
        fitGeojson: countries,
      }}
    >
      <Svg>
        <g class="states">
          {#each countries.features as feature}
            <GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
          {/each}
        </g>
        <g class="points pointer-events-none">
          {#each data.world.airports as airport}
            <GeoPoint lat={airport.latitude} long={airport.longitude}>
              <circle r="1" class="fill-primary" />
            </GeoPoint>
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
        <GeoPath geojson={states} fill="#e5e7eb" stroke="white" />
      </Canvas>
      {#each data.us.stateCaptitals as capital}
        <Canvas>
          <GeoPoint
            lat={capital.latitude}
            long={capital.longitude}
            render={(ctx, { x, y }) => {
              // point
              const radius = 2;
              ctx.strokeStyle = 'red';
              ctx.fillStyle = 'white';
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
              ctx.fill();
              ctx.stroke();
              // label
              ctx.font = '8px sans-serif';
              ctx.textAlign = 'center';
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.fillStyle = 'black';
              ctx.strokeText(capital.description, x, y - 6);
              ctx.fillText(capital.description, x, y - 6);
            }}
          />
        </Canvas>
      {/each}
    </Chart>
  </div>
</Preview>
