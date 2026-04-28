<script lang="ts" module>
  export type { BarProps, BarPropsWithoutHTML } from './Bar.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import BarSvg from './Bar.svg.svelte';
  import BarCanvas from './Bar.canvas.svelte';
  import type { BarProps } from './Bar.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: BarProps = $props();
</script>

{#if layerCtx === 'svg'}
  <BarSvg {...props} />
{:else if layerCtx === 'canvas'}
  <BarCanvas {...props} />
{/if}
