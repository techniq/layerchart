<script lang="ts" module>
  export type { TrailProps } from './Trail.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Trail as TrailCore } from 'layerchart';
  import TrailWebGL from './Trail.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof TrailWebGL>;
  type CoreProps = ComponentProps<typeof TrailCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <TrailWebGL {...props} />
{:else}
  <TrailCore {...props as CoreProps} />
{/if}
