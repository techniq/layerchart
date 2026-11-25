<script lang="ts" module>
  export type { RectProps } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Rect as RectCore } from 'layerchart';
  import RectWebGL from './Rect.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof RectWebGL>;
  type CoreProps = ComponentProps<typeof RectCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <RectWebGL {...props} />
{:else}
  <RectCore {...props as CoreProps} />
{/if}
