<script lang="ts" module>
  export type {
    CalendarProps,
    CalendarPropsWithoutHTML,
    CalendarCell,
  } from './Calendar.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import CalendarSvg from './Calendar.svg.svelte';
  import CalendarCanvas from './Calendar.canvas.svelte';
  import type { CalendarPropsWithoutHTML } from './Calendar.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: CalendarPropsWithoutHTML = $props();
</script>

{#if layerCtx === 'svg'}
  <CalendarSvg {...props} />
{:else if layerCtx === 'canvas'}
  <CalendarCanvas {...props} />
{/if}
