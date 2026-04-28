<script lang="ts" module>
  export type { LinkProps, LinkPropsWithoutHTML } from './Link.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import LinkSvg from './Link.svg.svelte';
  import LinkCanvas from './Link.canvas.svelte';
  import type { LinkProps } from './Link.shared.svelte.js';

  const layerCtx = getLayerContext();

  let { pathRef = $bindable(), ...rest }: LinkProps = $props();
</script>

{#if layerCtx === 'svg'}
  <LinkSvg bind:pathRef {...rest} />
{:else if layerCtx === 'canvas'}
  <LinkCanvas {...rest} />
{/if}
