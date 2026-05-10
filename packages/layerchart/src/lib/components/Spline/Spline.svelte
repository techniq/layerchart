<script lang="ts" module>
  export type { SplineProps, SplinePropsWithoutHTML } from './Spline.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import SplineSvg from './Spline.svg.svelte';
  import SplineCanvas from './Spline.canvas.svelte';
  import type { SplineProps } from './Spline.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: SplineProps = $props();
</script>

{#if layerCtx === 'svg'}
  <SplineSvg {...props} />
{:else if layerCtx === 'canvas'}
  <SplineCanvas {...props} />
{/if}
