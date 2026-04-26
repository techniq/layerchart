import { Context } from 'runed';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { AnyScale } from '$lib/utils/scales.svelte.js';

export type { ChartState };
export type {
  NodeKind,
  ComponentNode,
  RegisterComponentOptions,
} from '$lib/states/chart.svelte.js';

const _ChartContext = new Context<ChartState<any, AnyScale, AnyScale>>('ChartContext');

/**
 * Fallback context when used outside of a Chart component.
 * Provides safe defaults to prevent runtime errors.
 */
const fallbackContext = {
  registerMark: () => () => {
    /* no-op */
  },
  registerComponent: (_options: any) => ({
    id: Symbol('noop'),
    kind: 'mark' as const,
    name: 'noop',
    parent: null,
    children: [],
    insideCompositeMark: false,
  }),
  series: {
    series: [],
    visibleSeries: [],
    highlightKey: null,
    isVisible: () => true,
    isHighlighted: () => false,
    isDefaultSeries: true,
    allSeriesData: [],
    allSeriesColors: [],
    selectedKeys: { isEmpty: () => true, isSelected: () => false },
  },
  tooltip: {
    x: 0,
    y: 0,
    data: null,
    series: [],
    config: {},
    isHoveringTooltipArea: false,
    isHoveringTooltipContent: false,
    mode: 'manual' as const,
    show: () => {},
    hide: () => {},
  },
} as unknown as ChartState<any, AnyScale, AnyScale>;

export function getChartContext<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
>(): ChartState<T, XScale, YScale> {
  // @ts-expect-error - Type variance is acceptable here
  return _ChartContext.getOr(fallbackContext);
}

export function setChartContext<
  T,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
>(context: ChartState<T, XScale, YScale>): ChartState<T, XScale, YScale> {
  // @ts-expect-error - shh
  return _ChartContext.set(context);
}
