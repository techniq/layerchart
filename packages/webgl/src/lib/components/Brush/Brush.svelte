<script lang="ts" module>
  export type { BrushProps } from 'layerchart';
</script>

<script lang="ts">
  import { Brush as BrushCore, type BrushProps } from 'layerchart';
  import BrushWebGL from './Brush.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let { state: stateProp = $bindable(), ...props }: BrushProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <BrushWebGL bind:state={stateProp} {...props} />
{:else}
  <BrushCore bind:state={stateProp} {...props} />
{/if}
