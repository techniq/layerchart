<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { geoAlbersUsa, geoAlbers, geoMercator, geoPath as d3geoPath } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Canvas, Chart, GeoPath, Svg, Tooltip, geoFitObjectTransform } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';
  import { SelectField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import type { GeometryObjectA } from 'topojson-specification';

  export let data;

  let projection = geoAlbersUsa;
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Mercator', value: geoMercator },
  ];

  const counties = feature(data.geojson, data.geojson.objects.counties);
  const states = feature(data.geojson, data.geojson.objects.states);

  $: contiguousStates = {
    ...states,
    features: states.features.filter((d) => {
      // Contiguous states
      return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
    }),
  };

  let selectedStateId: GeometryObjectA['id'] | null = null;
  $: selectedCountiesFeatures = selectedStateId
    ? counties.features.filter((f) => (f.id as string).slice(0, 2) === selectedStateId)
    : [];
</script>

<div class="grid grid-cols-[1fr_2fr] gap-2 my-2">
  <SelectField
    label="Projections"
    options={projections}
    bind:value={projection}
    clearable={false}
    toggleIcon={null}
    stepper
  />
</div>

<h1>Examples</h1>

<h2>SVG (projection transform)</h2>

<Preview data={states}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: projection === geoMercator ? contiguousStates : states,
        applyTransform: ['translate', 'scale'],
      }}
      transform={{
        initialScrollMode: 'none',
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:projection
      let:transform
      let:tooltip
      let:width
      let:height
    >
      <TransformControls />

      <Svg>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
            {tooltip}
            onclick={() => {
              if (selectedStateId === feature.id) {
                selectedStateId = null;
                transform.reset();
              } else {
                selectedStateId = feature.id;
                const featureTransform = geoFitObjectTransform(
                  projection,
                  [width, height],
                  feature
                );
                transform.setTranslate(featureTransform.translate);
                transform.setScale(featureTransform.scale);
              }
            }}
          />
        {/each}

        {#each selectedCountiesFeatures as feature (feature.id)}
          <g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}>
            <GeoPath
              geojson={feature}
              {tooltip}
              class="stroke-surface-content/10 hover:stroke-surface-content/50 hover:fill-surface-content/10"
              onclick={() => {
                selectedStateId = null;
                transform.reset();
              }}
            />
          </g>
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>SVG (canvas transform)</h2>

<Preview data={states}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: projection === geoMercator ? contiguousStates : states,
      }}
      transform={{
        mode: 'canvas',
        initialScrollMode: 'none',
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:projection
      let:transform
      let:tooltip
    >
      <TransformControls />

      <Svg>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
            strokeWidth={1 / transform.scale}
            {tooltip}
            onclick={(e, geoPath) => {
              if (selectedStateId === feature.id) {
                selectedStateId = null;
                transform.reset();
              } else {
                selectedStateId = feature.id;
                const [[left, top], [right, bottom]] = geoPath.bounds(feature);
                const width = right - left;
                const height = bottom - top;
                const x = (left + right) / 2;
                const y = (top + bottom) / 2;
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
              class="stroke-surface-content/10 hover:stroke-surface-content/50 hover:fill-surface-content/10"
              onclick={() => {
                selectedStateId = null;
                transform.reset();
              }}
            />
          </g>
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        {data.properties.name}
        <!-- TODO: How to handle scale (when using canvas and not projection transforms) -->
        <!-- {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List> -->
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Canvas (projection transform)</h2>

<Preview data={states}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      data={[{ hello: 1 }]}
      geo={{
        projection,
        fitGeojson: projection === geoMercator ? contiguousStates : states,
        applyTransform: ['translate', 'scale'],
      }}
      transform={{
        initialScrollMode: 'none',
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:projection
      let:transform
      let:tooltip
      let:width
      let:height
    >
      <TransformControls />

      <Canvas>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-surface-content fill-surface-100"
            {tooltip}
            onclick={(e, geoPath) => {
              if (
                selectedStateId === feature.id ||
                !states.features.some((f) => f.id == feature.id) // County selected
              ) {
                selectedStateId = null;
                transform.reset();
              } else {
                selectedStateId = feature.id;
                tooltip.hide();
                const featureTransform = geoFitObjectTransform(
                  projection,
                  [width, height],
                  feature
                );
                transform.setTranslate(featureTransform.translate);
                transform.setScale(featureTransform.scale);
              }
            }}
          />
        {/each}

        {#each selectedCountiesFeatures as feature (feature.id)}
          <GeoPath
            geojson={feature}
            {tooltip}
            class="stroke-surface-content/10 hover:fill-surface-content/10"
            onclick={() => {
              selectedStateId = null;
              transform.reset();
            }}
          />
        {/each}
      </Canvas>

      <Canvas pointerEvents={false}>
        {#if tooltip.data}
          <GeoPath
            geojson={tooltip.data}
            strokeWidth={1 / transform.scale}
            class="stroke-surface-content/50 fill-surface-content/20"
          />
        {/if}
      </Canvas>

      <Tooltip.Root let:data>
        {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Canvas (canvas transform)</h2>

<Preview data={states}>
  <div class="h-[600px] relative overflow-hidden">
    <Chart
      geo={{
        projection,
        fitGeojson: projection === geoMercator ? contiguousStates : states,
      }}
      transform={{
        mode: 'canvas',
        initialScrollMode: 'none',
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:projection
      let:transform
      let:tooltip
    >
      <TransformControls />

      <Canvas>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
            strokeWidth={1 / transform.scale}
            {tooltip}
            onclick={(e) => {
              const geoPath = d3geoPath(projection);

              if (
                selectedStateId === feature.id ||
                !states.features.some((f) => f.id == feature.id) // County selected
              ) {
                selectedStateId = null;
                transform.reset();
              } else {
                selectedStateId = feature.id;
                tooltip.hide();
                let [[left, top], [right, bottom]] = geoPath.bounds(feature);
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
          <GeoPath
            geojson={feature}
            {tooltip}
            strokeWidth={1 / transform.scale}
            class="stroke-surface-content/10 hover:fill-surface-content/10"
            onclick={() => {
              selectedStateId = null;
              transform.reset();
            }}
          />
        {/each}
      </Canvas>

      <!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
      <Canvas pointerEvents={false}>
        {#if tooltip.data}
          <GeoPath
            geojson={tooltip.data}
            strokeWidth={1 / transform.scale}
            class="stroke-surface-content/50 fill-surface-content/20"
          />
        {/if}
      </Canvas>

      <Tooltip.Root let:data>
        {data.properties.name}
        <!-- TODO: How to handle scale (when using canvas and not projection transforms) -->
        <!-- {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List> -->
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
