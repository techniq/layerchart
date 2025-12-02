<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import { GeoState, type GeoStateProps } from '$lib/states/geo.svelte.js';

  export type GeoProjectionProps = GeoStateProps & {
    children: Snippet;
  };
</script>

<script lang="ts">
  import { setGeoContext } from '$lib/contexts/geo.js';
  import { getTransformContext } from '$lib/contexts/transform.js';
  import { getChartContext } from '$lib/contexts/chart.js';

  let { children, ...props }: GeoProjectionProps = $props();

  const chartCtx = getChartContext();
  const transformCtx = getTransformContext();

  // Create GeoState instance
  const geoState = new GeoState(() => props);

  // Sync chart dimensions to geo state
  $effect(() => {
    geoState.chartWidth = chartCtx.width;
    geoState.chartHeight = chartCtx.height;
  });

  // Sync transform context to geo state
  $effect(() => {
    geoState.transformScale = transformCtx.scale;
    geoState.transformTranslateX = transformCtx.translate.x;
    geoState.transformTranslateY = transformCtx.translate.y;
  });

  setGeoContext(geoState);
</script>

{@render children()}
