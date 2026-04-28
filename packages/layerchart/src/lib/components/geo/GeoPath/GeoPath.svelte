<script lang="ts" module>
  export type { GeoPathProps, GeoPathPropsWithoutHTML } from './GeoPath.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoPathSvg from './GeoPath.svg.svelte';
  import GeoPathCanvas from './GeoPath.canvas.svelte';
  import type { GeoPathProps } from './GeoPath.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoPathProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoPathSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoPathCanvas {...props} />
{/if}
