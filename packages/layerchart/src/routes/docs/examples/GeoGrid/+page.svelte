<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { feature } from 'topojson-client';

  import {
    Button,
    ButtonGroup,
    Field,
    RangeField,
    Switch,
    ToggleGroup,
    ToggleOption,
  } from 'svelte-ux';
  import { TimerState } from '@layerstack/svelte-state';

  import {
    Blur,
    Chart,
    Circle,
    Ellipse,
    GeoCircle,
    GeoPath,
    GeoPoint,
    GeoVisible,
    Graticule,
    Layer,
    Tooltip,
    type ChartContextValue,
  } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';
  import { geoContainsCache, grayFullerGrid } from '$lib/utils/geo.js';
  import { cls } from '@layerstack/tailwind';
  import RadialGradient from 'layerchart/components/RadialGradient.svelte';

  let { data } = $props();

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let context = $state<ChartContextValue>();

  let velocity = $state(3);

  let count = $state(2);
  let geoGrid = $derived(grayFullerGrid(count));
  let geoContains = $derived(geoContainsCache(countries));

  let mode = $state<'soccer' | 'hex' | 'points'>('hex');

  const timer = new TimerState({
    delay: 1,
    tick: () => {
      if (!context) return;
      const curr = context.transform.translate;

      context.transform.translate = {
        x: (curr.x += velocity),
        y: curr.y,
      };
    },
    disabled: true,
  });

  let debug = $state(false);
</script>

<h1>Examples</h1>

<div class="flex gap-2 items-end mb-2">
  <RangeField label="Count:" bind:value={count} min={1} max={50} labelPlacement="left" />

  <Field label="Mode:" dense labelPlacement="left" let:id>
    <ToggleGroup bind:value={mode}>
      <ToggleOption value="all">All</ToggleOption>
      <ToggleOption value="hex">Hex</ToggleOption>
      <ToggleOption value="points">Points</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<div class="flex gap-2 items-end mb-2">
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

  <div class="grow"></div>

  <Field label="Debug" labelPlacement="left" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<Preview data={countries}>
  <div class="h-[600px]">
    <Chart
      bind:context
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        applyTransform: ['rotate'],
      }}
      padding={{ top: 20, bottom: 50 }}
      ondragstart={timer.stop}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext} {debug} disableHitCanvas={timer.running}>
          <!-- TODO: styling - https://observablehq.com/@d3/faux-parabolic-arcs -->
          {@const gold = ['#ffd700', '#b8860b', '#8b4513']}
          {@const silver = ['#f5f5f5', '#8c8c8c', '#333333']}
          {@const bronze = ['#cd7f32', '#a0522d', '#8b4513']}
          {@const copper = ['#ffb347', '#cd853f', '#8b4513']}
          {@const blue = ['#87ceeb', '#4682b4', '#191970']}
          {@const lightBlue = ['hsl(210, 100%, 60%)', 'hsl(210, 100%, 50%)', 'hsl(210, 100%, 40%)']}
          <!-- <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" /> -->

          <!-- <RadialGradient stops={lightBlue} fx="50%" fy="50%">
            {#snippet children({ gradient })}
              <GeoPath geojson={{ type: 'Sphere' }} fill={gradient} />
            {/snippet}
          </RadialGradient> -->

          {@const cx = context.width / 2}
          {@const cy = context.height / 2}
          {@const r = Math.min(context.width, context.height) / 2}

          <!-- Shadow -->
          <RadialGradient
            stops={[
              ['20%', 'rgba(0, 0, 0, 0.5)'],
              ['100%', 'rgba(0, 0, 0, 0.1)'],
            ]}
            cx="75%"
            cy="25%"
          >
            {#snippet children({ gradient })}
              <Blur stdDeviation={10}>
                <Ellipse
                  {cx}
                  cy={cy + r * 0.95}
                  rx={r * 0.9}
                  ry={r * 0.25}
                  class="fill-black/20"
                  _fill={gradient}
                />
              </Blur>
            {/snippet}
          </RadialGradient>

          <!-- Ocean -->
          <RadialGradient
            stops={[
              ['5%', '#fff'],
              ['100%', '#aaa'],
            ]}
            cx="75%"
            cy="25%"
          >
            {#snippet children({ gradient })}
              <GeoPath geojson={{ type: 'Sphere' }} fill={gradient} />
            {/snippet}
          </RadialGradient>

          <!-- <Graticule class="stroke-surface-content/20" /> -->
          <!-- <GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" /> -->

          <!-- <GeoPath geojson={geoGrid} class="stroke-surface-100/30 " /> -->
          <!-- <GeoPath geojson={geoGrid} class="stroke-surface-content" /> -->
          {#each geoGrid.features as feature, i}
            {#if mode === 'all'}
              <GeoPath
                geojson={feature}
                class={cls(
                  'stroke-surface-content',
                  {
                    // face: 'fill-primary',
                    // edge: 'fill-secondary',
                    vertex: 'fill-surface-content',
                  }[feature.properties.type]
                )}
              />
            {/if}

            {#if mode === 'hex'}
              {#if geoContains(feature.properties.centroid)}
                <GeoPath geojson={feature} class="fill-surface-content/20" />
              {/if}
            {/if}

            {#if mode === 'points'}
              {#if geoContains(feature.properties.centroid)}
                <GeoCircle
                  center={feature.properties.centroid}
                  radius={180 / count / 6.0}
                  class="fill-surface-content/20"
                />
              {/if}
            {/if}
          {/each}

          <!-- Highlight -->
          <!-- <RadialGradient
            stops={[
              ['5%', 'rgba(255, 215, 0, 0.2)'],
              ['100%', 'rgba(184, 134, 11, 0.1)'],
            ]}
            cx="75%"
            cy="25%"
          >
            {#snippet children({ gradient })}
              <GeoPath geojson={{ type: 'Sphere' }} fill={gradient} />
            {/snippet}
          </RadialGradient> -->

          <!-- Shading -->
          <RadialGradient
            stops={[
              ['30%', 'rgba(255, 255, 255, 0)'],
              ['100%', 'rgba(85, 96, 102, 0.3)'],
            ]}
            cx="55%"
            cy="45%"
          >
            {#snippet children({ gradient })}
              <GeoPath geojson={{ type: 'Sphere' }} fill={gradient} />
            {/snippet}
          </RadialGradient>
        </Layer>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.place}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
              <Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
              <Tooltip.Item label="Magnitude" value={data.magnitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
