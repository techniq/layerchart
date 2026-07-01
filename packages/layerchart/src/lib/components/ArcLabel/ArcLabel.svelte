<script lang="ts" module>
  export type {
    ArcLabelProps,
    ArcLabelConfig,
    ArcLabelPlacement,
  } from './ArcLabel.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ArcLabelSvg from './ArcLabel.svg.svelte';
  import ArcLabelCanvas from './ArcLabel.canvas.svelte';
  import type { ArcLabelProps } from './ArcLabel.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: ArcLabelProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ArcLabelSvg {...props} />
{:else if layerCtx === 'canvas'}
  <ArcLabelCanvas {...props} />
{/if}
