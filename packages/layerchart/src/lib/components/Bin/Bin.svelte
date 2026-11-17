<script lang="ts" module>
  export type {
    BinCell,
    BinGrid,
    BinProps,
    BinPropsWithoutHTML,
    BinShape,
  } from './Bin.shared.svelte.js';
  // The binning itself, for marks drawing cells in other ways (ex. `@layerchart/webgl`'s `Bin`)
  export { binCells, binGrid } from './Bin.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import BinSvg from './Bin.svg.svelte';
  import BinCanvas from './Bin.canvas.svelte';
  import type { BinProps } from './Bin.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: BinProps = $props();
</script>

{#if layerCtx === 'svg'}
  <BinSvg {...props} />
{:else if layerCtx === 'canvas'}
  <BinCanvas {...props} />
{/if}
