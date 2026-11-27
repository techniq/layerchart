<script lang="ts" module>
  export type { AxisLabelProps, AxisProps } from './Axis.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Axis as AxisCore } from 'layerchart';
  import AxisWebGL from './Axis.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof AxisWebGL>;
  type CoreProps = ComponentProps<typeof AxisCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <AxisWebGL {...props} />
{:else}
  <AxisCore {...props as CoreProps} />
{/if}
