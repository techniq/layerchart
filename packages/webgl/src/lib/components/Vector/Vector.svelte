<script lang="ts" module>
  export type { VectorProps } from './Vector.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Vector as VectorCore } from 'layerchart';
  import VectorWebGL from './Vector.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof VectorWebGL>;
  type CoreProps = ComponentProps<typeof VectorCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <VectorWebGL {...props} />
{:else}
  <VectorCore {...props as CoreProps} />
{/if}
