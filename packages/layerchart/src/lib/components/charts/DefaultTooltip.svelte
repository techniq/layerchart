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

  // Single-point modes find one specific data point (by proximity in both x+y),
  // so the tooltip shows dimensional info (x, y, r) for that point.
  // Multi-series modes find data at a single axis position, showing all series values.
  const isSinglePointMode = $derived(
    context.tooltip.mode === 'quadtree' || context.tooltip.mode === 'voronoi'
  );

  // For single-point mode: find the active series for the hovered data point
  const activeSeries = $derived(
    isSinglePointMode
      ? (context.tooltip.series.find((s) => s.key === context.tooltip.data?.seriesKey) ??
          context.tooltip.series[0])
      : null
  );

  // Header label comes from x-axis (or y-axis for horizontal/vertical charts)
  const headerLabel = $derived(
    context.tooltip.data
      ? context.valueAxis === 'y'
        ? context.x(context.tooltip.data)
        : context.y(context.tooltip.data)
      : undefined
  );

  function isSeriesItemHighlighted(seriesKey: string | null | undefined) {
    return seriesKey ? context.series.isHighlighted(seriesKey, true) : undefined;
  }
</script>

<Tooltip.Root {context} {...tooltipProps?.root}>
  {#snippet children({ data })}
    {#if isSinglePointMode}
      {#if activeSeries && activeSeries.key !== 'default'}
        <Tooltip.Header
          value={activeSeries.label ?? activeSeries.key}
          color={activeSeries.color}
          {...tooltipProps?.header}
        />
      {/if}

      <Tooltip.List {...tooltipProps?.list}>
        <Tooltip.Item
          label={typeof context.config.x === 'string' ? context.config.x : 'x'}
          value={context.x(data)}
          data-highlighted={isSeriesItemHighlighted(activeSeries?.key)}
          {format}
          onpointerenter={() => (context.series.highlightKey = activeSeries?.key ?? null)}
          onpointerleave={() => (context.series.highlightKey = null)}
          {...tooltipProps?.item}
        />
        <Tooltip.Item
          label={typeof context.config.y === 'string' ? context.config.y : 'y'}
          value={context.y(data)}
          data-highlighted={isSeriesItemHighlighted(activeSeries?.key)}
          {format}
          onpointerenter={() => (context.series.highlightKey = activeSeries?.key ?? null)}
          onpointerleave={() => (context.series.highlightKey = null)}
          {...tooltipProps?.item}
        />
        {#if context.config.r}
          <Tooltip.Item
            label={typeof context.config.r === 'string' ? context.config.r : 'r'}
            value={context.r(data)}
            data-highlighted={isSeriesItemHighlighted(activeSeries?.key)}
            {format}
            onpointerenter={() => (context.series.highlightKey = activeSeries?.key ?? null)}
            onpointerleave={() => (context.series.highlightKey = null)}
            {...tooltipProps?.item}
          />
        {/if}
      </Tooltip.List>
    {:else}
      <Tooltip.Header value={headerLabel} {format} {...tooltipProps?.header} />

      <Tooltip.List {...tooltipProps?.list}>
        {#each visibleSeries as s, i (s.key ?? i)}
          <Tooltip.Item
            label={s.label}
            value={s.value}
            color={s.color}
            data-highlighted={context.series.isHighlighted(s.key, true)}
            {format}
            valueAlign="right"
            onpointerenter={() => (context.series.highlightKey = s.key)}
            onpointerleave={() => (context.series.highlightKey = null)}
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
    {/if}
  {/snippet}
</Tooltip.Root>
