<script lang="ts" module>
  export type GeoVisibleProps = {
    /** Latitude */
    lat: number;
    /** Longitude */
    long: number;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { isVisible } from '$lib/utils/geo.js';
  import type { Snippet } from 'svelte';
  import { getGeoContext } from './GeoContext.svelte';

  let { lat, long, children }: GeoVisibleProps = $props();
  const geoCtx = getGeoContext();
</script>

{#if geoCtx.projection && isVisible(geoCtx.projection)([long, lat])}
  {@render children?.()}
{/if}
