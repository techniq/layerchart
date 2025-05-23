<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { scaleSqrt } from 'd3-scale';
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
    Chart,
    GeoCircle,
    GeoPath,
    Graticule,
    Layer,
    Tooltip,
    type ChartContextValue,
  } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  // https://observablehq.com/@tansi/earthquake
  // https://observablehq.com/@observablehq/plot-earthquake-globe

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let context = $state<ChartContextValue<(typeof data.earthquakes)[number]>>();

  let velocity = $state(3);

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

  let renderContext: 'svg' | 'canvas' = $state('svg');
  let debug = $state(false);
</script>

<h1>Examples</h1>

<div class="flex gap-2 items-end mb-2">
  <Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>

  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>

  <div class="grow"></div>

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

<Preview data={countries}>
  <div class="h-[600px]">
    <Chart
      bind:context
      data={data.earthquakes}
      x="longitude"
      y="latitude"
      r="magnitude"
      rScale={scaleSqrt()}
      rDomain={[0, 100]}
      rRange={[0, 1]}
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        applyTransform: ['rotate'],
      }}
      ondragstart={timer.stop}
    >
      {#snippet children({ context })}
        <Layer type={renderContext} {debug} disableHitCanvas={timer.running}>
          <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />

          <Graticule class="stroke-surface-content/20" />

          <GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />
          <GeoPath geojson={data.tectonicPlates} class="stroke-danger-100/30" />

          {#each data.earthquakes as eq}
            <GeoCircle
              center={[eq.longitude, eq.latitude]}
              radius={context.rScale(Math.exp(eq.magnitude))}
              class="stroke-danger fill-danger/20"
              onpointermove={(e) => context.tooltip.show(e, eq)}
              onpointerleave={() => context.tooltip.hide()}
            />
          {/each}
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
