<script lang="ts" module>
  export type { TileImageProps, TileImagePropsWithoutHTML } from './TileImage.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import TileImageSvg from './TileImage.svg.svelte';
  import TileImageCanvas from './TileImage.canvas.svelte';
  import type { TileImageProps } from './TileImage.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: TileImageProps = $props();
</script>

{#if layerCtx === 'svg'}
  <TileImageSvg {...props} />
{:else if layerCtx === 'canvas'}
  <TileImageCanvas {...props} />
{/if}
