<script lang="ts" module>
  export type { ArcProps, ArcPropsWithoutHTML } from './Arc.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ArcSvg from './Arc.svg.svelte';
  import ArcCanvas from './Arc.canvas.svelte';
  import type { ArcProps } from './Arc.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: ArcProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ArcSvg {...props} />
{:else if layerCtx === 'canvas'}
  <ArcCanvas {...props} />
{/if}
