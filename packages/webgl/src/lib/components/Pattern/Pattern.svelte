<script lang="ts" module>
  export type { PatternProps } from 'layerchart';
</script>

<script lang="ts">
  import { Pattern as PatternCore, type PatternProps } from 'layerchart';
  import PatternWebGL from './Pattern.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: PatternProps = $props();

  // The scene's pattern inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <PatternWebGL {...props} />
{:else}
  <PatternCore {...props} />
{/if}
