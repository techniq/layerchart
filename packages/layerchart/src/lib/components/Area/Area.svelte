<script lang="ts" module>
  export type { AreaProps, AreaPropsWithoutHTML } from './Area.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import AreaSvg from './Area.svg.svelte';
  import AreaCanvas from './Area.canvas.svelte';
  import type { AreaProps } from './Area.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: AreaProps = $props();
</script>

{#if layerCtx === 'svg'}
  <AreaSvg {...props} />
{:else if layerCtx === 'canvas'}
  <AreaCanvas {...props} />
{/if}
