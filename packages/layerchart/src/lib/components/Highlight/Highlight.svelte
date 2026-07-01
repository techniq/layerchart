<script lang="ts" module>
  export type { HighlightProps, HighlightPropsWithoutHTML, HighlightPoint, HighlightPointData } from './Highlight.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import HighlightSvg from './Highlight.svg.svelte';
  import HighlightCanvas from './Highlight.canvas.svelte';
  import HighlightHtml from './Highlight.html.svelte';
  import type { HighlightProps } from './Highlight.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: HighlightProps = $props();
</script>

{#if layerCtx === 'svg'}
  <HighlightSvg {...props} />
{:else if layerCtx === 'canvas'}
  <HighlightCanvas {...props} />
{:else if layerCtx === 'html'}
  <HighlightHtml {...props} />
{/if}
