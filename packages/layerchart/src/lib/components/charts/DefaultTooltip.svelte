<script lang="ts">
  // Shared tooltip logic across simplified chart components.
  // Use explicit named imports instead of `import * as Tooltip from '../tooltip/index.js'`
  // so this dynamically-imported chunk doesn't drag in `TooltipContext.svelte`
  // (which is already in the static graph via Chart.svelte and would otherwise
  // bloat the lazy chunk and trip Vite dev-server compilation in CI).
  import { sum } from 'd3-array';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { accessor, chartDataArray, isEqualValue } from '$lib/utils/common.js';
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

  /**
   * One row of the tooltip's list.  `seriesKey` is the series it highlights on hover, or `null`
   * when the item is a sub-band of the data rather than a series.
   */
  type TooltipItem = {
    key: string;
    seriesKey: string | null;
    label: any;
    value: any;
    color?: string;
  };

  // Get visible series (already in correct order from TooltipContext)
  const visibleSeries = $derived(context.tooltip.series.filter((s) => s.visible));

  /**
   * The rows the hovered band covers.
   *
   * Data-driven sub-bands (`x1` / `y1`) split one band across a row each, holding only that
   * sub-band's series — so the band's values live across the rows rather than in the single one
   * the pointer resolved to, and a tooltip for the band has to read all of them.
   *
   * A facet panel groups the same way, with the scale inside it as the sub-band, so its rows are
   * read back off the panel instead of matched on a value.
   */
  function bandData(data: any) {
    if (context.facetBand) {
      return context.facet.panels.find((panel) => panel.has(data))?.data ?? [data];
    }

    const banded = context.props.x1 != null ? context.x : context.props.y1 != null ? context.y : null; // prettier-ignore
    if (!banded) return [data];

    const value = banded(data);
    return chartDataArray(context.data).filter((d: any) => isEqualValue(banded(d), value));
  }

  /**
   * The series values for the row being shown.
   *
   * `Tooltip.Root facetAll` renders one tooltip per facet panel, each for a *different* row, so
   * the values resolved for the hovered row can't be reused — they're re-read with the same
   * accessor rule `TooltipContext` uses.
   */
  function seriesFor(data: any): TooltipItem[] {
    const d = bandData(data);

    // Nothing names the sub-bands when the series are implicit — so the band's rows are the items
    // themselves, one per sub-band, labelled by the value that placed them there: `x1` / `y1`
    // within a band, or the band scale itself within a facet panel.
    if (d.length > 1 && context.series.isDefaultSeries) {
      const value = context.valueAxis === 'y' ? context.y : context.x;
      const subBand = context.facetBand
        ? context.valueAxis === 'y'
          ? context.x
          : context.y
        : context.props.x1 != null
          ? context.x1
          : context.y1;
      return d.map((row: any) => ({
        key: String(subBand(row)),
        // The rows are sub-bands rather than series, so hovering one highlights nothing
        seriesKey: null,
        label: subBand(row),
        value: value(row),
        color: context.config.c ? context.cGet(row) : undefined,
      }));
    }

    const series =
      d.length === 1 && data === context.tooltip.data
        ? visibleSeries
        : visibleSeries.map((s) => {
            const config: any = s.config;
            const valueAcc = accessor(
              config?.value ?? (config?.data ? (context.props.y ?? context.props.x) : config?.key)
            );
            // The first row of the band carrying this series — one row per sub-band, so only one
            // of them holds any given series
            const match = d.find((row: any) => valueAcc(row) != null);
            return { ...s, value: match != null ? valueAcc(match) : undefined };
          });

    // A series no row holds a value for would render as a label with nothing beside it, which
    // reads as broken rather than as absent.
    return series
      .filter((s) => s.value != null)
      .map((s) => ({
        key: s.key,
        seriesKey: s.key,
        label: s.label,
        value: s.value,
        color: s.color,
      }));
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

  // Header label comes from x-axis (or y-axis for horizontal/vertical charts) — or from the facet
  // when the panel is the band, since the scale inside it labels the items instead
  const headerLabel = $derived.by(() => {
    const data = context.tooltip.data;
    if (!data) return undefined;
    if (context.facetBand) {
      return (context.facet.x ?? context.facet.y)?.(data);
    }
    return context.valueAxis === 'y' ? context.x(data) : context.y(data);
  });

  /**
   * The panel the hovered row sits in, for charts where the panel *isn't* the band.
   *
   * The band value alone names a row in every panel — three panels each have a `Torgersen` — so it
   * only identifies the row once the panel is in front of it.  Empty when the panel is the band,
   * since `headerLabel` is already the facet value there.
   */
  const facetLabel = $derived.by(() => {
    const data = context.tooltip.data;
    if (!data || context.facetBand || !context.facet.enabled) return undefined;

    const parts = [context.facet.x?.(data), context.facet.y?.(data)].filter((v) => v != null);
    return parts.length ? parts.join(' · ') : undefined;
  });

  /**
   * `headerLabel` with its facet in front, formatted here rather than by `Tooltip.Header` — the
   * band value still needs its own format applied before anything is joined to it, or a date or a
   * number would land in the header raw.
   */
  const facetHeaderLabel = $derived(
    facetLabel != null
      ? `${facetLabel} · ${format(headerLabel, tooltipProps?.header?.format as any)}`
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
      {#if facetHeaderLabel != null}
        <!-- Already formatted above, so `format` is dropped rather than applied a second time -->
        <Tooltip.Header {...tooltipProps?.header} value={facetHeaderLabel} format={undefined} />
      {:else}
        <Tooltip.Header value={headerLabel} {format} {...tooltipProps?.header} />
      {/if}

      <Tooltip.List {...tooltipProps?.list}>
        {#each seriesFor(data) as s, i (s.key ?? i)}
          <Tooltip.Item
            label={s.label}
            value={s.value}
            color={s.color}
            data-highlighted={s.seriesKey != null
              ? context.series.isHighlighted(s.seriesKey, true)
              : undefined}
            {format}
            valueAlign="right"
            onpointerenter={() => (context.series.highlightKey = s.seriesKey)}
            onpointerleave={() => (context.series.highlightKey = null)}
            {...tooltipProps?.item}
          />
        {/each}

        {#if canHaveTotal && seriesFor(data).length > 1 && !tooltipProps?.hideTotal}
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
