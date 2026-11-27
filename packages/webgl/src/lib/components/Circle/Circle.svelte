<script lang="ts" module>
  export type { CircleProps } from './Circle.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Circle as CircleCore } from 'layerchart';
  import CircleWebGL from './Circle.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof CircleWebGL>;
  type CoreProps = ComponentProps<typeof CircleCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <CircleWebGL {...props} />
{:else}
  <CircleCore {...props as CoreProps} />
{/if}
