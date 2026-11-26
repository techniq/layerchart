<script lang="ts" module>
  export type { BarProps } from './Bar.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Bar as BarCore } from 'layerchart';
  import BarWebGL from './Bar.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof BarWebGL>;
  type CoreProps = ComponentProps<typeof BarCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <BarWebGL {...props} />
{:else}
  <BarCore {...props as CoreProps} />
{/if}
