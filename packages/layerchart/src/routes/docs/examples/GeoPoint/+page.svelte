<script lang="ts">
  import { geoAlbersUsa, geoNaturalEarth1 } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { Field, Switch } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoPoint from '$lib/components/GeoPoint.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  export let data;

  const states = feature(data.us.geojson, data.us.geojson.objects.states);
  const countries = feature(data.world.geojson, data.world.geojson.objects.countries);

  let debugTooltip = false;
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

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>US Airports</h2>
  <div class="mb-2">
    <Field dense let:id>
      <label class="flex gap-2 items-center text-sm">
        Show Voronoi
        <Switch bind:checked={debugTooltip} {id} />
      </label>
    </Field>
  </div>
</div>

<Preview data={states} class="overflow-hidden">
  <div class="h-[600px]">
    <Chart
      data={data.us.airports}
      x="longitude"
      y="latitude"
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
      tooltip={{ mode: 'voronoi', debug: debugTooltip }}
      let:tooltip
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
          {#each data.us.airports as airport}
            <GeoPoint lat={airport.latitude} long={airport.longitude} r={1} class="fill-primary" />
          {/each}

          {#if tooltip.data}
            <GeoPoint
              lat={tooltip.data.latitude}
              long={tooltip.data.longitude}
              r={4}
              class="stroke-primary/50 fill-none"
              spring
            />
          {/if}
        </g>
      </Svg>

      <Tooltip header={(d) => d.name} let:data>
        <TooltipItem label="Latitude" value={data.latitude} format="decimal" />
        <TooltipItem label="Longitude" value={data.longitude} format="decimal" />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>World Airports</h2>
  <div class="mb-2">
    <Field dense let:id>
      <label class="flex gap-2 items-center text-sm">
        Show Voronoi
        <Switch bind:checked={debugTooltip} {id} />
      </label>
    </Field>
  </div>
</div>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      data={data.world.airports}
      x="longitude"
      y="latitude"
      geo={{
        projection: geoNaturalEarth1,
        fitGeojson: countries,
      }}
      tooltip={{ mode: 'voronoi', debug: debugTooltip }}
      let:tooltip
    >
      <Svg>
        <g class="countries">
          {#each countries.features as feature}
            <GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
          {/each}
        </g>
        <g class="points pointer-events-none">
          {#each data.world.airports as airport}
            <GeoPoint lat={airport.latitude} long={airport.longitude} r={1} class="fill-primary" />
          {/each}

          {#if tooltip.data}
            <GeoPoint
              lat={tooltip.data.latitude}
              long={tooltip.data.longitude}
              r={4}
              class="stroke-primary/50 fill-none"
              spring
            />
          {/if}
        </g>
      </Svg>

      <Tooltip header={(d) => d.name} let:data>
        <TooltipItem label="Latitude" value={data.latitude} format="decimal" />
        <TooltipItem label="Longitude" value={data.longitude} format="decimal" />
      </Tooltip>
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
