<script lang="ts" module>
  export type {
    HighlightPointProps,
    HighlightLineProps,
    HighlightShadowProps,
    HighlightProps,
  } from './Highlight.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Highlight as HighlightCore } from 'layerchart';
  import HighlightWebGL from './Highlight.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof HighlightWebGL>;
  type CoreProps = ComponentProps<typeof HighlightCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <HighlightWebGL {...props} />
{:else}
  <HighlightCore {...props as CoreProps} />
{/if}
