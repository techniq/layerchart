import type { BarsProps } from '../Bars/Bars.shared.svelte.js';

/** One row's bar, as `Bars` draws each (without registering it with the chart, as the core `Bar`) */
export type BarProps = Omit<BarsProps, 'data' | 'children'> & {
  /** The row */
  data: any;
};
