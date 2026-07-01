<script lang="ts" module>
  export type { RectClipPathProps, RectClipPathPropsWithoutHTML } from './RectClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import RectClipPathSvg from './RectClipPath.svg.svelte';
  import RectClipPathCanvas from './RectClipPath.canvas.svelte';
  import RectClipPathHtml from './RectClipPath.html.svelte';
  import type { RectClipPathProps } from './RectClipPath.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: RectClipPathProps = $props();
</script>

{#if layerCtx === 'svg'}
  <RectClipPathSvg {...props} />
{:else if layerCtx === 'canvas'}
  <RectClipPathCanvas {...props} />
{:else if layerCtx === 'html'}
  <RectClipPathHtml {...props} />
{/if}
