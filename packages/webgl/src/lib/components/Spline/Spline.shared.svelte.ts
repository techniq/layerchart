import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { CurveFactory } from 'd3-shape';

export type SplineProps = {
  /** Override the chart's `data` */
  data?: any[];
  /** Override the chart's `x` accessor */
  x?: Accessor;
  /** Override the chart's `y` accessor */
  y?: Accessor;
  /**
   * Height off the floor: a data key or function (through the chart's `z` scale), or a number
   * of pixels.  Defaults to the chart's `z`.
   */
  z?: DataProp;
  /**
   * Draw one line per distinct value, in data order.  Defaults to the chart's `g`, else the
   * categorical data key `stroke` names, else the chart's `c` (as the core `Spline`).  A numeric
   * key (`stroke="z"`) colors along the line instead.
   */
  g?: Accessor;
  /**
   * A CSS color, or a data key / function run through the chart's color scale — per row, so a
   * line can change color along its length.  Defaults to the chart's `c`, else
   * `var(--color-primary)`.
   */
  stroke?: ColorProp;
  /**
   * Line width in pixels, the same at any depth.
   *
   * @default 1
   */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /**
   * The d3 curve each line takes through its rows (ex. `curveMonotoneX`), as the core
   * `Spline` draws it.  Straight between them without one.
   */
  curve?: CurveFactory;
  /** Whether a row is drawn: a line breaks at rows it isn't, as the core `Spline` does */
  defined?: (d: any, index: number, data: any[]) => boolean;
  /**
   * Show the tooltip for the row nearest where the pointer is over a line (with the chart's
   * `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Tween each line to where it's asked to be, as the core `Spline` (ex. `'tween'`, or `{ type:
   * 'tween', duration: 300 }`), a new one up from the baseline.  A spring leaves it, as core's.
   */
  motion?: MotionProp;
  /**
   * A CSS color to fill the shape each line closes around, as an SVG path fills an open line (ex.
   * a `Hull`'s).  None without one (here or in `class`).
   */
  fill?: string | null;
  /** @default 1 */
  fillOpacity?: number;
};
