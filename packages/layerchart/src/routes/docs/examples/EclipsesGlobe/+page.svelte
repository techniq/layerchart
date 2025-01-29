<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { extent } from 'd3-array';
  import { scaleDiverging } from 'd3-scale';
  import { interpolateGreens, interpolatePurples } from 'd3-scale-chromatic';
  import { feature } from 'topojson-client';

  import { Chart, GeoPath, Graticule, Legend, Svg, Tooltip, TransformContext } from 'layerchart';

  import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
  import { format, PeriodType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { timerStore } from '@layerstack/svelte-stores';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const countries = feature(data.geojson, data.geojson.objects.countries);
  const eclipses = feature(data.eclipses, data.eclipses.objects.eclipses);

  let transformContext: TransformContext;

  let velocity = 3;
  let isSpinning = false;
  const timer = timerStore({
    delay: 1,
    onTick() {
      transformContext.translate.update((value) => {
        return {
          x: (value.x += velocity),
          y: value.y,
        };
      });
    },
    disabled: !isSpinning,
  });
  $: isSpinning ? timer.start() : timer.stop();
  $timer;

  $: dateExtents = extent(eclipses.features.map((f) => f.properties.Date));
  $: colorScale = scaleDiverging<string>(
    [dateExtents[0] ?? 0, new Date(), dateExtents[1] ?? 0],
    (t) => (t < 0.5 ? interpolatePurples(1 - t) : interpolateGreens(t))
  );
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>SVG</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Spin:" dense labelPlacement="left" let:id>
      <ButtonGroup size="sm" variant="fill-light">
        <Button
          on:click={() => {
            isSpinning = true;
          }}
          disabled={isSpinning}>Start</Button
        >
        <Button
          on:click={() => {
            isSpinning = false;
          }}
          disabled={!isSpinning}>Stop</Button
        >
      </ButtonGroup>
    </Field>

    <RangeField
      label="Velocity:"
      bind:value={velocity}
      min={-10}
      max={10}
      disabled={!isSpinning}
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
      ondragstart={() => timer.stop()}
      ondragend={() => {
        if (isSpinning) {
          // Restart
          timer.start();
        }
      }}
      bind:transformContext
      padding={{ top: 60 }}
      let:tooltip
    >
      <Legend
        scale={colorScale}
        title="Eclipse date"
        tickFormat={(d) => new Date(d).getFullYear().toString()}
      />

      <Svg>
        <GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-200 stroke-surface-content/20" />
        <Graticule class="stroke-surface-content/20" />
        <GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />

        {#each eclipses.features as feature}
          {@const hasColor = tooltip.data == null || tooltip.data.ID === feature.properties.ID}

          <GeoPath
            geojson={feature}
            fill={hasColor ? colorScale(feature.properties.Date) : undefined}
            class={cls('transition-colors', !hasColor && 'fill-surface-content/10')}
            onpointermove={(e) => tooltip?.show(e, feature.properties)}
            onpointerleave={(e) => tooltip?.hide()}
          />
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        {format(data.Date, PeriodType.Day, { variant: 'long' })}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
