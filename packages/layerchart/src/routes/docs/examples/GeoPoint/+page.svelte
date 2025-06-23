<script lang="ts">
  import { geoAlbersUsa, geoNaturalEarth1 } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

  import { Chart, Circle, GeoPath, GeoPoint, Layer, Text, Tooltip } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';

  // @ts-expect-error
  import LucideStar from '~icons/lucide/star';

  let { data } = $props();

  const states = feature(data.us.geojson, data.us.geojson.objects.states);
  const countries = feature(data.world.geojson, data.world.geojson.objects.countries);

  let tooltipMode = $state<'quadtree' | 'voronoi'>('quadtree');
  let tooltipRadius = $state(30);
  let debug = $derived(shared.debug);
</script>

<h1>Examples</h1>

<div class="flex gap-2">
  <Field label="Tooltip mode" class="grow">
    <ToggleGroup bind:value={tooltipMode} variant="outline">
      <ToggleOption value="quadtree">quadtree</ToggleOption>
      <ToggleOption value="voronoi">voronoi</ToggleOption>
    </ToggleGroup>
  </Field>

  <RangeField label="Tooltip radius" bind:value={tooltipRadius} max={100} class="grow" />
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
      <Layer type={shared.renderContext}>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
          />
        {/each}

        <g class="points pointer-events-none">
          {#each data.us.capitals as capital}
            <!-- TODO: Improve GeoPoint to standardize svg/canvas -->
            {#if shared.renderContext === 'svg'}
              <GeoPoint lat={capital.latitude} long={capital.longitude}>
                <Circle r={2} class="fill-white stroke-danger" />
                <Text
                  y="-6"
                  value={capital.description}
                  textAnchor="middle"
                  class="text-[8px] stroke-surface-100 [stroke-width:2px]"
                />
              </GeoPoint>
            {:else if shared.renderContext === 'canvas'}
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
            {/if}
          {/each}
        </g>
      </Layer>
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
        <Layer type={shared.renderContext}>
          {#each countries.features as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
            />
          {/each}

          {#each data.world.capitals as capital}
            <GeoPoint
              lat={capital.latitude}
              long={capital.longitude}
              r={2}
              class="fill-white stroke-danger pointer-events-none"
            />
          {/each}
        </Layer>

        <!-- Show tooltip as GeoPoint (Svg/Canvas) instead of Tooltip.Point (Html)) -->
        <!-- Render tooltip on separate layer to avoid performance issues (canvas) -->
        <Layer type={shared.renderContext}>
          {#if context.tooltip.data}
            {#if shared.renderContext === 'svg'}
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
            {:else if shared.renderContext === 'canvas'}
              <GeoPoint
                lat={context.tooltip.data.latitude}
                long={context.tooltip.data.longitude}
                motion="spring"
              >
                {#snippet children({ x, y })}
                  <Circle cx={x} cy={y} r={4} class="stroke-primary/50 fill-none" />
                  <Text
                    {x}
                    y={y - 6}
                    value={context.tooltip.data?.label}
                    textAnchor="middle"
                    class="text-[8px] stroke-surface-100 [stroke-width:2px]"
                  />
                {/snippet}
              </GeoPoint>
            {/if}
          {/if}
        </Layer>
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
        <Layer type={shared.renderContext}>
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
            />
          {/each}

          {#each data.us.airports as airport}
            <GeoPoint
              lat={airport.latitude}
              long={airport.longitude}
              r={1}
              class="fill-primary pointer-events-none"
            />
          {/each}
        </Layer>

        <!-- Render tooltip on separate layer to avoid performance issues (canvas) -->
        <Layer type={shared.renderContext}>
          {#if context.tooltip.data}
            <GeoPoint
              lat={context.tooltip.data.latitude}
              long={context.tooltip.data.longitude}
              r={4}
              class="stroke-primary/50 fill-none pointer-events-none"
              motion="spring"
            />
          {/if}
        </Layer>

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
        <Layer type={shared.renderContext}>
          {#each countries.features as feature}
            <GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
          {/each}

          {#each data.world.airports as airport}
            <GeoPoint
              lat={airport.latitude}
              long={airport.longitude}
              r={1}
              class="fill-primary pointer-events-none"
            />
          {/each}
        </Layer>

        <!-- Render tooltip on separate layer to avoid performance issues (canvas) -->
        <Layer type={shared.renderContext}>
          {#if context.tooltip.data}
            <GeoPoint
              lat={context.tooltip.data.latitude}
              long={context.tooltip.data.longitude}
              r={4}
              class="stroke-primary/50 fill-none pointer-events-none"
              motion="spring"
            />
          {/if}
        </Layer>

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

<h2>Icons</h2>

<Preview data={data.us.capitals}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
            />
          {/each}

          {#each data.us.capitals as capital}
            <GeoPoint lat={capital.latitude} long={capital.longitude}>
              <!-- TODO: How best to support canvas? -->
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
        </Layer>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            {data.description}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
