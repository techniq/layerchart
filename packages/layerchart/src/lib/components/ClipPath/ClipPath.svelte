<script lang="ts" module>
  export type { ClipPathProps, ClipPathPropsWithoutHTML } from './ClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ClipPathSvg from './ClipPath.svg.svelte';
  import ClipPathCanvas from './ClipPath.canvas.svelte';
  import ClipPathHtml from './ClipPath.html.svelte';
  import type { ClipPathProps } from './ClipPath.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: ClipPathProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ClipPathSvg {...props} />
{:else if layerCtx === 'canvas'}
  <ClipPathCanvas {...props} />
{:else if layerCtx === 'html'}
  <ClipPathHtml {...props} />
{/if}
