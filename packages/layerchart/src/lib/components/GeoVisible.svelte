<script lang="ts">
  import { geoContext } from './GeoContext.svelte';
  import { isVisible } from '$lib/utils/geo.js';

  /** Latitude */
  export let lat: number;
  /** Longitude */
  export let long: number;

  const geo = geoContext();
</script>

{#if isVisible($geo)([long, lat])}
  <slot />
{/if}
