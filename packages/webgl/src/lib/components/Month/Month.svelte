<script lang="ts" module>
  export type { MonthProps } from './Month.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Month as MonthCore } from 'layerchart';
  import MonthWebGL from './Month.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof MonthWebGL>;
  type CoreProps = ComponentProps<typeof MonthCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <MonthWebGL {...props} />
{:else}
  <MonthCore {...props as CoreProps} />
{/if}
