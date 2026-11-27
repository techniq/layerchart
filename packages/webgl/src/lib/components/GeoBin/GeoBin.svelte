<script lang="ts" module>
  export type { GeoBinProps } from 'layerchart/geo';
</script>

<script lang="ts">
  import { GeoBin as GeoBinCore, type GeoBinProps } from 'layerchart/geo';
  import GeoBinWebGL from './GeoBin.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: GeoBinProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GeoBinWebGL {...props} />
{:else}
  <GeoBinCore {...props} />
{/if}
