<script lang="ts" module>
  import type { Snippet } from 'svelte';

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
  import { getGeoContext } from '$lib/contexts/geo.js';

  let { lat, long, children }: GeoVisibleProps = $props();
  const geoCtx = getGeoContext();
</script>

{#if geoCtx.projection && isVisible(geoCtx.projection)([long, lat])}
  {@render children?.()}
{/if}
