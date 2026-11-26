import type { Corners } from 'layerchart/utils/rect.svelte';
import type { MotionOptions } from 'layerchart/utils/motion.svelte';
import type { ColorProp, DataProp } from 'layerchart';

export type RectProps = {
  /** Rows to draw a box each for.  Falls back to the chart's data when the props read rows. */
  data?: any[];
  /**
   * Left edge: a data property name or function of the row through the chart's `x` scale, or
   * pixels
   */
  x?: DataProp;
  /**
   * Top edge (its far side, before the view turns): a data property name or function of the
   * row through the chart's `y` scale, or pixels
   */
  y?: DataProp;
  /** Width across `x`, in pixels: a number, data property name, or function of the row */
  width?: DataProp;
  /** Depth down `y`, in pixels: a number, data property name, or function of the row */
  height?: DataProp;
  /** One side across `x`, as `x` (with `x1`, rather than `x` and `width`) */
  x0?: DataProp;
  /** The other side across `x`, as `x` */
  x1?: DataProp;
  /** One side down `y`, as `y` (with `y1`, rather than `y` and `height`) */
  y0?: DataProp;
  /** The other side down `y`, as `y` */
  y1?: DataProp;
  /**
   * How tall each box stands: a data property name or function of the row through the chart's
   * `z` scale (a function can return `[start, end]` to float the box between them), pixels, or
   * a `[start, end]` pair of pixels.  Defaults to the chart's `z` with rows, else a thin tile.
   */
  z?: DataProp | [start: number, end: number];
  /**
   * A CSS color, or a key / function of the row run through the chart's color scale.
   * `none` draws only its outline.
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp;
  /**
   * The outline, as the core isometric boxes draw theirs: around each box's top and up its
   * corners (ex. lines between a treemap's siblings).  A CSS color, or a key / function of the
   * row run through the color scale.  None without one (here or in `class`).
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
  /** Corner radius in pixels, rounding a flat rect, as the core `Rect`'s. @default 0 */
  rx?: number;
  /**
   * Per-corner radii, rounding a flat rect, as the core `Rect`'s: a number, a `[tl, tr, br, bl]`
   * tuple, or `{ topLeft, topRight, bottomRight, bottomLeft }`.  Wins over `rx`.
   */
  corners?: Corners;
  /** The fill's opacity, as the core `Rect`'s (its outline's is `opacity`). @default 1 */
  fillOpacity?: number;
  /**
   * Inline CSS, as on the core marks' elements (ex. `--fill-color: var(--color-primary)`): the
   * colors it sets, as LayerChart's styles read them
   */
  style?: string;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Ease each box to where it's asked to be, as the core `Rect` (ex. `'spring'`, or
   * `{ type: 'tween', duration: 300 }`)
   */
  motion?: MotionOptions;
  /** Which box each row is as rows change, for `motion`. @default (d, i) => i */
  key?: (d: any, index: number) => unknown;
};
