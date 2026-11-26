<script lang="ts" module>
  export type { AnnotationLineProps } from './AnnotationLine.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { AnnotationLine as AnnotationLineCore } from 'layerchart';
  import AnnotationLineWebGL from './AnnotationLine.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof AnnotationLineWebGL>;
  type CoreProps = ComponentProps<typeof AnnotationLineCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <AnnotationLineWebGL {...props} />
{:else}
  <AnnotationLineCore {...props as CoreProps} />
{/if}
