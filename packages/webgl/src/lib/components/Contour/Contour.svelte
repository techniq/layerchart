<script lang="ts" module>
  export type { ContourProps } from './Contour.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Contour as ContourCore } from 'layerchart';
  import ContourWebGL from './Contour.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof ContourWebGL>;
  type CoreProps = ComponentProps<typeof ContourCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <ContourWebGL {...props} />
{:else}
  <ContourCore {...props as CoreProps} />
{/if}
