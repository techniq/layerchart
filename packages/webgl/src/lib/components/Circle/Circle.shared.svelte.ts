import type { ColorProp, DataProp } from 'layerchart';
import type { MotionOptions } from 'layerchart/utils/motion.svelte';

export type CircleProps = {
  /** Rows to draw a circle each for (else the chart's, when a position reads them) */
  data?: any[];
  /**
   * The center across: a number of pixels, or a data key / function through the chart's `x`
   * scale (a circle per row)
   *
   * @default 0
   */
  cx?: DataProp;
  /**
   * The center down: a number of pixels, or a data key / function through the chart's `y`
   * scale (a circle per row)
   *
   * @default 0
   */
  cy?: DataProp;
  /**
   * The radius: a number of pixels, or a data key / function through the chart's `r` scale
   *
   * @default 1
   */
  r?: DataProp;
  /**
   * Its height off the floor: a number of pixels, or a data key / function through the chart's
   * `z` scale.  Flat on the floor without one.
   */
  z?: DataProp;
  /**
   * A CSS color, or a data key / function run through the chart's color scale (`none` or `null`
   * for only its ring).
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp | null;
  /** A ring around it, in a CSS color or a data key / function run through the color scale */
  stroke?: ColorProp;
  /** The ring's width, in pixels. @default 1 */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Ease each circle to where it's asked to be, as the core `Circle` (ex. `'spring'`, or
   * `{ type: 'tween', duration: 300 }`)
   */
  motion?: MotionOptions;
  /** The fill's opacity, as the core `Circle`'s (its ring's is `opacity`). @default 1 */
  fillOpacity?: number;
  /**
   * Inline CSS, as on the core marks' elements (ex. `--fill-color: var(--color-primary)`): the
   * colors it sets, as LayerChart's styles read them
   */
  style?: string;
  /** Which circle each row is as rows change, for `motion`. @default (d, i) => i */
  key?: (d: any, index: number) => unknown;
};
