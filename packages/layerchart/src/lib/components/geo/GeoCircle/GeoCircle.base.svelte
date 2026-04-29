<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GeoCircleProps } from './GeoCircle.shared.svelte.js';

  export type GeoCircleBaseLayerComponents = {
    GeoPath: Component<any>;
  };

  export type GeoCircleBaseProps = GeoCircleProps & GeoCircleBaseLayerComponents;
</script>

<script lang="ts">
  import { geoCircle } from 'd3-geo';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    GeoPath,
    radius = 90,
    center = [0, 0],
    precision = 6,
    ...restProps
  }: GeoCircleBaseProps = $props();

  const geojson = $derived(geoCircle().radius(radius).center(center).precision(precision)());
</script>

<GeoPath {geojson} {...extractLayerProps(restProps, 'lc-geo-circle')} />
