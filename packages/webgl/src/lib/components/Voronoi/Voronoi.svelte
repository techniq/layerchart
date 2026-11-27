<script lang="ts" module>
  export type { VoronoiProps } from 'layerchart';
</script>

<script lang="ts">
  import { Voronoi as VoronoiCore, type VoronoiProps } from 'layerchart';
  import VoronoiWebGL from './Voronoi.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: VoronoiProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <VoronoiWebGL {...props} />
{:else}
  <VoronoiCore {...props} />
{/if}
