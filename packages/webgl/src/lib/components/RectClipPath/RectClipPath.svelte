<script lang="ts" module>
  export type { RectClipPathProps } from 'layerchart';
</script>

<script lang="ts">
  import { RectClipPath as RectClipPathCore, type RectClipPathProps } from 'layerchart';
  import RectClipPathWebGL from './RectClipPath.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: RectClipPathProps = $props();

  // The WebGL version inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <RectClipPathWebGL {...props} />
{:else}
  <RectClipPathCore {...props} />
{/if}
