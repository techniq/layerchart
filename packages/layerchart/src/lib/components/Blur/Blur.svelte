<script lang="ts" module>
  export type { BlurProps, BlurPropsWithoutHTML } from './Blur.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import BlurSvg from './Blur.svg.svelte';
  import BlurCanvas from './Blur.canvas.svelte';
  import BlurHtml from './Blur.html.svelte';
  import type { BlurProps } from './Blur.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: BlurProps = $props();
</script>

{#if layerCtx === 'svg'}
  <BlurSvg {...props} />
{:else if layerCtx === 'canvas'}
  <BlurCanvas {...props} />
{:else if layerCtx === 'html'}
  <BlurHtml {...props} />
{/if}
