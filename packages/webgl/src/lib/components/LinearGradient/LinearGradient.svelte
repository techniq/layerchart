<script lang="ts" module>
  export type { LinearGradientProps } from 'layerchart';
</script>

<script lang="ts">
  import { LinearGradient as LinearGradientCore, type LinearGradientProps } from 'layerchart';
  import LinearGradientWebGL from './LinearGradient.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let { ref = $bindable(), ...props }: LinearGradientProps = $props();

  // The scene's gradient inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <LinearGradientWebGL {...props} />
{:else}
  <LinearGradientCore bind:ref {...props} />
{/if}
