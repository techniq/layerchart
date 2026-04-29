<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { ChartClipPathProps } from './ChartClipPath.shared.svelte.js';

  export type ChartClipPathBaseLayerComponents = {
    RectClipPath: Component<any>;
  };

  export type ChartClipPathBaseProps = ChartClipPathProps & ChartClipPathBaseLayerComponents;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    RectClipPath,
    full = false,
    disabled = false,
    ...restProps
  }: ChartClipPathBaseProps = $props();

  const ctx = getChartContext();
</script>

<RectClipPath
  x={full && ctx.padding.left ? -ctx.padding.left : 0}
  y={full && ctx.padding.top ? -ctx.padding.top : 0}
  {disabled}
  height={ctx.height + (full ? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0) : 0)}
  width={ctx.width + (full ? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0) : 0)}
  {...extractLayerProps(restProps, 'lc-chart-clip-path')}
/>
