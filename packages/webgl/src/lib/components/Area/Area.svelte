<script lang="ts" module>
  export type { AreaProps } from './Area.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Area as AreaCore } from 'layerchart';
  import AreaWebGL from './Area.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof AreaWebGL>;
  type CoreProps = ComponentProps<typeof AreaCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <AreaWebGL {...props} />
{:else}
  <AreaCore {...props as CoreProps} />
{/if}
