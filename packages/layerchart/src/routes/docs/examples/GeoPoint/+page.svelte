<script lang="ts">
  import { geoAlbersUsa, geoNaturalEarth1 } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

  import { Canvas, Chart, Circle, GeoPath, GeoPoint, Svg, Text, Tooltip } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  // @ts-expect-error
  import LucideStar from '~icons/lucide/star';

  let { data } = $props();

  const states = feature(data.us.geojson, data.us.geojson.objects.states);
  const countries = feature(data.world.geojson, data.world.geojson.objects.countries);

  let tooltipMode = $state<'quadtree' | 'voronoi'>('quadtree');
  let tooltipRadius = $state(30);
  let debug = $state(false);
</script>

<h1>Examples</h1>

<div class="flex gap-2">
  <!-- <Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field> -->

  <Field label="Tooltip mode" class="grow">
    <ToggleGroup bind:value={tooltipMode} variant="outline">
      <ToggleOption value="quadtree">quadtree</ToggleOption>
      <ToggleOption value="voronoi">voronoi</ToggleOption>
    </ToggleGroup>
  </Field>

  <RangeField label="Tooltip radius" bind:value={tooltipRadius} max={100} class="grow" />

  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<h2>US State Capitals</h2>

<Preview data={data.us.capitals}>
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
          {#each data.us.capitals as capital}
            <GeoPoint lat={capital.latitude} long={capital.longitude}>
              <Circle r={2} class="fill-white stroke-danger" />
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

<h2>World Capitals</h2>

<Preview data={data.world.capitals}>
  <div class="h-[600px]">
    <Chart
      data={data.world.capitals}
      x="longitude"
      y="latitude"
      geo={{
        projection: geoNaturalEarth1,
        fitGeojson: countries,
      }}
      tooltip={{ mode: tooltipMode, debug, radius: tooltipRadius }}
    >
      {#snippet children({ context })}
        <Svg>
          <g class="states">
            {#each countries.features as feature}
              <GeoPath
                geojson={feature}
                class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
              />
            {/each}
          </g>

          <g class="points pointer-events-none">
            {#each data.world.capitals as capital}
              <GeoPoint
                lat={capital.latitude}
                long={capital.longitude}
                r={2}
                class="fill-white stroke-danger"
              />

              <!-- Show tooltip as GeoPoint (Svg/Canvas) instead of Tooltip.Point (Html)) -->
              {#if context.tooltip.data}
                <GeoPoint
                  lat={context.tooltip.data.latitude}
                  long={context.tooltip.data.longitude}
                  motion="spring"
                >
                  <Circle r={4} class="stroke-primary/50 fill-none" />
                  <Text
                    y="-6"
                    value={context.tooltip.data.label}
                    textAnchor="middle"
                    class="text-[8px] stroke-surface-100 [stroke-width:2px]"
                  />
                </GeoPoint>
              {/if}
            {/each}
          </g>
        </Svg>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>US Airports</h2>

<Preview data={data.us.airports} class="overflow-hidden">
  <div class="h-[600px]">
    <Chart
      data={data.us.airports}
      x="longitude"
      y="latitude"
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
      tooltip={{ mode: tooltipMode, debug, radius: tooltipRadius }}
    >
      {#snippet children({ context })}
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
              <GeoPoint
                lat={airport.latitude}
                long={airport.longitude}
                r={1}
                class="fill-primary"
              />
            {/each}

            {#if context.tooltip.data}
              <GeoPoint
                lat={context.tooltip.data.latitude}
                long={context.tooltip.data.longitude}
                r={4}
                class="stroke-primary/50 fill-none"
                motion="spring"
              />
            {/if}
          </g>
        </Svg>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
              <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>World Airports</h2>

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
      tooltip={{ mode: tooltipMode, debug, radius: tooltipRadius }}
    >
      {#snippet children({ context })}
        <Svg>
          <g class="countries">
            {#each countries.features as feature}
              <GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
            {/each}
          </g>
          <g class="points pointer-events-none">
            {#each data.world.airports as airport}
              <GeoPoint
                lat={airport.latitude}
                long={airport.longitude}
                r={1}
                class="fill-primary"
              />
            {/each}

            {#if context.tooltip.data}
              <GeoPoint
                lat={context.tooltip.data.latitude}
                long={context.tooltip.data.longitude}
                r={4}
                class="stroke-primary/50 fill-none"
                motion="spring"
              />
            {/if}
          </g>
        </Svg>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
              <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={data.us.capitals}>
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
        {#each data.us.capitals as capital}
          <GeoPoint lat={capital.latitude} long={capital.longitude}>
            {#snippet children({ x, y })}
              <Circle cx={x} cy={y} r={2} class="fill-white stroke-danger" />
              <Text
                {x}
                y={y - 6}
                value={capital.description}
                textAnchor="middle"
                class="text-[8px] stroke-surface-100 [stroke-width:2px]"
              />
            {/snippet}
          </GeoPoint>
        {/each}
      </Canvas>
    </Chart>
  </div>
</Preview>

<h2>Lucide icons</h2>

<Preview data={data.us.capitals}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
    >
      {#snippet children({ context })}
        <Svg>
          <g class="states">
            {#each states.features as feature}
              <GeoPath
                geojson={feature}
                class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
              />
            {/each}
          </g>
          <g class="points">
            {#each data.us.capitals as capital}
              <GeoPoint lat={capital.latitude} long={capital.longitude}>
                <LucideStar class="text-danger text-[8px]" x={-5} y={-5} />
                <Text
                  y="-6"
                  value={capital.description}
                  textAnchor="middle"
                  class="text-[8px] stroke-surface-100 [stroke-width:2px]"
                />
                <Circle
                  r={10}
                  class="fill-transparent"
                  onpointerenter={(e) => context.tooltip.show(e, capital)}
                  onpointermove={(e) => context.tooltip.show(e, capital)}
                  onpointerleave={(e) => context.tooltip.hide(e)}
                />
              </GeoPoint>
            {/each}
          </g>
        </Svg>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            {data.description}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
