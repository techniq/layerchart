<script lang="ts" module>
  export type { CircleClipPathPropsWithoutHTML } from './CircleClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import CircleClipPathSvg from './CircleClipPath.svg.svelte';
  import CircleClipPathCanvas from './CircleClipPath.canvas.svelte';
  import CircleClipPathHtml from './CircleClipPath.html.svelte';
  import type { CircleClipPathPropsWithoutHTML } from './CircleClipPath.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: CircleClipPathPropsWithoutHTML = $props();
</script>

{#if layerCtx === 'svg'}
  <CircleClipPathSvg {...props} />
{:else if layerCtx === 'canvas'}
  <CircleClipPathCanvas {...props} />
{:else if layerCtx === 'html'}
  <CircleClipPathHtml {...props} />
{/if}
