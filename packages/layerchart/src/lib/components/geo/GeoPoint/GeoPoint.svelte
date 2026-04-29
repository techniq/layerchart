<script lang="ts" module>
  export type { GeoPointProps, GeoPointPropsWithoutHTML } from './GeoPoint.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoPointSvg from './GeoPoint.svg.svelte';
  import GeoPointCanvas from './GeoPoint.canvas.svelte';
  import type { GeoPointProps } from './GeoPoint.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoPointProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoPointSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoPointCanvas {...props} />
{/if}
