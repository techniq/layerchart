import type { ColorProp, DataProp } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';

/**
 * The core `Vector`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`tilt`, `z`, `tooltip`)
 */
export type VectorProps = {
  /**
   * Where it's anchored across: a data property name or function of the row through the chart's
   * `x` scale (or longitude, through its projection), or pixels.
   *
   * @default 0
   */
  x?: DataProp;
  /** Where a vector placed by pixels eases across from with `motion`. @default x */
  initialX?: number;
  /**
   * Where it's anchored down: a data property name or function of the row through the chart's
   * `y` scale (or latitude, through its projection), or pixels.
   *
   * @default 0
   */
  y?: DataProp;
  /** Where it eases down from, as `initialX`. @default y */
  initialY?: number;
  /**
   * How long: a data property name or function of the row through the chart's `r` scale, or
   * pixels.
   *
   * @default 12
   */
  length?: DataProp;
  /** The length it eases from, as `initialX`. @default length */
  initialLength?: number;
  /**
   * Which way it points, in degrees clockwise from up the plot (its far edge, before the view
   * turns): a number, data property name, or function of the row.
   *
   * @default 0
   */
  rotate?: DataProp;
  /** @default 'arrow' */
  shape?: 'arrow' | 'arrow-filled' | 'spike';
  /** Which part of it is at `x` / `y`.  Defaults to `'start'` for filled shapes, else `'middle'`. */
  anchor?: 'start' | 'middle' | 'end';
  /** Width of the vector shape in pixels.  Defaults to a quarter of its length. */
  width?: number;
  /** Rows to draw a vector each for.  Falls back to the chart's data when the props read rows. */
  data?: any[];
  /**
   * Key function for each row in data mode, which its `motion` eases by.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => any;
  /**
   * Ease each vector's anchor and length to where they're asked to be (ex. `'tween'`, or per
   * prop, `{ length: { type: 'spring' } }`): a row at a time by its `key`, and one placed by
   * pixels from `initialX` ...
   */
  motion?: MotionProp;
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
  /** The fill opacity (0 to 1) @default 1 */
  fillOpacity?: number;
  /** The stroke opacity (0 to 1) @default 1 */
  strokeOpacity?: number;
  /** @default 1 */
  strokeWidth?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `stroke-red-500`): the
   * fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;

  /**
   * In a 3D view, how far it points up out of the floor, in degrees: `0` along the floor, `90`
   * straight up, `-90` straight down.  A number, data property name, or function of the row.
   *
   * @default 0
   */
  tilt?: DataProp;
  /**
   * Where it's anchored up off the floor: a data property name or function of the row through
   * the chart's `z` scale, or pixels.  On the floor without one.
   */
  z?: DataProp;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).  Only
   * filled shapes can be picked.
   *
   * @default false
   */
  tooltip?: boolean;
};
