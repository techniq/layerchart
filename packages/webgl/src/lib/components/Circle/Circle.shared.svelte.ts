import type { ColorProp, DataProp } from 'layerchart';

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
   * A CSS color, or a data key / function run through the chart's color scale.
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp;
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
};
