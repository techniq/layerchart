<script lang="ts" module>
  export type { LinkProps } from './Link.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Link as LinkCore } from 'layerchart';
  import LinkWebGL from './Link.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof LinkWebGL>;
  type CoreProps = ComponentProps<typeof LinkCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <LinkWebGL {...props} />
{:else}
  <LinkCore {...props as CoreProps} />
{/if}
