import type { ColorProp, DataProp } from 'layerchart';

export type VectorProps = {
  /** Rows to draw a vector each for.  Falls back to the chart's data when the props read rows. */
  data?: any[];
  /**
   * Where it's anchored across: a data property name or function of the row through the chart's
   * `x` scale (or longitude, through its projection), or pixels.
   *
   * @default 0
   */
  x?: DataProp;
  /**
   * Where it's anchored down: a data property name or function of the row through the chart's
   * `y` scale (or latitude, through its projection), or pixels.
   *
   * @default 0
   */
  y?: DataProp;
  /**
   * How long: a data property name or function of the row through the chart's `r` scale, or
   * pixels.
   *
   * @default 12
   */
  length?: DataProp;
  /**
   * Which way it points, in degrees clockwise from up the plot (its far edge, before the view
   * turns): a number, data property name, or function of the row.
   *
   * @default 0
   */
  rotate?: DataProp;
  /**
   * In a 3D view, how far it points up out of the floor, in degrees: `0` along the floor, `90`
   * straight up, `-90` straight down.  A number, data property name, or function of the row.
   *
   * @default 0
   */
  tilt?: DataProp;
  /** @default 'arrow' */
  shape?: 'arrow' | 'arrow-filled' | 'spike';
  /** Which part of it is at `x` / `y`.  Defaults to `'start'` for filled shapes, else `'middle'`. */
  anchor?: 'start' | 'middle' | 'end';
  /** Width of the vector shape in pixels.  Defaults to a quarter of its length. */
  width?: number;
  /**
   * Where it's anchored up off the floor: a data property name or function of the row through
   * the chart's `z` scale, or pixels.  On the floor without one.
   */
  z?: DataProp;
  /**
   * A filled shape's color: a CSS color, or a key / function of the row run through the chart's
   * color scale
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp;
  /**
   * An arrow's color (or a filled shape's outline): a CSS color, or a key / function of the row
   * run through the chart's color scale
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: ColorProp;
  /** @default 1 */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `stroke-red-500`): the
   * fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).  Only
   * filled shapes can be picked.
   *
   * @default false
   */
  tooltip?: boolean;
};
