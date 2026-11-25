import type { Accessor, ColorProp, DataProp } from 'layerchart';

export type BarsProps = {
  /** Override the chart's `data` */
  data?: any[];
  /** Override the chart's `x` accessor */
  x?: Accessor;
  /** Override the chart's `y` accessor */
  y?: Accessor;
  /**
   * The bar's height: a data key or function (through the chart's `z` scale), or a number of
   * pixels.  Defaults to the chart's `z`, stacked when the chart stacks along `z`.
   */
  z?: DataProp;
  /**
   * A CSS color, or a data key / function run through the chart's color scale.  Defaults to the
   * chart's `c`, else `var(--color-primary, currentColor)`.
   */
  fill?: ColorProp;
  /**
   * The outline, as the core isometric bars draw theirs: around each bar's top and up its
   * corners.  A CSS color, or a key / function of the row run through the color scale.  None
   * without one (here or in `class`).
   */
  stroke?: ColorProp;
  /** Outline width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /**
   * Pixels to leave between a bar and the edges of its band, on every side.
   *
   * @default 0
   */
  insets?: number;
  /**
   * A bar's width and depth in pixels along an axis without bands (and on a `globe`).
   *
   * @default 10
   */
  size?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
