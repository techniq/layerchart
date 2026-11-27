<script lang="ts" module>
  export type { ClipPathProps } from 'layerchart';
</script>

<script lang="ts">
  import { ClipPath as ClipPathCore, type ClipPathProps } from 'layerchart';
  import ClipPathWebGL from './ClipPath.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: ClipPathProps = $props();

  // The WebGL version inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <ClipPathWebGL {...props} />
{:else}
  <ClipPathCore {...props} />
{/if}
