<script lang="ts" module>
  export type {
    ImageProps,
    ImagePropsWithoutHTML,
  } from './Image.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import ImageSvg from './Image.svg.svelte';
  import ImageCanvas from './Image.canvas.svelte';
  import ImageHtml from './Image.html.svelte';
  import type { ImageProps } from './Image.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { ref = $bindable(), ...rest }: ImageProps = $props();
</script>

{#if layerCtx === 'svg'}
  <ImageSvg bind:ref {...rest} />
{:else if layerCtx === 'canvas'}
  <ImageCanvas {...rest} />
{:else if layerCtx === 'html'}
  <ImageHtml {...rest} />
{/if}
