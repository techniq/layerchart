<script lang="ts" module>
  export type { CellProps } from './Cell.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import CellSvg from './Cell.svg.svelte';
  import CellCanvas from './Cell.canvas.svelte';
  import CellHtml from './Cell.html.svelte';
  import type { CellProps } from './Cell.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: CellProps = $props();
</script>

{#if layerCtx === 'svg'}
  <CellSvg {...props} />
{:else if layerCtx === 'canvas'}
  <CellCanvas {...props} />
{:else if layerCtx === 'html'}
  <CellHtml {...props} />
{/if}
