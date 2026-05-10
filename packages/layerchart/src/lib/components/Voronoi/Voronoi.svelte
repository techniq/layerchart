<script lang="ts" module>
  export type { VoronoiProps, VoronoiPropsWithoutHTML } from './Voronoi.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import VoronoiSvg from './Voronoi.svg.svelte';
  import VoronoiCanvas from './Voronoi.canvas.svelte';
  import type { VoronoiProps } from './Voronoi.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: VoronoiProps = $props();
</script>

{#if layerCtx === 'svg'}
  <VoronoiSvg {...props} />
{:else if layerCtx === 'canvas'}
  <VoronoiCanvas {...props} />
{/if}
