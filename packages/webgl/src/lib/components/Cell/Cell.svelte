<script lang="ts" module>
  export type { CellProps } from './Cell.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Cell as CellCore } from 'layerchart';
  import CellWebGL from './Cell.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof CellWebGL>;
  type CoreProps = ComponentProps<typeof CellCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <CellWebGL {...props} />
{:else}
  <CellCore {...props as CoreProps} />
{/if}
