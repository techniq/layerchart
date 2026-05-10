<script lang="ts" module>
  export type { GeoClipPathProps, GeoClipPathPropsWithoutHTML } from './GeoClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoClipPathSvg from './GeoClipPath.svg.svelte';
  import GeoClipPathCanvas from './GeoClipPath.canvas.svelte';
  import type { GeoClipPathProps } from './GeoClipPath.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoClipPathProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoClipPathSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoClipPathCanvas {...props} />
{/if}
