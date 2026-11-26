<script lang="ts" module>
  export type { ViolinProps } from './Violin.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Violin as ViolinCore } from 'layerchart';
  import ViolinWebGL from './Violin.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof ViolinWebGL>;
  type CoreProps = ComponentProps<typeof ViolinCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <ViolinWebGL {...props} />
{:else}
  <ViolinCore {...props as CoreProps} />
{/if}
