<script lang="ts" module>
  export type { CircleClipPathPropsWithoutHTML } from 'layerchart';
</script>

<script lang="ts">
  import {
    CircleClipPath as CircleClipPathCore,
    type CircleClipPathPropsWithoutHTML,
  } from 'layerchart';
  import CircleClipPathWebGL from './CircleClipPath.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: CircleClipPathPropsWithoutHTML = $props();

  // The WebGL version inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <CircleClipPathWebGL {...props} />
{:else}
  <CircleClipPathCore {...props} />
{/if}
