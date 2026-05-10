<script lang="ts" module>
  export type { TrailProps, TrailPropsWithoutHTML } from './Trail.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import TrailSvg from './Trail.svg.svelte';
  import TrailCanvas from './Trail.canvas.svelte';
  import type { TrailProps } from './Trail.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: TrailProps = $props();
</script>

{#if layerCtx === 'svg'}
  <TrailSvg {...props} />
{:else if layerCtx === 'canvas'}
  <TrailCanvas {...props} />
{/if}
