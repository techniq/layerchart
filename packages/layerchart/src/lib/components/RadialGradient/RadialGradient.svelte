<script lang="ts" module>
  export type {
    RadialGradientProps,
    RadialGradientPropsWithoutHTML,
  } from './RadialGradient.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import RadialGradientSvg from './RadialGradient.svg.svelte';
  import RadialGradientCanvas from './RadialGradient.canvas.svelte';
  import type { RadialGradientProps } from './RadialGradient.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: RadialGradientProps = $props();
</script>

{#if layerCtx === 'svg'}
  <RadialGradientSvg {...props} />
{:else if layerCtx === 'canvas'}
  <RadialGradientCanvas {...props} />
{/if}
