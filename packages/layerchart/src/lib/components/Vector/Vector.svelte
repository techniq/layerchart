<script lang="ts" module>
  export type { VectorProps, VectorPropsWithoutHTML, VectorShape } from './Vector.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import VectorSvg from './Vector.svg.svelte';
  import VectorCanvas from './Vector.canvas.svelte';
  import type { VectorProps } from './Vector.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: VectorProps = $props();
</script>

{#if layerCtx === 'svg'}
  <VectorSvg {...props} />
{:else if layerCtx === 'canvas'}
  <VectorCanvas {...props} />
{/if}
