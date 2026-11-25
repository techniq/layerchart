<script lang="ts" module>
  export type { GridProps } from './Grid.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Grid as GridCore } from 'layerchart';
  import GridWebGL from './Grid.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof GridWebGL>;
  type CoreProps = ComponentProps<typeof GridCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GridWebGL {...props} />
{:else}
  <GridCore {...props as CoreProps} />
{/if}
