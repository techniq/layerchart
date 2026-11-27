<script lang="ts" module>
  export type { AnnotationRangeProps } from 'layerchart';
</script>

<script lang="ts">
  import { AnnotationRange as AnnotationRangeCore, type AnnotationRangeProps } from 'layerchart';
  import AnnotationRangeWebGL from './AnnotationRange.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: AnnotationRangeProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <AnnotationRangeWebGL {...props} />
{:else}
  <AnnotationRangeCore {...props} />
{/if}
