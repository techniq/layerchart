<script lang="ts" module>
  export type { BrushProps } from './Brush.base.svelte';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import BrushSvg from './Brush.svg.svelte';
  import BrushCanvas from './Brush.canvas.svelte';
  import BrushHtml from './Brush.html.svelte';
  import type { BrushProps } from './Brush.base.svelte';

  let { state: stateProp = $bindable(), ...rest }: BrushProps = $props();

  const layerCtx = getLayerContext();
</script>

{#if layerCtx === 'canvas'}
  <BrushCanvas bind:state={stateProp} {...rest} />
{:else if layerCtx === 'html'}
  <BrushHtml bind:state={stateProp} {...rest} />
{:else}
  <BrushSvg bind:state={stateProp} {...rest} />
{/if}
