import type { ColorProp, DataProp } from 'layerchart';

export type PolygonProps = {
  /** Rows to draw a polygon each for.  Falls back to the chart's data when the props read rows. */
  data?: any[];
  /**
   * Center across: a data property name or function of the row through the chart's `x` scale
   * (or longitude, through its projection), or pixels
   */
  cx?: DataProp;
  /**
   * Center down: a data property name or function of the row through the chart's `y` scale (or
   * latitude, through its projection), or pixels
   */
  cy?: DataProp;
  /**
   * Radius: a data property name or function of the row through the chart's `r` scale, or
   * pixels.
   *
   * @default 1
   */
  r?: DataProp;
  /**
   * The number of corners of a regular polygon about `cx` / `cy`, or the corners themselves, in
   * pixels.
   *
   * @default 4
   */
  points?: number | { x: number; y: number }[];
  /** The radius of the curve for rounded corners. @default 0 */
  cornerRadius?: number;
  /** The rotation of the polygon, in degrees. @default 0 */
  rotate?: number;
  /** The percent to inset the odd points of the star (<1 inset, >1 outset). @default 0 */
  inset?: number;
  /** The horizontal stretch factor of the polygon. @default 1 */
  scaleX?: number;
  /** The vertical stretch factor of the polygon. @default 1 */
  scaleY?: number;
  /** The skew angle in degrees along the X axis. @default 0 */
  skewX?: number;
  /** The skew angle in degrees along the Y axis. @default 0 */
  skewY?: number;
  /** The tilt factor for x-coordinates. @default 0 */
  tiltX?: number;
  /** The tilt factor for y-coordinates. @default 0 */
  tiltY?: number;
  /**
   * How tall it stands, as the core `Polygon` on an `isometric` chart: a data property name
   * or function of the row through the chart's `z` scale, pixels, or a `[start, end]` pair of
   * pixels to float it between.  Defaults to the chart's `z` with rows, else it lies flat.
   */
  z?: DataProp | [start: number, end: number];
  /**
   * A CSS color, or a key / function of the row run through the chart's color scale.
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp;
  /** The outline: a CSS color, or a key / function of the row run through the color scale */
  stroke?: ColorProp;
  /** @default 1 */
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
