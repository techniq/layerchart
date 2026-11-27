<script lang="ts" module>
  export type { BarsProps } from './Bars.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Bars as BarsCore } from 'layerchart';
  import BarsWebGL from './Bars.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof BarsWebGL>;
  type CoreProps = ComponentProps<typeof BarsCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <BarsWebGL {...props} />
{:else}
  <BarsCore {...props as CoreProps} />
{/if}
