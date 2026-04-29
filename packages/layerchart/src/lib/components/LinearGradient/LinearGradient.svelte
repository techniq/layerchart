<script lang="ts" module>
  export type {
    LinearGradientProps,
    LinearGradientPropsWithoutHTML,
  } from './LinearGradient.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import LinearGradientSvg from './LinearGradient.svg.svelte';
  import LinearGradientCanvas from './LinearGradient.canvas.svelte';
  import LinearGradientHtml from './LinearGradient.html.svelte';
  import type { LinearGradientProps } from './LinearGradient.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { ref = $bindable(), ...rest }: LinearGradientProps = $props();
</script>

{#if layerCtx === 'svg'}
  <LinearGradientSvg bind:ref {...rest} />
{:else if layerCtx === 'canvas'}
  <LinearGradientCanvas {...rest} />
{:else if layerCtx === 'html'}
  <LinearGradientHtml {...rest} />
{/if}
