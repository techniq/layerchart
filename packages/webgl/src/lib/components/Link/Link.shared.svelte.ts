import type { MotionNoneOption, MotionTweenOption } from 'layerchart/utils/motion.svelte';
import type { CurveFactory } from 'd3-shape';
import type { ColorProp, DataProp } from 'layerchart';
import type { LinkSweep, LinkType } from 'layerchart/utils/linkUtils';
import type { ValueProp } from '../../utils/values.js';

export type LinkProps = {
  /**
   * Rows to draw a link each for, or one link (as the core `Link` takes it).  Falls back to the
   * chart's data when `x1` / `y1` read rows.
   */
  data?: any[] | any;
  /**
   * Where each link starts across the plot: a data property name or function of the row
   * through the chart's `x` scale (longitude on a map), or pixels
   */
  x1?: DataProp;
  /** Where each link starts down the plot, as `x1` through the `y` scale (latitude on a map) */
  y1?: DataProp;
  /** Where each link ends across the plot, as `x1`.  Defaults to `x1`. */
  x2?: DataProp;
  /** Where each link ends down the plot, as `y1`.  Defaults to `y1`. */
  y2?: DataProp;
  /**
   * The height of each link's start: a data property name or function of the row through the
   * chart's `z` scale, or pixels.
   *
   * @default 0
   */
  z1?: DataProp;
  /** The height of each link's end, as `z1`.  @default 0 */
  z2?: DataProp;
  /**
   * Without `x1` / `y1`: the node each link starts at (ex. a hierarchy's links), placed by `x`
   * and `y` in pixels.
   *
   * @default (d) => d.source
   */
  source?: (d: any) => any;
  /** The node each link ends at, as `source`.  @default (d) => d.target */
  target?: (d: any) => any;
  /**
   * A node's pixels across the plot, for `source` / `target`.
   *
   * @default (node) => node.x (`node.y` with a horizontal `orientation`)
   */
  x?: (node: any) => number;
  /**
   * A node's pixels down the plot, for `source` / `target`.
   *
   * @default (node) => node.y (`node.x` with a horizontal `orientation`)
   */
  y?: (node: any) => number;
  /**
   * The path's shape across the floor, as the core `Link`: a d3 `curve` (`d3`), or a preset
   * (`straight`, `square`, `beveled`, `rounded`, `swoop`).  Straight around a `globe`.
   *
   * @default 'd3'
   */
  type?: LinkType;
  /** The d3 curve for `type="d3"`. @default curveBumpY (curveBumpX with a horizontal `orientation`) */
  curve?: CurveFactory;
  /** Which way the tree it links grows. @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Which way a preset path turns first, as the core `Link` */
  sweep?: LinkSweep;
  /** A `rounded` path's corner radius. @default 20 */
  radius?: number;
  /** A `swoop` path's bend, in degrees. @default 22.5 */
  bend?: number;
  /**
   * How high each link arches above the straight line between its ends, in pixels (ex. flight
   * paths over a map), or per row (a data key or function).
   *
   * @default 0 (straight)
   */
  arc?: ValueProp<number>;
  /**
   * A CSS color, or a data key / function run through the chart's color scale.
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: ColorProp;
  /** @default 1 */
  strokeWidth?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `stroke-surface-content/20`):
   * the stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /**
   * Tween each link to where it's asked to be, as the core `Link` (ex. `'tween'`, or `{ type:
   * 'tween', duration: 300 }`)
   */
  motion?: MotionTweenOption | MotionNoneOption;
};
