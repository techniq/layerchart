import type { Snippet } from 'svelte';
import type { draw as drawTransition } from 'svelte/transition';
import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { CurveFactory } from 'd3-shape';
import type { MarkerOptions } from '../Line/markers.js';

/**
 * The core `Spline`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`tooltip`)
 */
export type SplineProps = {
  /** Override data instead of using context */
  data?: any[];
  /**
   * Height off the floor: a data key or function (through the chart's `z` scale), or a number
   * of pixels.  Defaults to the chart's `z`.
   */
  z?: DataProp;
  /** Override `x` accessor from Chart context */
  x?: Accessor;
  /** Override `y` accessor from Chart context */
  y?: Accessor;
  /**
   * Draw one line per distinct value, in data order.  Defaults to the chart's `g`, else the
   * categorical data key `stroke` names, else the chart's `c` (as the core `Spline`).  A numeric
   * key (`stroke="z"`) colors along the line instead.
   */
  g?: Accessor;
  /**
   * Series key to use for accessor. Only applicable if `<Chart>` uses `series` and `x`/`y` are
   * not set.
   */
  seriesKey?: string;
  /** Whether a row is drawn: a line breaks at rows it isn't, as the core `Spline` does */
  defined?: (d: any, index: number, data: any[]) => boolean;
  /**
   * Curve of path drawn. Imported via d3-shape (ex. `curveMonotoneX`).  Straight between rows
   * without one.
   */
  curve?: CurveFactory;
  /**
   * A CSS color, or a data key / function run through the chart's color scale — per row, so a
   * line can change color along its length.  Defaults to the chart's `c`, else its series'
   * color, else `var(--color-primary)`.
   */
  stroke?: ColorProp;
  /**
   * A CSS color to fill the shape each line closes around, as an SVG path fills an open line (ex.
   * a `Hull`'s).  None without one (here or in `class`).
   */
  fill?: string | null;
  /** @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /**
   * Tween each line to where it's asked to be, as the core `Spline` (ex. `'tween'`, or `{ type:
   * 'tween', duration: 300 }`), a new one up from the baseline.  A spring leaves it, as core's.
   */
  motion?: MotionProp;

  /**
   * Pass `<path d={...} />` explicitly, drawn in place of the line its rows make: SVG path data in
   * the chart's pixels, as the core `Path` draws it
   */
  pathData?: string | null | (() => string | null | undefined);
  /**
   * Whether to animate the drawing of the path over time.  Pass either `true` or an object with
   * transition options (`duration`, `delay`, `speed`, `easing`) to enable the transition.  Each
   * line is drawn from its start, again as its rows change.
   *
   * Works best with `tweened` disabled.
   */
  draw?: boolean | Parameters<typeof drawTransition>[1];
  /**
   * Marker to attach to both start and end points of the line: drawn flat on the floor, turned
   * along the line, in its stroke color
   */
  marker?: MarkerOptions;
  /** Marker to attach to the middle point of the line (each row between its ends) */
  markerMid?: MarkerOptions;
  /** Marker to attach to the start point of the line */
  markerStart?: MarkerOptions;
  /** Marker to attach to the end point of the line */
  markerEnd?: MarkerOptions;
  /**
   * Add additional content at the start of the line (one per line).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  startContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Add additional content at the end of the line (following it as `draw` draws it).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  endContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /** The fill opacity of the element. @default 1 */
  fillOpacity?: number;
  /** The stroke opacity of the element. (0 to 1) @default 1 */
  strokeOpacity?: number;
  /** Line width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;

  /**
   * Show the tooltip for the row nearest where the pointer is over a line (with the chart's
   * `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
