<script lang="ts" module>
  export type {
    AnnotationPointProps,
    AnnotationPointPropsWithoutHTML,
  } from './AnnotationPoint.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import AnnotationPointSvg from './AnnotationPoint.svg.svelte';
  import AnnotationPointCanvas from './AnnotationPoint.canvas.svelte';
  import AnnotationPointHtml from './AnnotationPoint.html.svelte';
  import type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: AnnotationPointProps = $props();
</script>

{#if layerCtx === 'svg'}
  <AnnotationPointSvg {...props} />
{:else if layerCtx === 'canvas'}
  <AnnotationPointCanvas {...props} />
{:else if layerCtx === 'html'}
  <AnnotationPointHtml {...props} />
{/if}
