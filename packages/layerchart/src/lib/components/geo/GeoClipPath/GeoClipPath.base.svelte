<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GeoClipPathProps } from './GeoClipPath.shared.svelte.js';

  export type GeoClipPathBaseLayerComponents = {
    ClipPath: Component<any>;
  };

  export type GeoClipPathBaseProps = GeoClipPathProps & GeoClipPathBaseLayerComponents;
</script>

<script lang="ts">
  import { geoPath as d3GeoPath } from 'd3-geo';

  import { createId } from '$lib/utils/createId.js';
  import { getGeoContext } from '$lib/contexts/geo.js';

  const uid = $props.id();

  let {
    ClipPath,
    id = createId('clipPath-', uid),
    geojson,
    disabled = false,
    invert = false,
    children,
  }: GeoClipPathBaseProps = $props();

  const geo = getGeoContext();

  const path = $derived(
    geo.projection && geojson ? d3GeoPath(geo.projection)(geojson) ?? undefined : undefined
  );
</script>

<ClipPath {id} {disabled} {invert} {children} {path} />
