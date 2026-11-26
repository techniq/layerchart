import type { ColorProp, DataProp } from 'layerchart';
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
  /** A node's pixels across the plot, for `source` / `target`.  @default (node) => node.x */
  x?: (node: any) => number;
  /** A node's pixels down the plot, for `source` / `target`.  @default (node) => node.y */
  y?: (node: any) => number;
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
  /**
   * CSS classes to style it by, as the core marks take them (ex. `stroke-surface-content/20`):
   * the stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
};
