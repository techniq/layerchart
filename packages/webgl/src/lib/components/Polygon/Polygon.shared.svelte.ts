import type { ColorProp, DataProp } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';

/**
 * The core `Polygon`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`tooltip`)
 */
export type PolygonProps = {
  /**
   * Center across: a data property name or function of the row through the chart's `x` scale
   * (or longitude, through its projection), or pixels
   */
  cx?: DataProp;
  /** The initial center across a polygon placed by pixels eases from with `motion`. @default cx */
  initialCx?: number;
  /**
   * Center down: a data property name or function of the row through the chart's `y` scale (or
   * latitude, through its projection), or pixels
   */
  cy?: DataProp;
  /** The initial center down, as `initialCx`. @default cy */
  initialCy?: number;
  /**
   * Radius: a data property name or function of the row through the chart's `r` scale, or
   * pixels.
   *
   * @default 1
   */
  r?: DataProp;
  /** The initial radius, as `initialCx`. @default r */
  initialR?: number;
  /** Rows to draw a polygon each for.  Falls back to the chart's data when the props read rows. */
  data?: any[];
  /**
   * Key function for each row in data mode, which its `motion` eases by.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => any;
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
   * Ease each polygon's center and radius to where they're asked to be (ex. `'tween'`, or per
   * prop, `{ r: { type: 'spring' } }`): a row at a time by its `key`, and one placed by pixels
   * from `initialCx` ...
   */
  motion?: MotionProp;
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
  /** The fill opacity (0 to 1) @default 1 */
  fillOpacity?: number;
  /** The stroke opacity (0 to 1) @default 1 */
  strokeOpacity?: number;
  /** @default 1 */
  strokeWidth?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;

  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
