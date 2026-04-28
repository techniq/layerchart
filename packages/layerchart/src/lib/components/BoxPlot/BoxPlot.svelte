<script lang="ts" module>
  export type { BoxPlotProps, BoxPlotPropsWithoutHTML } from './BoxPlot.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import BoxPlotSvg from './BoxPlot.svg.svelte';
  import BoxPlotCanvas from './BoxPlot.canvas.svelte';
  import type { BoxPlotProps } from './BoxPlot.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: BoxPlotProps = $props();
</script>

{#if layerCtx === 'svg'}
  <BoxPlotSvg {...props} />
{:else if layerCtx === 'canvas'}
  <BoxPlotCanvas {...props} />
{/if}
