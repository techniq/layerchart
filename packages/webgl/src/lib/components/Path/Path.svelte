<script lang="ts" module>
  export type { PathProps } from './Path.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Path as PathCore } from 'layerchart';
  import PathWebGL from './Path.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof PathWebGL>;
  type CoreProps = ComponentProps<typeof PathCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <PathWebGL {...props} />
{:else}
  <PathCore {...props as CoreProps} />
{/if}
