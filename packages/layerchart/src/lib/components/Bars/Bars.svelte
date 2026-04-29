<script lang="ts" module>
  export type { BarsProps, BarsPropsWithoutHTML } from './Bars.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import BarsSvg from './Bars.svg.svelte';
  import BarsCanvas from './Bars.canvas.svelte';
  import BarsHtml from './Bars.html.svelte';
  import type { BarsProps } from './Bars.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: BarsProps = $props();
</script>

{#if layerCtx === 'svg'}
  <BarsSvg {...props} />
{:else if layerCtx === 'canvas'}
  <BarsCanvas {...props} />
{:else if layerCtx === 'html'}
  <BarsHtml {...props} />
{/if}
