<script lang="ts" module>
  export type { GeoSplineProps, GeoSplinePropsWithoutHTML } from './GeoSpline.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoSplineSvg from './GeoSpline.svg.svelte';
  import GeoSplineCanvas from './GeoSpline.canvas.svelte';
  import type { GeoSplineProps } from './GeoSpline.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoSplineProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoSplineSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoSplineCanvas {...props} />
{/if}
