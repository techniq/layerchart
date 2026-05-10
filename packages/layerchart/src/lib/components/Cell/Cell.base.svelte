<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { CellProps } from './Cell.shared.svelte.js';

  export type CellBaseLayerComponents = {
    Rect: Component<any>;
    Circle: Component<any>;
    Group: Component<any>;
  };

  export type CellBaseProps = CellProps & CellBaseLayerComponents;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';

  let {
    Rect,
    Circle,
    Group,
    shape = 'rect',
    r,
    x,
    y,
    ...restProps
  }: CellBaseProps = $props();

  const chartCtx = getChartContext();
  const cellWidth = $derived(isScaleBand(chartCtx.xScale) ? chartCtx.xScale.bandwidth() : 0);
  const cellHeight = $derived(isScaleBand(chartCtx.yScale) ? chartCtx.yScale.bandwidth() : 0);
  const defaultR = $derived(Math.min(cellWidth, cellHeight) / 2);
</script>

{#if shape === 'circle'}
  <Group x={cellWidth / 2} y={cellHeight / 2}>
    <Circle cx={x} cy={y} r={r ?? defaultR} {...restProps as any} />
  </Group>
{:else}
  <Rect width={cellWidth} height={cellHeight} {x} {y} {...restProps} />
{/if}
