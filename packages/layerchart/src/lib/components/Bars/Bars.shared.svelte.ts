import type { Snippet } from 'svelte';
import type { BarProps, BarPropsWithoutHTML } from '../Bar/Bar.shared.svelte.js';
import {} from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getLayerIsometric } from '$lib/contexts/isometric.js';
import { getMarkData } from '$lib/contexts/facet.js';
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
  markData = getMarkData();

  constructor(getProps: () => BarsProps) {
    this.#getProps = getProps;
    this.ctx.registerComponent({
      name: 'Bars',
      kind: 'mark',
      // Its bars are keyed, in depth order on an isometric floor
      paintByDepth: true,
      markInfo: () => {
        const p = getProps();
        return {
          data: p.data,
          seriesKey: p.seriesKey,
          color: p.fill as string | undefined,
          stacks: true,
        };
      },
    });
  }

  series = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey ? this.ctx.series.series.find((s) => s.key === seriesKey) : undefined;
  });
  seriesData = $derived(this.series?.data);
  data = $derived(this.markData(this.#getProps().data ?? this.seriesData));

  #layerIsometric = getLayerIsometric();

  /**
   * `data` in draw order: with `valueAxis="z"` on an isometric floor, back to front and each stack
   * bottom up, else as given.
   */
  paintedData = $derived.by(() => {
    const m = this.#layerIsometric();
    const ctx = this.ctx;
    if (!m || ctx.valueAxis !== 'z') return this.data;
    const centre = (scale: any, value: any) => (scale(value) ?? 0) + (scale.bandwidth?.() ?? 0) / 2;
    const depth = (d: any) =>
      m.b * centre(ctx.xScale, ctx.x(d)) + m.d * centre(ctx.yScale, ctx.y(d));
    const stack = ctx.stackAccessorsFor({
      seriesKey: this.#getProps().seriesKey,
      stacksImplicitly: true,
    });
    const base = (d: any) => {
      const value = stack?.value(d);
      return Array.isArray(value) ? Math.min(...value) : 0;
    };
    return [...this.data].sort((a, b) => depth(a) - depth(b) || base(a) - base(b));
  });
}
