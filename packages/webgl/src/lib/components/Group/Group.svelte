<script lang="ts" module>
  export type { GroupProps } from './Group.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Group as GroupCore } from 'layerchart';
  import GroupWebGL from './Group.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof GroupWebGL>;
  type CoreProps = ComponentProps<typeof GroupCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <GroupWebGL {...props} />
{:else}
  <GroupCore {...props as CoreProps} />
{/if}
