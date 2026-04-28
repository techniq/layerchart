<script lang="ts" module>
  export type { DensityProps, DensityPropsWithoutHTML } from './Density.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import DensitySvg from './Density.svg.svelte';
  import DensityCanvas from './Density.canvas.svelte';
  import type { DensityProps } from './Density.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: DensityProps = $props();
</script>

{#if layerCtx === 'svg'}
  <DensitySvg {...props} />
{:else if layerCtx === 'canvas'}
  <DensityCanvas {...props} />
{/if}
