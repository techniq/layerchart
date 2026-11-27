<script lang="ts" module>
  export type { GeoRasterProps } from './GeoRaster.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { GeoRaster as GeoRasterCore } from 'layerchart/geo';
  import GeoRasterWebGL from './GeoRaster.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof GeoRasterWebGL>;
  type CoreProps = ComponentProps<typeof GeoRasterCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoRasterWebGL {...props} />
{:else}
  <GeoRasterCore {...props as CoreProps} />
{/if}
