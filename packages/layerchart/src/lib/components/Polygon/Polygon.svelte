<script lang="ts" module>
  export type {
    PolygonProps,
    PolygonPropsWithoutHTML,
  } from './Polygon.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import PolygonSvg from './Polygon.svg.svelte';
  import PolygonCanvas from './Polygon.canvas.svelte';
  import type { PolygonProps } from './Polygon.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { ref = $bindable(), ...rest }: PolygonProps = $props();
</script>

{#if layerCtx === 'svg'}
  <PolygonSvg bind:ref {...rest} />
{:else if layerCtx === 'canvas'}
  <PolygonCanvas {...rest} />
{/if}
