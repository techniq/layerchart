<script lang="ts" module>
  export type { ContourProps, ContourPropsWithoutHTML } from './Contour.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ContourSvg from './Contour.svg.svelte';
  import ContourCanvas from './Contour.canvas.svelte';
  import type { ContourProps } from './Contour.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: ContourProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ContourSvg {...props} />
{:else if layerCtx === 'canvas'}
  <ContourCanvas {...props} />
{/if}
