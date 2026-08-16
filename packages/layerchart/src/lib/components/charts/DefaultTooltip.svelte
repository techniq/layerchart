<script lang="ts">
  // Shared tooltip logic across simplified chart components.
  // Use explicit named imports instead of `import * as Tooltip from '../tooltip/index.js'`
  // so this dynamically-imported chunk doesn't drag in `TooltipContext.svelte`
  // (which is already in the static graph via Chart.svelte and would otherwise
  // bloat the lazy chunk and trip Vite dev-server compilation in CI).
  import { sum } from 'd3-array';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { accessor } from '$lib/utils/common.js';
  import Root from '../tooltip/Tooltip.svelte';
  import Header from '../tooltip/TooltipHeader.svelte';
  import List from '../tooltip/TooltipList.svelte';
  import Item from '../tooltip/TooltipItem.svelte';
  import Separator from '../tooltip/TooltipSeparator.svelte';
  const Tooltip = { Root, Header, List, Item, Separator };
  import { format } from '@layerstack/utils';
  import type { ChartChildrenProps } from '../ChartChildren/ChartChildren.svelte';

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

  /**
   * The series values for the row being shown.
   *
   * `Tooltip.Root facetAll` renders one tooltip per facet panel, each for a *different* row, so
   * the values resolved for the hovered row can't be reused — they're re-read with the same
   * accessor rule `TooltipContext` uses.
   */
  function seriesFor(data: any) {
    if (data === context.tooltip.data) return visibleSeries;

    return visibleSeries.map((s) => {
      const config: any = s.config;
      const valueAcc = accessor(
        config?.value ?? (config?.data ? (context.props.y ?? context.props.x) : config?.key)
      );
      return { ...s, value: valueAcc(data) };
    });
  }

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
        {#each seriesFor(data) as s, i (s.key ?? i)}
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
            value={sum(seriesFor(data), (s) => s.value ?? 0)}
            format="integer"
            valueAlign="right"
            {...tooltipProps?.item}
          />
        {/if}
      </Tooltip.List>
    {/if}
  {/snippet}
</Tooltip.Root>
