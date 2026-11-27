import type { Corners, Insets } from 'layerchart/utils/rect.svelte';
import type { MotionOptions } from 'layerchart/utils/motion.svelte';
import type { ColorProp, DataProp } from 'layerchart';
import type { MarkEvents } from '../../contexts/scene.svelte.js';

/**
 * The core `Rect`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`tooltip`)
 */
export type RectProps = {
  /**
   * The x position of the rectangle (its left edge).
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @default 0
   */
  x?: DataProp;
  /**
   * The initial x position (pixel mode only), as it eases in with `motion`.
   *
   * @default x
   */
  initialX?: number;
  /**
   * The y position of the rectangle (its top edge: its far side, before the view turns).
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @default 0
   */
  y?: DataProp;
  /**
   * The initial y position (pixel mode only), as it eases in with `motion`.
   *
   * @default y
   */
  initialY?: number;
  /**
   * The width of the rectangle (pixels): a number, data property name, or function of the row.
   *
   * @default 0
   */
  width?: DataProp;
  /** The initial width (pixel mode only), as it eases in with `motion` */
  initialWidth?: number;
  /**
   * The height of the rectangle (pixels, down `y`): a number, data property name, or function of
   * the row.
   *
   * @default 0
   */
  height?: DataProp;
  /** The initial height (pixel mode only), as it eases in with `motion` */
  initialHeight?: number;
  /**
   * Left/start x edge (data mode).
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   * - `number`: pixel value
   */
  x0?: DataProp;
  /**
   * Right/end x edge (data mode).
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   * - `number`: pixel value
   */
  x1?: DataProp;
  /**
   * Top/start y edge (data mode).
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   * - `number`: pixel value
   */
  y0?: DataProp;
  /**
   * Bottom/end y edge (data mode).
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   * - `number`: pixel value
   */
  y1?: DataProp;
  /**
   * Height to raise the rectangle into a box, defaulting to the chart's `z` in data mode (else a
   * thin tile).
   * - `string`: data property name, resolved via zScale
   * - `function(d)`: accessor called per data item, result passed through zScale (or returning
   *   `[start, end]` to float the box between them)
   * - `number`: pixel height (also in pixel mode)
   * - `[start, end]`: pixel heights to float the box between
   */
  z?: DataProp | [start: number, end: number];
  /**
   * Whether a box raised by `z` shades its sides, by the scene's lights.  Without, each face is
   * its own color, unlit.
   *
   * @default true
   */
  shade?: boolean;
  /**
   * Insets to shrink the rendered rectangle.
   * Supports `all`, `x`, `y`, `left`, `right`, `top`, `bottom`.
   */
  insets?: Insets;
  /**
   * Data array to iterate over in data mode.
   * Falls back to chart context data when not provided.
   */
  data?: any[];
  /**
   * Which box each row is as rows change, for `motion`.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => unknown;
  /**
   * Motion configuration, easing each box to where it's asked to be (ex. `'spring'`, or
   * `{ type: 'tween', duration: 300 }`)
   */
  motion?: MotionOptions;
  /**
   * Dashed-border pattern. Accepts a number (single dash length), a
   * `[dash, gap, ...]` array, or a string (same syntax as SVG
   * `stroke-dasharray`).  Its first dash and gap repeat.
   */
  dashArray?: number | number[] | string;
  /**
   * Per-corner radii, rounding a flat rect. Accepts a number (all corners equal — same as `rx`),
   * a `[tl, tr, br, bl]` tuple, or `{ topLeft, topRight, bottomRight, bottomLeft }`.
   * Takes precedence over `rx`.
   */
  corners?: Corners;
  /**
   * The fill color: a CSS color, or a key / function of the row run through the chart's color
   * scale.  `none` draws only its outline.
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp;
  /** The fill opacity (0 to 1). @default 1 */
  fillOpacity?: number;
  /**
   * The stroke color, as the core isometric boxes draw theirs: around each box's top and up its
   * corners (ex. lines between a treemap's siblings).  A CSS color, or a key / function of the
   * row run through the color scale.  None without one (here or in `class`).
   */
  stroke?: ColorProp;
  /** The stroke width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  /** The stroke opacity (0 to 1). @default 1 */
  strokeOpacity?: number;
  /** The opacity (0 to 1). @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /**
   * Inline CSS, as on the core marks' elements (ex. `--fill-color: var(--color-primary)`): the
   * colors it sets, as LayerChart's styles read them
   */
  style?: string;
  /** Corner radius in pixels, rounding a flat rect. @default 0 */
  rx?: number;
  /** Click event handler, called with the box's row (`{ data }`, none in pixel mode) */
  onclick?: MarkEvents['onclick'];
  /** Double click event handler, called with the box's row */
  ondblclick?: MarkEvents['ondblclick'];
  /** Pointer enter event handler, called with the box's row */
  onpointerenter?: MarkEvents['onpointerenter'];
  /** Pointer move event handler, called with the box's row */
  onpointermove?: MarkEvents['onpointermove'];
  /** Pointer leave event handler, called with the box's row */
  onpointerleave?: MarkEvents['onpointerleave'];
  /** Pointer over event handler, called with the box's row */
  onpointerover?: MarkEvents['onpointerover'];
  /** Pointer out event handler, called with the box's row */
  onpointerout?: MarkEvents['onpointerout'];

  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
