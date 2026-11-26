<script lang="ts" module>
  export type { BoxPlotProps } from './BoxPlot.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { BoxPlot as BoxPlotCore } from 'layerchart';
  import BoxPlotWebGL from './BoxPlot.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof BoxPlotWebGL>;
  type CoreProps = ComponentProps<typeof BoxPlotCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
</script>

{#if inScene}
  <BoxPlotWebGL {...props} />
{:else}
  <BoxPlotCore {...props as CoreProps} />
{/if}
