<script lang="ts" module>
  // Re-export types from the shared module so existing
  // `import type { CircleProps } from 'layerchart'` keeps working.
  export type {
    CircleProps,
    CirclePropsWithoutHTML,
  } from './Circle.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import CircleSvg from './Circle.svg.svelte';
  import CircleCanvas from './Circle.canvas.svelte';
  import CircleHtml from './Circle.html.svelte';
  import type { CircleProps } from './Circle.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: CircleProps = $props();
</script>

{#if layerCtx === 'svg'}
  <CircleSvg {...props} />
{:else if layerCtx === 'canvas'}
  <CircleCanvas {...props} />
{:else if layerCtx === 'html'}
  <CircleHtml {...props} />
{/if}
