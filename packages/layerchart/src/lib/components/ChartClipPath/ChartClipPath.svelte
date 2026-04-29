<script lang="ts" module>
  export type { ChartClipPathProps, ChartClipPathPropsWithoutHTML } from './ChartClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ChartClipPathSvg from './ChartClipPath.svg.svelte';
  import ChartClipPathCanvas from './ChartClipPath.canvas.svelte';
  import ChartClipPathHtml from './ChartClipPath.html.svelte';
  import type { ChartClipPathProps } from './ChartClipPath.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: ChartClipPathProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ChartClipPathSvg {...props} />
{:else if layerCtx === 'canvas'}
  <ChartClipPathCanvas {...props} />
{:else if layerCtx === 'html'}
  <ChartClipPathHtml {...props} />
{/if}
