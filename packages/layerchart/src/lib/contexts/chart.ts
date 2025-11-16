import { Context } from 'runed';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { AnyScale } from '$lib/utils/scales.svelte.js';

export type { ChartState };

const _ChartContext = new Context<ChartState<any, AnyScale, AnyScale>>('ChartContext');

export function getChartContext<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
>(): ChartState<T, XScale, YScale> {
  // @ts-expect-error - Type variance is acceptable here
  return _ChartContext.getOr({} as ChartState<T, XScale, YScale>);
}

export function setChartContext<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
>(context: ChartState<T, XScale, YScale>): ChartState<T, XScale, YScale> {
  // @ts-expect-error - shh
  return _ChartContext.set(context);
}
