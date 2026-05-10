<script lang="ts" module>
  export type { PointsProps, PointsPropsWithoutHTML, Point } from './Points.shared.svelte.js';
</script>

<script lang="ts">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import PointsSvg from './Points.svg.svelte';
  import PointsCanvas from './Points.canvas.svelte';
  import PointsHtml from './Points.html.svelte';
  import type { PointsProps } from './Points.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: PointsProps = $props();
</script>

{#if layerCtx === 'svg'}
  <PointsSvg {...props} />
{:else if layerCtx === 'canvas'}
  <PointsCanvas {...props} />
{:else if layerCtx === 'html'}
  <PointsHtml {...props} />
{/if}
