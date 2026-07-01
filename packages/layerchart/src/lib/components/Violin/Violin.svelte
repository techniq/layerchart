<script lang="ts" module>
  export type { ViolinProps, ViolinPropsWithoutHTML } from './Violin.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ViolinSvg from './Violin.svg.svelte';
  import ViolinCanvas from './Violin.canvas.svelte';
  import type { ViolinProps } from './Violin.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: ViolinProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ViolinSvg {...props} />
{:else if layerCtx === 'canvas'}
  <ViolinCanvas {...props} />
{/if}
