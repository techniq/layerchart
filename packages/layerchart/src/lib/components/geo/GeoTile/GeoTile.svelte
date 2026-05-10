<script lang="ts" module>
  export type { GeoTilePropsWithoutHTML } from './GeoTile.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoTileSvg from './GeoTile.svg.svelte';
  import GeoTileCanvas from './GeoTile.canvas.svelte';
  import type { GeoTilePropsWithoutHTML } from './GeoTile.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoTilePropsWithoutHTML = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoTileSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoTileCanvas {...props} />
{/if}
