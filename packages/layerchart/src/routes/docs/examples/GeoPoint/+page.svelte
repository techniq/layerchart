<script lang="ts">
  import { geoAlbersUsa, geoNaturalEarth1 } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { Field, Switch } from 'svelte-ux';

  import { Canvas, Chart, Circle, GeoPath, GeoPoint, Svg, Text, Tooltip } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

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
          {#each data.us.captitals as capital}
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
  <h2>World Capitals</h2>
  <div class="mb-2">
    <Field dense let:id>
      <label class="flex gap-2 items-center text-sm" for={id}>
        Show Voronoi
        <Switch bind:checked={debugTooltip} {id} />
      </label>
    </Field>
  </div>
</div>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      data={data.world.captitals}
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
        <g class="states">
          {#each countries.features as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
              {tooltip}
            />
          {/each}
        </g>
        <g class="points pointer-events-none">
          {#each data.world.captitals as capital}
            <GeoPoint
              lat={capital.latitude}
              long={capital.longitude}
              r="2"
              class="fill-white stroke-danger"
            />

            {#if tooltip.data}
              <GeoPoint lat={tooltip.data.latitude} long={tooltip.data.longitude} spring>
                <circle r="4" class="stroke-primary/50 fill-none" />
                <Text
                  y="-6"
                  value={tooltip.data.label}
                  textAnchor="middle"
                  class="text-[8px] stroke-surface-100 [stroke-width:2px]"
                />
              </GeoPoint>
            {/if}
          {/each}
        </g>
      </Svg>

      <!-- <Tooltip.Root let:data>
        <Tooltip.Header>{data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
          <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root> -->
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>US Airports</h2>
  <div class="mb-2">
    <Field dense let:id>
      <label class="flex gap-2 items-center text-sm" for={id}>
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

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
          <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>World Airports</h2>
  <div class="mb-2">
    <Field dense let:id>
      <label class="flex gap-2 items-center text-sm" for={id}>
        Show Voronoi
        <Switch bind:checked={debugTooltip} {id} />
      </label>
    </Field>
  </div>
</div>

<Preview data={data.world.airports}>
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

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
          <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
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
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
    >
      <Canvas>
        {#each states.features as feature}
          <GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
        {/each}
        {#each data.us.captitals as capital}
          <GeoPoint lat={capital.latitude} long={capital.longitude} let:x let:y>
            <Circle cx={x} cy={y} r={2} class="fill-white stroke-danger" />
            <Text
              {x}
              y={y - 6}
              value={capital.description}
              textAnchor="middle"
              class="text-[8px] stroke-surface-100 [stroke-width:2px]"
            />
          </GeoPoint>
        {/each}
      </Canvas>
    </Chart>
  </div>
</Preview>
