<script lang="ts" module>
  export type { ThresholdProps, ThresholdSnippetProps } from './Threshold.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ThresholdSvg from './Threshold.svg.svelte';
  import ThresholdCanvas from './Threshold.canvas.svelte';
  import type { ThresholdProps } from './Threshold.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: ThresholdProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ThresholdSvg {...props} />
{:else if layerCtx === 'canvas'}
  <ThresholdCanvas {...props} />
{/if}
