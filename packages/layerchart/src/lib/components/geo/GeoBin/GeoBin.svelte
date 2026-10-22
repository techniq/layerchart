<script lang="ts" module>
  export type { GeoBinProps, GeoBinPropsWithoutHTML } from './GeoBin.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoBinSvg from './GeoBin.svg.svelte';
  import GeoBinCanvas from './GeoBin.canvas.svelte';
  import type { GeoBinProps } from './GeoBin.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoBinProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoBinSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoBinCanvas {...props} />
{/if}
