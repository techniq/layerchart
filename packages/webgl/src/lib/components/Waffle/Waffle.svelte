<script lang="ts" module>
  export type { WaffleProps } from 'layerchart';
</script>

<script lang="ts">
  import { Waffle as WaffleCore, type WaffleProps } from 'layerchart';
  import WaffleWebGL from './Waffle.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: WaffleProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <WaffleWebGL {...props} />
{:else}
  <WaffleCore {...props} />
{/if}
