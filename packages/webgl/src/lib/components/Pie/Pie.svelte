<script lang="ts" module>
  export type { PieProps } from './Pie.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Pie as PieCore } from 'layerchart';
  import PieWebGL from './Pie.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof PieWebGL>;
  type CoreProps = ComponentProps<typeof PieCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <PieWebGL {...props} />
{:else}
  <PieCore {...props as CoreProps} />
{/if}
