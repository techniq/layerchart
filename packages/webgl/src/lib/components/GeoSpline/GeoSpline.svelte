<script lang="ts" module>
  export type { GeoSplineProps } from 'layerchart/geo';
</script>

<script lang="ts">
  import { GeoSpline as GeoSplineCore, type GeoSplineProps } from 'layerchart/geo';
  import GeoSplineWebGL from './GeoSpline.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: GeoSplineProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoSplineWebGL {...props} />
{:else}
  <GeoSplineCore {...props} />
{/if}
