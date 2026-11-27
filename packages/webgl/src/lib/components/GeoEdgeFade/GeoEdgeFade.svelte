<script lang="ts" module>
  export type { GeoEdgeFadeProps } from 'layerchart/geo';
</script>

<script lang="ts">
  import { GeoEdgeFade as GeoEdgeFadeCore, type GeoEdgeFadeProps } from 'layerchart/geo';
  import GeoEdgeFadeWebGL from './GeoEdgeFade.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: GeoEdgeFadeProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoEdgeFadeWebGL {...props} />
{:else}
  <GeoEdgeFadeCore {...props} />
{/if}
