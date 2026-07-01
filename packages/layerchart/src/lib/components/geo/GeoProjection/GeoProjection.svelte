<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import { GeoState, type GeoStateProps } from '$lib/states/geo.svelte.js';

  export type GeoProjectionProps = GeoStateProps & {
    children: Snippet;
  };
</script>

<script lang="ts">
  import { setGeoContext } from '$lib/contexts/geo.js';
  import { getChartContext } from '$lib/contexts/chart.js';

  let { children, ...props }: GeoProjectionProps = $props();

  const ctx = getChartContext();

  // Create GeoState instance
  const geoState = new GeoState(() => props);

  // Sync chart dimensions to geo state
  $effect(() => {
    geoState.chartWidth = ctx.width;
    geoState.chartHeight = ctx.height;
  });

  setGeoContext(geoState);
</script>

{@render children()}
