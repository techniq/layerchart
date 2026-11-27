<script lang="ts" module>
  export type { SplineProps } from './Spline.shared.svelte.js';
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { getChartContext, Spline as SplineCore } from 'layerchart';
  import SplineWebGL from './Spline.webgl.svelte';
  import { hasSceneContext } from '../../contexts/scene.svelte.js';

  type WebGLProps = ComponentProps<typeof SplineWebGL>;
  type CoreProps = ComponentProps<typeof SplineCore>;

  let props: WebGLProps & Omit<CoreProps, keyof WebGLProps> = $props();

  // The WebGL mark inside a `<WebGL>` scene, LayerChart's in an `Svg`, `Canvas`, or `Html` layer
  const inScene = hasSceneContext();
  const ctx = getChartContext();
  /** Its series' own `props` (ex. `{ opacity: 0.1 }`), over its own, as the core mark spreads them */
  const seriesProps = $derived(
    inScene && props.seriesKey != null
      ? ctx.series.series.find((s) => s.key === props.seriesKey)?.props
      : undefined
  );
</script>

{#if inScene}
  <SplineWebGL {...props} {...seriesProps} />
{:else}
  <SplineCore {...props as CoreProps} />
{/if}
