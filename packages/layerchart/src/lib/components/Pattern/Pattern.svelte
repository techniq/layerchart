<script lang="ts" module>
  export type {
    PatternProps,
    PatternPropsWithoutHTML,
    PatternShape,
    CircleShape,
    LineShape,
  } from './Pattern.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import PatternSvg from './Pattern.svg.svelte';
  import PatternCanvas from './Pattern.canvas.svelte';
  import PatternHtml from './Pattern.html.svelte';
  import type { PatternProps } from './Pattern.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: PatternProps = $props();
</script>

{#if layerCtx === 'svg'}
  <PatternSvg {...props} />
{:else if layerCtx === 'canvas'}
  <PatternCanvas {...props} />
{:else if layerCtx === 'html'}
  <PatternHtml {...props} />
{/if}
