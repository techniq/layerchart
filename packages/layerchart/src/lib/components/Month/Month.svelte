<script lang="ts" module>
  export type {
    MonthProps,
    MonthPropsWithoutHTML,
    MonthCell,
  } from './Month.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import MonthSvg from './Month.svg.svelte';
  import MonthCanvas from './Month.canvas.svelte';
  import type { MonthPropsWithoutHTML } from './Month.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: MonthPropsWithoutHTML = $props();
</script>

{#if layerCtx === 'svg'}
  <MonthSvg {...props} />
{:else if layerCtx === 'canvas'}
  <MonthCanvas {...props} />
{/if}
