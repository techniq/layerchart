<script lang="ts" module>
  export type {
    AnnotationRangeProps,
    AnnotationRangePropsWithoutHTML,
  } from './AnnotationRange.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import AnnotationRangeSvg from './AnnotationRange.svg.svelte';
  import AnnotationRangeCanvas from './AnnotationRange.canvas.svelte';
  import AnnotationRangeHtml from './AnnotationRange.html.svelte';
  import type { AnnotationRangeProps } from './AnnotationRange.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: AnnotationRangeProps = $props();
</script>

{#if layerCtx === 'svg'}
  <AnnotationRangeSvg {...props} />
{:else if layerCtx === 'canvas'}
  <AnnotationRangeCanvas {...props} />
{:else if layerCtx === 'html'}
  <AnnotationRangeHtml {...props} />
{/if}
