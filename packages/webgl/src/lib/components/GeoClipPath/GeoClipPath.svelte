<script lang="ts" module>
  export type { GeoClipPathProps } from 'layerchart/geo';
</script>

<script lang="ts">
  import { GeoClipPath as GeoClipPathCore, type GeoClipPathProps } from 'layerchart/geo';
  import GeoClipPathWebGL from './GeoClipPath.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: GeoClipPathProps = $props();

  // The WebGL version inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoClipPathWebGL {...props} />
{:else}
  <GeoClipPathCore {...props} />
{/if}
