<script lang="ts" module>
  export type { GraticuleProps, GraticulePropsWithoutHTML } from './Graticule.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GraticuleSvg from './Graticule.svg.svelte';
  import GraticuleCanvas from './Graticule.canvas.svelte';
  import type { GraticuleProps } from './Graticule.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GraticuleProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GraticuleSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GraticuleCanvas {...props} />
{/if}
