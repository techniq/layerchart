import type { ColorProp, DataProp } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { MarkerOptions } from './markers.js';

/**
 * The core `Line`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`style`)
 */
export type LineProps = {
  /**
   * The x-coordinate of the line's starting point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @required
   */
  x1: DataProp;
  /** The initial x-coordinate of the line's starting point (pixel mode only). @default x1 */
  initialX1?: number;
  /**
   * The y-coordinate of the line's starting point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @required
   */
  y1: DataProp;
  /** The initial y-coordinate of the line's starting point (pixel mode only). @default y1 */
  initialY1?: number;
  /**
   * The x-coordinate of the line's ending point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @required
   */
  x2: DataProp;
  /** The initial x-coordinate of the line's ending point (pixel mode only). @default x2 */
  initialX2?: number;
  /**
   * The y-coordinate of the line's ending point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @default y2
   */
  y2: DataProp;
  /**
   * The height of the line's start off the floor (on an `isometric` chart, or in a 3D view): a
   * data property or accessor (through zScale), or pixels.
   *
   * @default 0
   */
  z1?: DataProp;
  /** The height of the line's end (see `z1`).  @default 0 */
  z2?: DataProp;
  /** The initial y-coordinate of the line's ending point (pixel mode only). @default y2 */
  initialY2?: number;
  /**
   * Data array to iterate over in data mode.
   * Falls back to chart context data when not provided.
   */
  data?: any[];
  /**
   * Key function for each row in data mode, which its `motion` eases by.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => any;
  /**
   * Marker to attach to both start and end points of the line: drawn flat on the floor, turned
   * along the line, in its color
   */
  marker?: MarkerOptions;
  /** Marker to attach to the start point of the line */
  markerStart?: MarkerOptions;
  /** Marker to attach to the mid point of the line (a straight line has none) */
  markerMid?: MarkerOptions;
  /** Marker to attach to the end point of the line */
  markerEnd?: MarkerOptions;
  /**
   * Motion configuration: each end eased to where it's asked to be (ex. `'tween'`, or per end,
   * `{ x2: { type: 'tween', duration: 300 } }`), from `initialX1` ... in pixel mode
   */
  motion?: MotionProp;
  /**
   * Dashed-line pattern. Accepts a number (single dash length), a `[dash, gap, ...]` array, or a
   * string (same syntax as SVG `stroke-dasharray`), in pixels: its first dash and gap.
   */
  dashArray?: number | number[] | string;
  /**
   * The stroke color.
   * - `string`: in data mode, if it matches a data property name, the value is extracted and
   *   passed through cScale. Otherwise used as a literal CSS color.
   * - `function(d)`: accessor called per data item, result passed through cScale.
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: ColorProp;
  /** The stroke opacity (0 to 1) @default 1 */
  strokeOpacity?: number;
  /** The stroke width, in pixels @default 1 */
  strokeWidth?: number;
  /** The opacity (0 to 1) @default 1 */
  opacity?: number;
  /**
   * CSS class name(s), as the core marks take them (ex. `stroke-primary`): the stroke, stroke
   * width, and opacity they set, where its props don't say
   */
  class?: string;

  /**
   * Inline CSS, as on the core marks' elements (ex. `--fill-color: var(--color-primary)`): the
   * colors it sets, as LayerChart's styles read them
   */
  style?: string;
};
