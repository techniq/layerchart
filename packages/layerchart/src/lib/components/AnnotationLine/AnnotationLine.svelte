<script lang="ts" module>
  export type {
    AnnotationLineProps,
    AnnotationLinePropsWithoutHTML,
  } from './AnnotationLine.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import AnnotationLineSvg from './AnnotationLine.svg.svelte';
  import AnnotationLineCanvas from './AnnotationLine.canvas.svelte';
  import type { AnnotationLineProps } from './AnnotationLine.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: AnnotationLineProps = $props();
</script>

{#if layerCtx === 'svg'}
  <AnnotationLineSvg {...props} />
{:else if layerCtx === 'canvas'}
  <AnnotationLineCanvas {...props} />
{/if}
