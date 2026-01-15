<script lang="ts">
  // Shared tooltip logic across simplified chart components
  import { sum } from 'd3-array';
  import { getChartContext } from '$lib/contexts/chart.js';
  import * as Tooltip from '../tooltip/index.js';
  import { format } from '@layerstack/utils';
  import type { ChartChildrenProps } from '../ChartChildren.svelte';

  let {
    tooltipProps,
    canHaveTotal = false,
  }: {
    tooltipProps?: NonNullable<ChartChildrenProps<any>['props']>['tooltip'];
    canHaveTotal?: boolean;
  } = $props();

  const context = getChartContext();

  // Get visible series (already in correct order from TooltipContext)
  const visibleSeries = $derived(context.tooltip.series.filter((s) => s.visible));

  // Header label comes from x-axis (or y-axis for horizontal/vertical charts)
  const headerLabel = $derived(
    context.tooltip.data
      ? context.isVertical
        ? context.x(context.tooltip.data)
        : context.y(context.tooltip.data)
      : undefined
  );
</script>

<Tooltip.Root {context} {...tooltipProps?.root}>
  {#snippet children({ data })}
    <Tooltip.Header value={headerLabel} {format} {...tooltipProps?.header} />

    <Tooltip.List {...tooltipProps?.list}>
      {#each visibleSeries as s, i (s.key ?? i)}
        <Tooltip.Item
          label={s.label}
          value={s.value}
          color={s.color}
          {format}
          valueAlign="right"
          onpointerenter={() => (context.seriesState.highlightKey = s.key)}
          onpointerleave={() => (context.seriesState.highlightKey = null)}
          {...tooltipProps?.item}
        />
      {/each}

      {#if canHaveTotal && visibleSeries.length > 1 && !tooltipProps?.hideTotal}
        <Tooltip.Separator {...tooltipProps?.separator} children={undefined} />

        <Tooltip.Item
          label="total"
          value={sum(visibleSeries, (s) => s.value ?? 0)}
          format="integer"
          valueAlign="right"
          {...tooltipProps?.item}
        />
      {/if}
    </Tooltip.List>
  {/snippet}
</Tooltip.Root>
