import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { CurveFactory } from 'd3-shape';

export type AreaProps = {
  /** Override the chart's `data` */
  data?: any[];
  /** Override the chart's `x` accessor */
  x?: Accessor;
  /** Override the chart's `y` accessor */
  y?: Accessor;
  /**
   * The area's base down the plot, as the core `Area`: an accessor of the row.  Defaults to
   * a stacked row's base, else the bottom of the plot.
   */
  y0?: Accessor;
  /** The area's top down the plot, likewise.  Defaults to a stacked row's top, else `y`. */
  y1?: Accessor;
  /**
   * Stand the area up as a curtain off the floor at each row's `y`, rising to this height: a
   * key or function of the row (through the chart's `z` scale), or a number of pixels.  Defaults
   * to the chart's `z`; without one (or with `y0` / `y1`), the area lies on the floor, between
   * `y0` and `y1`, as the core `Area` fills the plot.
   */
  z?: DataProp;
  /**
   * A curtain's base, likewise.
   *
   * @default 0 (the floor)
   */
  z0?: DataProp;
  /**
   * Draw one area per distinct value, in data order.  Defaults to the chart's `g`, else the
   * categorical data key `fill` names, else the chart's `c` (as `Spline`).
   */
  g?: Accessor;
  /** The d3 curve the area's edges take through its rows (ex. `curveMonotoneX`) */
  curve?: CurveFactory;
  /** Whether a row is drawn: the area breaks at rows it isn't, as the core `Area` does */
  defined?: (d: any, index: number, data: any[]) => boolean;
  /**
   * A CSS color, or a data key / function run through the chart's color scale (read from each
   * area's first row).  Defaults to the chart's `c`, else `var(--color-primary)`.
   */
  fill?: ColorProp;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /**
   * Opacity of the area (its line stays solid).
   *
   * @default 1
   */
  opacity?: number;
  /**
   * Draw a line along the top, in the fill's color.
   *
   * @default false
   */
  line?: boolean;
  /** @default 2 */
  strokeWidth?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
