<script lang="ts" module>
  export type { ArcTrackProps, ArcProps } from './Arc.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Arc as ArcCore } from 'layerchart';
  import ArcWebGL from './Arc.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof ArcWebGL>;
  type CoreProps = ComponentProps<typeof ArcCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <ArcWebGL {...props} />
{:else}
  <ArcCore {...props as CoreProps} />
{/if}
