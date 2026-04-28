<script lang="ts" module>
  export type { LabelsProps, LabelsPropsWithoutHTML } from './Labels.shared.svelte.js';
</script>

<script lang="ts" generics="TData = any">
  import { getLayerContext } from '$lib/contexts/layer.js';
  import LabelsSvg from './Labels.svg.svelte';
  import LabelsCanvas from './Labels.canvas.svelte';
  import LabelsHtml from './Labels.html.svelte';
  import type { LabelsProps } from './Labels.shared.svelte.js';

  const layerCtx = getLayerContext();

  let props: LabelsProps<TData> = $props();
</script>

{#if layerCtx === 'svg'}
  <LabelsSvg {...props} />
{:else if layerCtx === 'canvas'}
  <LabelsCanvas {...props} />
{:else if layerCtx === 'html'}
  <LabelsHtml {...props} />
{/if}
