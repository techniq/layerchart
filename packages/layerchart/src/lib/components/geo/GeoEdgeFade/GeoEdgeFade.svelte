<script lang="ts" module>
  export type { GeoEdgeFadeProps, GeoEdgeFadePropsWithoutHTML } from './GeoEdgeFade.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoEdgeFadeSvg from './GeoEdgeFade.svg.svelte';
  import GeoEdgeFadeCanvas from './GeoEdgeFade.canvas.svelte';
  import type { GeoEdgeFadeProps } from './GeoEdgeFade.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoEdgeFadeProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoEdgeFadeSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoEdgeFadeCanvas {...props} />
{/if}
