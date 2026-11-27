<script lang="ts" module>
  export type { TextProps } from './Text.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Text as TextCore } from 'layerchart';
  import TextWebGL from './Text.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof TextWebGL>;
  type CoreProps = ComponentProps<typeof TextCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <TextWebGL {...props} />
{:else}
  <TextCore {...props as CoreProps} />
{/if}
