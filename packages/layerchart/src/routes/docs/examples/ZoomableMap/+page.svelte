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

  let { data } = $props();

  let projection = $state(geoAlbersUsa);
  const projections = [
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Mercator', value: geoMercator },
  ];

  const counties = feature(data.geojson, data.geojson.objects.counties);
  const states = feature(data.geojson, data.geojson.objects.states);

  const contiguousStates = $derived({
    ...states,
    features: states.features.filter((d) => {
      // Contiguous states
      return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
    }),
  });

  let selectedStateId: GeometryObjectA['id'] | null = $state(null);
  const selectedCountiesFeatures = $derived(
    selectedStateId
      ? counties.features.filter((f) => (f.id as string).slice(0, 2) === selectedStateId)
      : []
  );
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
    >
      {#snippet children({ context, transformContext, geoContext, tooltipContext })}
        <TransformControls />

        <Svg>
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
              {tooltipContext}
              onclick={() => {
                if (selectedStateId === feature.id) {
                  selectedStateId = null;
                  transformContext.reset();
                } else {
                  selectedStateId = feature.id;
                  if (geoContext.projection) {
                    const featureTransform = geoFitObjectTransform(
                      geoContext.projection,
                      [context.width, context.height],
                      feature
                    );
                    transformContext.setTranslate(featureTransform.translate);
                    transformContext.setScale(featureTransform.scale);
                  }
                }
              }}
            />
          {/each}

          {#each selectedCountiesFeatures as feature (feature.id)}
            <g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}>
              <GeoPath
                geojson={feature}
                {tooltipContext}
                class="stroke-surface-content/10 hover:stroke-surface-content/50 hover:fill-surface-content/10"
                onclick={() => {
                  selectedStateId = null;
                  transformContext.reset();
                }}
              />
            </g>
          {/each}
        </Svg>

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const [longitude, latitude] =
              geoContext.projection?.invert?.([tooltipContext.x, tooltipContext.y]) ?? []}
            <Tooltip.Header>{data.properties.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="longitude" value={longitude} format="decimal" />
              <Tooltip.Item label="latitude" value={latitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
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
    >
      {#snippet children({ geoContext, tooltipContext, transformContext })}
        <TransformControls />

        <Svg>
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
              strokeWidth={1 / transformContext.scale}
              {tooltipContext}
              onclick={(e, geoPath) => {
                if (selectedStateId === feature.id) {
                  selectedStateId = null;
                  transformContext.reset();
                } else {
                  selectedStateId = feature.id;
                  if (!geoPath) return;
                  const [[left, top], [right, bottom]] = geoPath.bounds(feature);
                  const width = right - left;
                  const height = bottom - top;
                  const x = (left + right) / 2;
                  const y = (top + bottom) / 2;
                  const padding = 20;
                  transformContext.zoomTo(
                    { x, y },
                    { width: width + padding, height: height + padding }
                  );
                }
              }}
            />
          {/each}

          {#each selectedCountiesFeatures as feature (feature.id)}
            <g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}>
              <GeoPath
                geojson={feature}
                {tooltipContext}
                strokeWidth={1 / transformContext.scale}
                class="stroke-surface-content/10 hover:stroke-surface-content/50 hover:fill-surface-content/10"
                onclick={() => {
                  selectedStateId = null;
                  transformContext.reset();
                }}
              />
            </g>
          {/each}
        </Svg>

        <Tooltip.Root>
          {#snippet children({ data })}
            {data.properties.name}
            <!-- TODO: How to handle scale (when using canvas and not projection transforms) -->
            <!-- {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List> -->
          {/snippet}
        </Tooltip.Root>
      {/snippet}
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
    >
      {#snippet children({ context, geoContext, tooltipContext, transformContext })}
        <TransformControls />

        <Canvas>
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="stroke-surface-content fill-surface-100"
              {tooltipContext}
              onclick={(e, geoPath) => {
                if (
                  selectedStateId === feature.id ||
                  !states.features.some((f) => f.id == feature.id) // County selected
                ) {
                  selectedStateId = null;
                  transformContext.reset();
                } else {
                  selectedStateId = feature.id;
                  tooltipContext.hide();
                  if (!geoContext.projection) return;
                  const featureTransform = geoFitObjectTransform(
                    geoContext.projection,
                    [context.width, context.height],
                    feature
                  );
                  transformContext.setTranslate(featureTransform.translate);
                  transformContext.setScale(featureTransform.scale);
                }
              }}
            />
          {/each}

          {#each selectedCountiesFeatures as feature (feature.id)}
            <GeoPath
              geojson={feature}
              {tooltipContext}
              class="stroke-surface-content/10 hover:fill-surface-content/10"
              onclick={() => {
                selectedStateId = null;
                transformContext.reset();
              }}
            />
          {/each}
        </Canvas>

        <Canvas pointerEvents={false}>
          {#if tooltipContext.data}
            <GeoPath
              geojson={tooltipContext.data}
              strokeWidth={1 / transformContext.scale}
              class="stroke-surface-content/50 fill-surface-content/20"
            />
          {/if}
        </Canvas>

        <Tooltip.Root>
          {#snippet children({ data })}
            {@const [longitude, latitude] =
              geoContext.projection?.invert?.([tooltipContext.x, tooltipContext.y]) ?? []}
            <Tooltip.Header>{data.properties.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="longitude" value={longitude} format="decimal" />
              <Tooltip.Item label="latitude" value={latitude} format="decimal" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Canvas (canvas transform)</h2>

<!-- TODO: zoomable tooltip is off-->

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
    >
      {#snippet children({ geoContext, transformContext, tooltipContext })}
        <TransformControls />

        <Canvas>
          {#each states.features as feature, i (i)}
            <GeoPath
              geojson={feature}
              class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
              strokeWidth={1 / transformContext.scale}
              {tooltipContext}
              onclick={(e) => {
                if (!geoContext.projection) return;
                const geoPath = d3geoPath(geoContext.projection);

                if (
                  selectedStateId === feature.id ||
                  !states.features.some((f) => f.id == feature.id) // County selected
                ) {
                  selectedStateId = null;
                  transformContext.reset();
                } else {
                  selectedStateId = feature.id;
                  tooltipContext.hide();
                  let [[left, top], [right, bottom]] = geoPath.bounds(feature);
                  let width = right - left;
                  let height = bottom - top;
                  let x = (left + right) / 2;
                  let y = (top + bottom) / 2;
                  const padding = 20;

                  transformContext.zoomTo(
                    { x, y },
                    { width: width + padding, height: height + padding }
                  );
                }
              }}
            />
          {/each}

          {#each selectedCountiesFeatures as feature (feature.id)}
            <GeoPath
              geojson={feature}
              {tooltipContext}
              strokeWidth={1 / transformContext.scale}
              class="stroke-surface-content/10 hover:fill-surface-content/10"
              onclick={() => {
                selectedStateId = null;
                transformContext.reset();
              }}
            />
          {/each}
        </Canvas>

        <!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
        <Canvas pointerEvents={false}>
          {#if tooltipContext.data}
            <GeoPath
              geojson={tooltipContext.data}
              strokeWidth={1 / transformContext.scale}
              class="stroke-surface-content/50 fill-surface-content/20"
            />
          {/if}
        </Canvas>

        <Tooltip.Root>
          {tooltipContext.data.properties.name}
          <!-- TODO: How to handle scale (when using canvas and not projection transforms) -->
          <!-- {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List> -->
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
