<script lang="ts" module>
  export type { GeoTileElevation, GeoTileProps } from './GeoTile.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { GeoTile as GeoTileCore } from 'layerchart/geo';
  import GeoTileWebGL from './GeoTile.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof GeoTileWebGL>;
  type CoreProps = ComponentProps<typeof GeoTileCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoTileWebGL {...props} />
{:else}
  <GeoTileCore {...props as CoreProps} />
{/if}
