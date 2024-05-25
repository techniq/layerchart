<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { geoAlbersUsa, geoAlbers, geoMercator, geoPath as d3geoPath } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Field, SelectField, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import TransformControls from '$lib/docs/TransformControls.svelte';

  import Chart, { Svg, Canvas } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import HitCanvas from '$lib/components/HitCanvas.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';

  export let data;

  let projection = geoAlbersUsa;
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Mercator', value: geoMercator },
  ];

  const counties = feature(data.geojson, data.geojson.objects.counties);
  const states = feature(data.geojson, data.geojson.objects.states);

  let selectedStateId = null;
  $: selectedCountiesFeatures = selectedStateId
    ? counties.features.filter((f) => f.id.slice(0, 2) === selectedStateId)
    : [];

  let scrollMode = 'none';
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
  <Field label="Scroll mode" let:id>
    <ToggleGroup bind:value={scrollMode} variant="outline" size="sm" inset class="w-full">
      <ToggleOption value="none">None</ToggleOption>
      <ToggleOption value="scale">Scale</ToggleOption>
      <ToggleOption value="translate">Translate</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: states,
      }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
      transform={{
        mode: 'canvas',
        scroll: scrollMode,
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:transform
    >
      <TransformControls />

      <Svg>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
            strokeWidth={1 / transform.scale}
            {tooltip}
            on:click={(e) => {
              const { geoPath, event } = e.detail;
              let [[left, top], [right, bottom]] = geoPath.bounds(feature);
              if (selectedStateId === feature.id) {
                selectedStateId = null;
                transform.reset();
              } else {
                selectedStateId = feature.id;
                let width = right - left;
                let height = bottom - top;
                let x = (left + right) / 2;
                let y = (top + bottom) / 2;
                const padding = 20;
                transform.zoomTo({ x, y }, { width: width + padding, height: height + padding });
              }
            }}
          />
        {/each}

        {#each selectedCountiesFeatures as feature (feature.id)}
          <g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}>
            <GeoPath
              geojson={feature}
              {tooltip}
              strokeWidth={1 / transform.scale}
              class="stroke-surface-content/10 hover:fill-surface-content/10"
              on:click={() => {
                selectedStateId = null;
                transform.reset();
              }}
            />
          </g>
        {/each}
      </Svg>
      <Tooltip header={(data) => data.properties.name} />
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={states}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: states,
      }}
      transform={{
        mode: 'canvas',
        scroll: scrollMode,
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:projection
      tooltip={{ mode: 'manual' }}
      let:tooltip
      let:transform
    >
      <TransformControls />

      <Canvas>
        <GeoPath
          geojson={states}
          class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
          strokeWidth={1 / transform.scale}
        />
      </Canvas>

      <Canvas>
        <!-- <g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}> -->
        <GeoPath
          geojson={{ type: 'FeatureCollection', features: selectedCountiesFeatures }}
          {tooltip}
          strokeWidth={1 / transform.scale}
          class="stroke-surface-content/10 hover:fill-surface-content/10"
          on:click={() => {
            selectedStateId = null;
            transform.reset();
          }}
        />
        <!-- </g> -->
      </Canvas>

      {#if tooltip.data}
        <Canvas>
          <GeoPath
            geojson={tooltip.data}
            strokeWidth={1 / transform.scale}
            class="stroke-surface-content fill-surface-content/20"
          />
        </Canvas>
      {/if}

      <HitCanvas
        let:nextColor
        let:setColorData
        on:pointermove={(e) => tooltip.show(e.detail.event, e.detail.data)}
        on:pointerleave={tooltip.hide}
        on:click={(e) => {
          // console.log(e.detail.data);
          const feature = e.detail.data;
          const geoPath = d3geoPath(projection);

          // const { geoPath, event } = e.detail;
          let [[left, top], [right, bottom]] = geoPath.bounds(feature);
          if (selectedStateId === feature.id) {
            selectedStateId = null;
            transform.reset();
          } else {
            selectedStateId = feature.id;
            let width = right - left;
            let height = bottom - top;
            let x = (left + right) / 2;
            let y = (top + bottom) / 2;
            const padding = 20;

            // console.log({ x, y, width, height });
            transform.zoomTo({ x, y }, { width: width + padding, height: height + padding });
          }
        }}
      >
        <GeoPath
          render={(ctx, { geoPath }) => {
            for (var feature of states.features) {
              const color = nextColor();

              ctx.beginPath();
              geoPath(feature);
              ctx.fillStyle = color;
              ctx.fill();

              setColorData(color, feature);
            }
          }}
        />
      </HitCanvas>

      <Tooltip header={(data) => data.properties.name} />
    </Chart>
  </div>
</Preview>
