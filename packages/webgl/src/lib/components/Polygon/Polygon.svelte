<script lang="ts" module>
  export type { PolygonProps } from './Polygon.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Polygon as PolygonCore } from 'layerchart';
  import PolygonWebGL from './Polygon.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof PolygonWebGL>;
  type CoreProps = ComponentProps<typeof PolygonCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <PolygonWebGL {...props} />
{:else}
  <PolygonCore {...props as CoreProps} />
{/if}
