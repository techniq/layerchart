<script lang="ts" module>
  export type { ImageProps } from 'layerchart';
</script>

<script lang="ts">
  import { Image as ImageCore, type ImageProps } from 'layerchart';
  import ImageWebGL from './Image.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: ImageProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <ImageWebGL {...props} />
{:else}
  <ImageCore {...props} />
{/if}
