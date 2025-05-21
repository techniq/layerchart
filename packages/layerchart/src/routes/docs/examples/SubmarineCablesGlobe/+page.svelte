<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';
  import { TimerState } from '@layerstack/svelte-state';

  import {
    Chart,
    Circle,
    GeoPath,
    GeoPoint,
    GeoVisible,
    Graticule,
    Svg,
    Tooltip,
    type ChartContextValue,
  } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  // https://vizhub.com/curran/submarine-cables-globe

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let context = $state<ChartContextValue>();

  let velocity = $state(3);
  const timer = new TimerState({
    delay: 1,
    tick: () => {
      if (!context) return;
      const value = context.transform.translate;

      context.transform.translate = {
        x: (value.x += velocity),
        y: value.y,
      };
    },
    disabled: true,
  });
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>SVG</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Spin:" dense labelPlacement="left" let:id>
      <ButtonGroup size="sm" variant="fill-light">
        <Button on:click={timer.start} disabled={timer.running}>Start</Button>
        <Button on:click={timer.stop} disabled={!timer.running}>Stop</Button>
      </ButtonGroup>
    </Field>

    <RangeField
      label="Velocity:"
      bind:value={velocity}
      min={-10}
      max={10}
      disabled={!timer.running}
      labelPlacement="left"
    />
  </div>
</div>

<Preview data={countries}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        applyTransform: ['rotate'],
      }}
      ondragstart={timer.stop}
      bind:context
    >
      {#snippet children({ context })}
        <Svg>
          <GeoPath
            geojson={{ type: 'Sphere' }}
            class="fill-surface-200 stroke-surface-content/20"
          />
          <Graticule class="stroke-surface-content/20" />
          <GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />

          {#each data.cables.features as feature}
            {@const hasColor =
              context.tooltip.data == null || context.tooltip.data.id === feature.properties.id}
            <GeoPath
              geojson={feature}
              stroke={hasColor ? feature.properties.color : undefined}
              class={cls(
                'stroke-2 fill-none transition-colors',
                !hasColor && 'stroke-surface-content/10'
              )}
              onpointermove={(e) => context.tooltip.show(e, feature.properties)}
              onpointerleave={(e) => context.tooltip.hide()}
            />
          {/each}

          <!-- Switch to Canvas for better performance -->
          <!-- {#each data.landingPoints.features as feature}
            {@const [long, lat] = feature.geometry.coordinates}
            <GeoCircle
              center={[long, lat]}
              radius={0.5}
              class="fill-surface-content stroke-surface-100 stroke"
              onpointermove={(e) => tooltip?.show(e, feature.properties)}
              onpointerleave={(e) => tooltip?.hide()}
            />
          {/each} -->

          {#each data.landingPoints.features as feature}
            {@const [long, lat] = feature.geometry.coordinates}
            <GeoVisible {lat} {long}>
              <GeoPoint {lat} {long}>
                <Circle
                  r={2}
                  class="fill-surface-content stroke-surface-100 stroke"
                  onpointermove={(e) => context.tooltip.show(e, feature.properties)}
                  onpointerleave={(e) => context.tooltip.hide()}
                />
              </GeoPoint>
            </GeoVisible>
          {/each}
        </Svg>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <!-- <Tooltip.List>
          <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
          <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
        </Tooltip.List> -->
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
