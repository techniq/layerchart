<script lang="ts" module>
  export type { GridProps, GridPropsWithoutHTML } from './Grid.shared.svelte.js';
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import GridSvg from './Grid.svg.svelte';
  import GridCanvas from './Grid.canvas.svelte';
  import GridHtml from './Grid.html.svelte';
  import type { GridProps } from './Grid.shared.svelte.js';
  import type { Transition } from '$lib/utils/types.js';

  const layerCtx = getLayerContext();

  let props: GridProps<T> = $props();
</script>

{#if layerCtx === 'svg'}
  <GridSvg {...props} />
{:else if layerCtx === 'canvas'}
  <GridCanvas {...props} />
{:else if layerCtx === 'html'}
  <GridHtml {...props} />
{/if}
