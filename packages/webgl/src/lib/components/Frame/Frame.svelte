<script lang="ts" module>
  export type { FrameProps } from './Frame.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Frame as FrameCore } from 'layerchart';
  import FrameWebGL from './Frame.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof FrameWebGL>;
  type CoreProps = ComponentProps<typeof FrameCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <FrameWebGL {...props} />
{:else}
  <FrameCore {...props as CoreProps} />
{/if}
