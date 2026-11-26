<script lang="ts" module>
  export type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { AnnotationPoint as AnnotationPointCore } from 'layerchart';
  import AnnotationPointWebGL from './AnnotationPoint.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof AnnotationPointWebGL>;
  type CoreProps = ComponentProps<typeof AnnotationPointCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <AnnotationPointWebGL {...props} />
{:else}
  <AnnotationPointCore {...props as CoreProps} />
{/if}
