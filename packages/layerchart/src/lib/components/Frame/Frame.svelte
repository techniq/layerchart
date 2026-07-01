<script lang="ts" module>
  export type { FrameProps, FramePropsWithoutHTML } from './Frame.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import FrameSvg from './Frame.svg.svelte';
  import FrameCanvas from './Frame.canvas.svelte';
  import FrameHtml from './Frame.html.svelte';
  import type { FrameProps } from './Frame.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: FrameProps = $props();
</script>

{#if layerCtx === 'svg'}
  <FrameSvg {...props} />
{:else if layerCtx === 'canvas'}
  <FrameCanvas {...props} />
{:else if layerCtx === 'html'}
  <FrameHtml {...props} />
{/if}
