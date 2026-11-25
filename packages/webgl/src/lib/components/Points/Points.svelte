<script lang="ts" module>
  export type { PointsProps } from './Points.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Points as PointsCore } from 'layerchart';
  import PointsWebGL from './Points.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof PointsWebGL>;
  type CoreProps = ComponentProps<typeof PointsCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <PointsWebGL {...props} />
{:else}
  <PointsCore {...props as CoreProps} />
{/if}
