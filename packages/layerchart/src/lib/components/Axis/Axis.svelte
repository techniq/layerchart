<script lang="ts" module>
  export type { AxisProps, AxisPropsWithoutHTML } from './Axis.shared.svelte.js';
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import AxisSvg from './Axis.svg.svelte';
  import AxisCanvas from './Axis.canvas.svelte';
  import AxisHtml from './Axis.html.svelte';
  import type { AxisProps } from './Axis.shared.svelte.js';
  import type { Transition } from '$lib/utils/types.js';

  const layerCtx = getLayerContext();

  let props: AxisProps<T> = $props();
</script>

{#if layerCtx === 'svg'}
  <AxisSvg {...props} />
{:else if layerCtx === 'canvas'}
  <AxisCanvas {...props} />
{:else if layerCtx === 'html'}
  <AxisHtml {...props} />
{/if}
