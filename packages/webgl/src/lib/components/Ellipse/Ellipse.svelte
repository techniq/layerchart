<script lang="ts" module>
  export type { EllipseProps } from 'layerchart';
</script>

<script lang="ts">
  import { Ellipse as EllipseCore, type EllipseProps } from 'layerchart';
  import EllipseWebGL from './Ellipse.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  let props: EllipseProps = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <EllipseWebGL {...props} />
{:else}
  <EllipseCore {...props} />
{/if}
