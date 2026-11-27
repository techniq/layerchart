<script lang="ts" module>
  export type { ChartClipPathProps } from 'layerchart';
</script>

<script lang="ts">
  import { ChartClipPath as ChartClipPathCore, type ChartClipPathProps } from 'layerchart';
  import ChartClipPathWebGL from './ChartClipPath.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: ChartClipPathProps = $props();

  // Passed through inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <ChartClipPathWebGL {...props} />
{:else}
  <ChartClipPathCore {...props} />
{/if}
