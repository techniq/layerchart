<script lang="ts" module>
  export type { RibbonProps, RibbonPropsWithoutHTML } from './Ribbon.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import RibbonSvg from './Ribbon.svg.svelte';
  import RibbonCanvas from './Ribbon.canvas.svelte';
  import type { RibbonProps } from './Ribbon.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: RibbonProps = $props();
</script>

{#if layerCtx === 'svg'}
  <RibbonSvg {...props} />
{:else if layerCtx === 'canvas'}
  <RibbonCanvas {...props} />
{/if}
