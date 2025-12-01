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
  import { getChartContext } from '$lib/contexts/chart.js';

  let { lat, long, children }: GeoVisibleProps = $props();
  const ctx = getChartContext();
</script>

{#if ctx.geo.projection && isVisible(ctx.geo.projection)([long, lat])}
  {@render children?.()}
{/if}
