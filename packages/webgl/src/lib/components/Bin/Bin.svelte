<script lang="ts" module>
  export type { BinProps } from './Bin.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Bin as BinCore } from 'layerchart';
  import BinWebGL from './Bin.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof BinWebGL>;
  type CoreProps = ComponentProps<typeof BinCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <BinWebGL {...props} />
{:else}
  <BinCore {...props as CoreProps} />
{/if}
