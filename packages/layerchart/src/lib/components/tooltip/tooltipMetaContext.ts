// Additional meta data that can be set by the various simplified chart components
// to provide additional payload data to the tooltip for ease of composition.

import { accessor, findRelatedData, type Accessor } from '$lib/utils/common.js';
import type { SeriesData } from '../charts/index.js';
import type { ChartContextValue } from '../Chart.svelte';
import { asAny } from '$lib/utils/types.js';
import { format, type FormatType } from '@layerstack/utils';
import { Context } from 'runed';

export type SimplifiedChartType = 'bar' | 'area' | 'line' | 'pie' | 'scatter';

export type BarTooltipMetaContextValue = {
  type: 'bar';
  orientation: 'horizontal' | 'vertical';
  stackSeries: boolean;
  visibleSeries: SeriesData<any, any>[];
};

export type AreaTooltipMetaContextValue = {
  type: 'area';
  stackSeries: boolean;
  visibleSeries: SeriesData<any, any>[];
};

export type LineTooltipMetaContextValue = {
  type: 'line';
  visibleSeries: SeriesData<any, any>[];
};

export type PieTooltipMetaContextValue = {
  type: 'pie';
  visibleSeries: SeriesData<any, any>[];
  key: Accessor<any>;
  label: Accessor<any>;
  value: Accessor<any>;
  color: Accessor<any>;
};

export type ArcTooltipMetaContextValue = {
  type: 'arc';
  visibleSeries: SeriesData<any, any>[];
  key: Accessor<any>;
  label: Accessor<any>;
  value: Accessor<any>;
  color: Accessor<any>;
};

export type ScatterTooltipMetaContextValue = {
  type: 'scatter';
  visibleSeries: SeriesData<any, any>[];
};

export type TooltipMetaContextValue =
  | BarTooltipMetaContextValue
  | AreaTooltipMetaContextValue
  | LineTooltipMetaContextValue
  | PieTooltipMetaContextValue
  | ScatterTooltipMetaContextValue
  | ArcTooltipMetaContextValue;

export type TooltipPayload = {
  color?: string;
  name?: string;
  key: string;
  label?: string;
  value?: any;
  keyAccessor?: Accessor<any>;
  valueAccessor?: Accessor<any>;
  labelAccessor?: Accessor<any>;
  colorAccessor?: Accessor<any>;
  chartType?: SimplifiedChartType;
  payload: any;
  rawSeriesData?: SeriesData<any, any>;
  formatter?: FormatType;
};

type BasePayloadHandlerProps = {
  ctx: ChartContextValue;
  data: any;
};

function handleBarTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: BarTooltipMetaContextValue;
}): TooltipPayload[] {
  const seriesItems = metaCtx.stackSeries
    ? [...metaCtx.visibleSeries].reverse()
    : metaCtx.visibleSeries;
  const payload: TooltipPayload[] = seriesItems.map((s) => {
    const seriesTooltipData = s.data ? findRelatedData(s.data, data, ctx.x) : data;
    const valueAccessor = accessor(s.value ?? (s.data ? ctx.y : s.key));
    const label = metaCtx.orientation === 'vertical' ? ctx.x(data) : ctx.y(data);
    const name = s.label ?? (s.key !== 'default' ? s.key : 'value');
    const value = seriesTooltipData ? valueAccessor(seriesTooltipData) : undefined;
    const color = s.color ?? ctx.cScale?.(ctx.c(data));

    return {
      ...s.data,
      chartType: 'bar',
      color,
      label,
      name,
      value,
      valueAccessor,
      key: s.key,
      payload: data,
      rawSeriesData: s,
      formatter: format,
    };
  });
  return payload;
}

function handleAreaTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: AreaTooltipMetaContextValue;
}): TooltipPayload[] {
  const seriesItems = metaCtx.stackSeries
    ? [...metaCtx.visibleSeries].reverse()
    : metaCtx.visibleSeries;

  const payload: TooltipPayload[] = seriesItems.map((s) => {
    const seriesTooltipData = s.data ? findRelatedData(s.data, data, ctx.x) : data;
    const valueAccessor = accessor(s.value ?? (s.data ? asAny(ctx.y) : s.key));
    const label = ctx.x(data);
    const name = s.label ?? (s.key !== 'default' ? s.key : 'value');
    const value = seriesTooltipData ? valueAccessor(seriesTooltipData) : undefined;
    const color = s.color ?? ctx.cScale?.(ctx.c(data));
    return {
      ...s.data,
      chartType: 'area',
      color,
      label,
      name,
      value,
      valueAccessor,
      key: s.key,
      payload: data,
      rawSeriesData: s,
      formatter: format,
    };
  });
  return payload;
}

function handleLineTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: LineTooltipMetaContextValue;
}): TooltipPayload[] {
  return metaCtx.visibleSeries.map((s) => {
    const seriesTooltipData = s.data ? findRelatedData(s.data, data, ctx.x) : data;
    const label = ctx.x(data);
    const valueAccessor = accessor(s.value ?? (s.data ? asAny(ctx.y) : s.key));
    const name = s.label ?? (s.key !== 'default' ? s.key : 'value');
    const value = seriesTooltipData ? valueAccessor(seriesTooltipData) : undefined;
    const color = s.color ?? ctx.cScale?.(ctx.c(data));

    return {
      ...s.data,
      chartType: 'line',
      color,
      label,
      name,
      value,
      valueAccessor,
      key: s.key,
      payload: data,
      rawSeriesData: s,
      formatter: format,
    };
  });
}

function handlePieOrArcTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: PieTooltipMetaContextValue | ArcTooltipMetaContextValue;
}): TooltipPayload[] {
  const keyAccessor = accessor(metaCtx.key);
  const labelAccessor = accessor(metaCtx.label);
  const valueAccessor = accessor(metaCtx.value);
  const colorAccessor = accessor(metaCtx.color);
  return [
    {
      key: keyAccessor(data),
      label: labelAccessor(data) || keyAccessor(data),
      value: valueAccessor(data),
      color: colorAccessor(data) ?? ctx.cScale?.(ctx.c(data)),
      payload: data,
      chartType: 'pie',
      labelAccessor,
      keyAccessor,
      valueAccessor,
      colorAccessor,
    },
  ];
}

export function handleScatterTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: ScatterTooltipMetaContextValue;
}): TooltipPayload[] {
  // TODO: implement scatter tooltip payload handling
  return [{ payload: data, key: '' }];
}

const _TooltipMetaContext = new Context<TooltipMetaContextValue | null>('TooltipMetaContext');

/**
 * Retrieves the current tooltip meta context value, or null if not set.
 */
export function getTooltipMetaContext() {
  return _TooltipMetaContext.getOr(null);
}

/**
 * Sets the tooltip meta context value, used to provide additional payload data to the tooltip.
 * This is typically set by the various simplified chart components, such as BarChart, AreaChart,
 * etc.
 */
export function setTooltipMetaContext(v: TooltipMetaContextValue | null) {
  return _TooltipMetaContext.set(v);
}

export function getTooltipPayload({
  ctx,
  tooltipData,
  metaCtx,
}: {
  ctx: ChartContextValue;
  tooltipData: any;
  metaCtx: TooltipMetaContextValue | null;
}): TooltipPayload[] {
  if (!metaCtx) return [{ payload: tooltipData, key: '' }];
  switch (metaCtx.type) {
    case 'bar':
      return handleBarTooltipPayload({ ctx, data: tooltipData, metaCtx });
    case 'area':
      return handleAreaTooltipPayload({ ctx, data: tooltipData, metaCtx });
    case 'line':
      return handleLineTooltipPayload({ ctx, data: tooltipData, metaCtx });
    case 'pie':
    case 'arc':
      return handlePieOrArcTooltipPayload({ ctx, data: tooltipData, metaCtx });
    case 'scatter':
      return handleScatterTooltipPayload({ ctx, data: tooltipData, metaCtx });
  }
}
