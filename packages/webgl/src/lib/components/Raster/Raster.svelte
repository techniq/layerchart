<script lang="ts" module>
  export type { RasterProps } from './Raster.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Raster as RasterCore } from 'layerchart';
  import RasterWebGL from './Raster.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof RasterWebGL>;
  type CoreProps = ComponentProps<typeof RasterCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <RasterWebGL {...props} />
{:else}
  <RasterCore {...props as CoreProps} />
{/if}
