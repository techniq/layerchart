<script lang="ts" module>
  export type { GeoPointProps } from './GeoPoint.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { GeoPoint as GeoPointCore } from 'layerchart/geo';
  import GeoPointWebGL from './GeoPoint.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof GeoPointWebGL>;
  type CoreProps = ComponentProps<typeof GeoPointCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoPointWebGL {...props} />
{:else}
  <GeoPointCore {...props as CoreProps} />
{/if}
