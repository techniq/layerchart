<script lang="ts" module>
  export type { HullProps, HullPropsWithoutHTML } from './Hull.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import HullSvg from './Hull.svg.svelte';
  import HullCanvas from './Hull.canvas.svelte';
  import type { HullProps } from './Hull.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: HullProps = $props();
</script>

{#if layerCtx === 'svg'}
  <HullSvg {...props} />
{:else if layerCtx === 'canvas'}
  <HullCanvas {...props} />
{/if}
