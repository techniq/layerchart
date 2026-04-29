<script lang="ts" module>
  export type { GeoCircleProps, GeoCirclePropsWithoutHTML } from './GeoCircle.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GeoCircleSvg from './GeoCircle.svg.svelte';
  import GeoCircleCanvas from './GeoCircle.canvas.svelte';
  import type { GeoCircleProps } from './GeoCircle.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: GeoCircleProps = $props();
</script>

{#if layerCtx === 'svg'}
  <GeoCircleSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GeoCircleCanvas {...props} />
{/if}
