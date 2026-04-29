import type { Snippet } from 'svelte';
import type { BarProps, BarPropsWithoutHTML } from '../Bar/Bar.shared.svelte.js';
import { chartDataArray } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';

export type BarsPropsWithoutHTML = {
  /** Override the data from the context. */
  data?: any;
  /** @default (d, index) => index */
  key?: (d: any, index: number) => any;
  /** Event dispatched when an individual bar is clicked. */
  onBarClick?: (e: MouseEvent, detail: { data: any }) => void;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** Padding between stacked bars. */
  stackPadding?: number;
  children?: Snippet;
  // TODO: investigate
  [key: string]: any;
} & Omit<BarPropsWithoutHTML, 'data' | 'children' | 'seriesKey' | 'stackPadding'>;

export type BarsProps = BarsPropsWithoutHTML & Omit<BarProps, 'data'>;

/**
 * Reactive state shared by every per-layer Bars variant.
 */
export class BarsState {
  #getProps: () => BarsProps = () => ({}) as BarsProps;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => BarsProps) {
    this.#getProps = getProps;
    this.ctx.registerComponent({
      name: 'Bars',
      kind: 'mark',
      markInfo: () => {
        const p = getProps();
        return {
          data: p.data,
          seriesKey: p.seriesKey,
          color: p.fill as string | undefined,
        };
      },
    });
  }

  series = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey ? this.ctx.series.series.find((s) => s.key === seriesKey) : undefined;
  });
  seriesData = $derived(this.series?.data);
  data = $derived(chartDataArray(this.#getProps().data ?? this.seriesData ?? this.ctx.data));
}
