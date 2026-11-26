<script lang="ts" module>
  export type { DensityProps } from './Density.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Density as DensityCore } from 'layerchart';
  import DensityWebGL from './Density.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof DensityWebGL>;
  type CoreProps = ComponentProps<typeof DensityCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <DensityWebGL {...props} />
{:else}
  <DensityCore {...props as CoreProps} />
{/if}
