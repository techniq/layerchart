<script lang="ts" module>
  export type { GraticuleProps } from './Graticule.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Graticule as GraticuleCore } from 'layerchart/geo';
  import GraticuleWebGL from './Graticule.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof GraticuleWebGL>;
  type CoreProps = ComponentProps<typeof GraticuleCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GraticuleWebGL {...props} />
{:else}
  <GraticuleCore {...props as CoreProps} />
{/if}
