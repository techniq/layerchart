import { Context } from 'runed';
import type { TimeInterval } from 'd3-time';

import type {
  AxisKey,
  DataType,
  Extents,
  Nice,
  Padding,
  PaddingArray,
  XRangeWithScale,
  YRangeWithScale,
} from '$lib/utils/types.js';
import { type AnyScale, type DomainType } from '$lib/utils/scales.svelte.js';

import { type GeoContextValue } from '$lib/contexts/geo.js';
import type { TooltipContextValue } from '$lib/contexts/tooltip.js';
import { type TransformContextValue } from '../components/TransformContext.svelte';
import { type BrushContextValue } from '../components/BrushContext.svelte';
import type { PreservedChartConfig } from '../components/Chart.svelte';

export type ChartContextValue<
  T = any,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
> = {
  activeGetters: Record<AxisKey, (d: T) => any>;
  width: number;
  height: number;
  percentRange: boolean;
  aspectRatio: number;
  containerRef: HTMLElement | undefined;
  containerWidth: number;
  containerHeight: number;
  config: PreservedChartConfig<T, XScale, YScale>;
  x: (d: T) => any;
  y: (d: T) => any;
  z: (d: T) => any;
  r: (d: T) => any;
  x1: (d: T) => any;
  y1: (d: T) => any;
  c: (d: T) => any;
  data: DataType<T>;
  xNice: Nice;
  yNice: Nice;
  zNice: Nice;
  rNice: Nice;
  xDomainSort: boolean;
  yDomainSort: boolean;
  zDomainSort: boolean;
  rDomainSort: boolean;
  xReverse: boolean;
  yReverse: boolean;
  zReverse: boolean;
  rReverse: boolean;
  xPadding: PaddingArray;
  yPadding: PaddingArray;
  zPadding: PaddingArray;
  rPadding: PaddingArray;
  padding: Padding;
  flatData: T[];
  extents: Extents;
  xDomain: number[];
  yDomain: number[];
  zDomain: DomainType;
  rDomain: DomainType;
  cDomain: DomainType;
  x1Domain: DomainType;
  y1Domain: DomainType;
  xRange: any[];
  yRange: any[];
  zRange: any[];
  rRange: any[];
  cRange: readonly string[] | string[] | undefined;
  x1Range: XRangeWithScale<XScale> | undefined;
  y1Range: YRangeWithScale<YScale> | undefined;
  meta: Record<string, any>;
  xScale: AnyScale;
  yScale: AnyScale;
  zScale: AnyScale;
  rScale: AnyScale;
  cScale: AnyScale | null;
  x1Scale: AnyScale | null;
  y1Scale: AnyScale | null;
  yGet: (d: T) => any;
  xGet: (d: T) => any;
  zGet: (d: T) => any;
  rGet: (d: T) => any;
  cGet: (d: T) => any;
  x1Get: (d: T) => any;
  y1Get: (d: T) => any;
  xInterval: TimeInterval | null;
  yInterval: TimeInterval | null;
  radial: boolean;
  tooltip: TooltipContextValue<T>;
  geo: GeoContextValue;
  brush: BrushContextValue;
  transform: TransformContextValue;
};

const _ChartContext = new Context<ChartContextValue<any, AnyScale, AnyScale>>('ChartContext');

export function getChartContext<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
>(): ChartContextValue<T, XScale, YScale> {
  return _ChartContext.getOr({} as ChartContextValue<T, XScale, YScale>);
}

export function setChartContext<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
>(context: ChartContextValue<T, XScale, YScale>): ChartContextValue<T, XScale, YScale> {
  // @ts-expect-error - shh
  return _ChartContext.set(context);
}
