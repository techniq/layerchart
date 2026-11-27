<script lang="ts" module>
  export type { RibbonProps } from './Ribbon.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Ribbon as RibbonCore } from 'layerchart/graph';
  import RibbonWebGL from './Ribbon.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof RibbonWebGL>;
  type CoreProps = ComponentProps<typeof RibbonCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <RibbonWebGL {...props} />
{:else}
  <RibbonCore {...props as CoreProps} />
{/if}
