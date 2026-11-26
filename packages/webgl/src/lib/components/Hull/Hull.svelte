<script lang="ts" module>
  export type { HullProps } from './Hull.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Hull as HullCore } from 'layerchart';
  import HullWebGL from './Hull.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof HullWebGL>;
  type CoreProps = ComponentProps<typeof HullCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <HullWebGL {...props} />
{:else}
  <HullCore {...props as CoreProps} />
{/if}
