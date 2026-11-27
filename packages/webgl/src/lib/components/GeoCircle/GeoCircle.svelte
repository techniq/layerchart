<script lang="ts" module>
  export type { GeoCircleProps } from 'layerchart/geo';
</script>

<script lang="ts">
  import { GeoCircle as GeoCircleCore, type GeoCircleProps } from 'layerchart/geo';
  import GeoCircleWebGL from './GeoCircle.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: GeoCircleProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoCircleWebGL {...props} />
{:else}
  <GeoCircleCore {...props} />
{/if}
