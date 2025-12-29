import { format } from '@layerstack/utils';

import { accessor, findRelatedData } from '$lib/utils/common.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { asAny } from '$lib/utils/types.js';

import type { TooltipPayload } from '$lib/states/tooltip.svelte.js';
export type { TooltipPayload, TooltipPayloadConfig } from '$lib/states/tooltip.svelte.js';

/**
 * Builds tooltip payload using ChartState.seriesState directly.
 * This unified approach works for all chart types without chart-specific handling.
 */
export function buildTooltipPayload({
  ctx,
  tooltipData,
}: {
  ctx: ChartState;
  tooltipData: any;
}): TooltipPayload[] {
  const config = ctx.tooltipState?.payloadConfig ?? {};
  const seriesState = ctx.seriesState;

  // Handle pie/arc charts - single item payload using configured accessors
  if (config.singleItemPayload) {
    const keyAcc = accessor(config.keyAccessor);
    const labelAcc = accessor(config.labelAccessor);
    const valueAcc = accessor(config.valueAccessor);
    const colorAcc = accessor(config.colorAccessor);

    return [
      {
        key: keyAcc(tooltipData),
        label: labelAcc(tooltipData) || keyAcc(tooltipData),
        value: valueAcc(tooltipData),
        color: colorAcc(tooltipData) ?? ctx.cScale?.(ctx.c(tooltipData)),
        payload: tooltipData,
        keyAccessor: config.keyAccessor,
        labelAccessor: config.labelAccessor,
        valueAccessor: config.valueAccessor,
        colorAccessor: config.colorAccessor,
      },
    ];
  }

  // If no series state or no visible series, return simple payload
  if (!seriesState || seriesState.visibleSeries.length === 0) {
    return [{ payload: tooltipData, key: '' }];
  }

  // Handle series-based charts (line, area, bar, scatter)
  // For stacked series, reverse the order so tooltip matches visual stack order
  const seriesItems = config.stackedSeries
    ? [...seriesState.visibleSeries].reverse()
    : seriesState.visibleSeries;

  return seriesItems.map((s) => {
    // Find related data point for this series (if series has its own data)
    const seriesTooltipData = s.data ? findRelatedData(s.data, tooltipData, ctx.x) : tooltipData;

    // Determine value accessor: series.value > series.key (if no data) > ctx.y
    const valueAcc = accessor(s.value ?? (s.data ? asAny(ctx.y) : s.key));

    // Label is typically the x-axis value
    // For horizontal bar charts, use ctx.y; otherwise use ctx.x
    const label = ctx.isVertical ? ctx.y(tooltipData) : ctx.x(tooltipData);

    // Name is the series label or key
    const name = s.label ?? (s.key !== 'default' ? s.key : 'value');

    // Extract value from the data
    const value = seriesTooltipData ? valueAcc(seriesTooltipData) : undefined;

    // Color from series or from color scale
    const color = s.color ?? ctx.cScale?.(ctx.c(tooltipData));

    return {
      color,
      label,
      name,
      value,
      valueAccessor: valueAcc,
      key: s.key,
      payload: tooltipData,
      rawSeriesData: s,
      formatter: format,
    };
  });
}
