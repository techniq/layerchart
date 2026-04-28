<script lang="ts" module>
  export type { PieProps, PiePropsWithoutHTML } from './Pie.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import PieSvg from './Pie.svg.svelte';
  import PieCanvas from './Pie.canvas.svelte';
  import type { PieProps } from './Pie.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: PieProps = $props();
</script>

{#if layerCtx === 'svg'}
  <PieSvg {...props} />
{:else if layerCtx === 'canvas'}
  <PieCanvas {...props} />
{/if}
