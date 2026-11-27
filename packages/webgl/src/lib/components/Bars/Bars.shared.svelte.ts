import type { Snippet } from 'svelte';
import type { BarEvents, BarProps } from '../Bar/Bar.shared.svelte.js';

/**
 * The core `Bars`' props (in its order, as it describes them), then a bar's (as `Bar` takes
 * them, with a `WebGL` layer's own last)
 */
export type BarsProps = {
  /** Override the data from the context. */
  data?: any[];
  /** Which bar each row is as rows change, for `motion`. @default (d, index) => index */
  key?: (d: any, index: number) => unknown;
  /** Event dispatched when an individual bar is clicked. */
  onBarClick?: (e: MouseEvent, detail: { data: any }) => void;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** Padding between stacked bars. */
  stackPadding?: number;
  /** Drawn in place of its bars (ex. a `Bar` per row, styled each its own way) */
  children?: Snippet;
} & Omit<BarProps, 'data' | 'seriesKey' | 'stackPadding' | keyof BarEvents>;
