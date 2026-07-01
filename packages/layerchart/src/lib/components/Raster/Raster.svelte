<script lang="ts" module>
  export type { RasterProps, RasterPropsWithoutHTML } from './Raster.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import RasterSvg from './Raster.svg.svelte';
  import RasterCanvas from './Raster.canvas.svelte';
  import RasterHtml from './Raster.html.svelte';
  import type { RasterProps } from './Raster.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: RasterProps = $props();
</script>

{#if layerCtx === 'svg'}
  <RasterSvg {...props} />
{:else if layerCtx === 'canvas'}
  <RasterCanvas {...props} />
{:else if layerCtx === 'html'}
  <RasterHtml {...props} />
{/if}
