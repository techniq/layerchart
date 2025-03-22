// Additional meta data that can be set by the various simplified chart components
// to provide additional payload data to the tooltip for ease of composition.

import { accessor, findRelatedData, type Accessor } from 'layerchart/utils/common.js';
import type { SeriesData } from '../charts/index.js';
import type { ChartContextValue } from '../Chart.svelte';
import { asAny } from 'layerchart/utils/types.js';
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
  labelAccessor: Accessor<any>;
  keyAccessor: Accessor<any>;
  valueAccessor: Accessor<any>;
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
  | ScatterTooltipMetaContextValue;

export type TooltipPayload = {
  color?: string;
  name?: string;
  key: string;
  label?: string;
  value?: any;
  keyAccessor?: Accessor<any>;
  valueAccessor?: Accessor<any>;
  labelAccessor?: Accessor<any>;
  chartType?: SimplifiedChartType;
  payload: any;
  rawSeriesData?: SeriesData<any, any>;
  formatter?: FormatType;
};

type BasePayloadHandlerProps = {
  ctx: ChartContextValue;
  data: any;
};

export function handleBarTooltipPayload({
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

export function handleAreaTooltipPayload({
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

export function handleLineTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: LineTooltipMetaContextValue;
}): TooltipPayload[] {
  return metaCtx.visibleSeries.map((s) => {
    const seriesTooltipData = s.data ? findRelatedData(s.data, data, ctx.x) : data;
    const label = ctx.x(data);
    const valueAccessor = accessor(s.value) ?? (s.data ? asAny(ctx.y) : s.key);
    const name = s.label ?? (s.key !== 'default' ? s.key : 'value');
    const value = seriesTooltipData ? valueAccessor(seriesTooltipData) : undefined;
    const color = s.color ?? ctx.cScale?.(ctx.c(data));

    return {
      ...s.data,
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

export function handlePieTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: PieTooltipMetaContextValue;
}): TooltipPayload[] {
  // TODO: Implement pie tooltip payload handling
  return [{ payload: data, key: '' }];
}

export function handleScatterTooltipPayload({
  ctx,
  data,
  metaCtx,
}: BasePayloadHandlerProps & {
  metaCtx: ScatterTooltipMetaContextValue;
}): TooltipPayload[] {
  return [{ payload: data, key: '' }];
}

const _TooltipMetaContext = new Context<TooltipMetaContextValue | null>('TooltipMetaContext');

export function getTooltipMetaContext() {
  return _TooltipMetaContext.getOr(null);
}

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
      return handlePieTooltipPayload({ ctx, data: tooltipData, metaCtx });
    case 'scatter':
      return handleScatterTooltipPayload({ ctx, data: tooltipData, metaCtx });
  }
}
