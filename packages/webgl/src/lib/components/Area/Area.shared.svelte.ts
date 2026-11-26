import type { Snippet } from 'svelte';
import type { draw as drawTransition } from 'svelte/transition';
import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { CurveFactory } from 'd3-shape';
import type { MarkerOptions } from '../Line/markers.js';

/**
 * The core `Area`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`y`, `z0`, `tooltip`)
 */
export type AreaProps = {
  /** Override data instead of using context */
  data?: any[];
  /**
   * Stand the area up as a curtain off the floor at each row's `y`, rising to this height: a
   * key or function of the row (through the chart's `z` scale), or a number of pixels.  Defaults
   * to the chart's `z`; without one (or with `y0` / `y1`), the area lies on the floor, between
   * `y0` and `y1`, as the core `Area` fills the plot.
   */
  z?: DataProp;
  /**
   * Pass `<path d={...} />` explicitly instead of calculating from data / context: SVG path data
   * in the plot's pixels, filled on the floor as the core `Path` draws it
   */
  pathData?: string | null;
  /** Override the chart's `x` accessor */
  x?: Accessor;
  /**
   * The area's base down the plot, as the core `Area`: an accessor of the row.  Defaults to
   * a stacked row's base, else the bottom of the plot.
   */
  y0?: Accessor;
  /** The area's top down the plot, likewise.  Defaults to a stacked row's top, else `y`. */
  y1?: Accessor;
  /**
   * Draw one area per distinct value, in data order.  Defaults to the chart's `g`, else the
   * categorical data key `fill` / `stroke` names, else the chart's `c` (as `Spline`).
   */
  g?: Accessor;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /**
   * Tween each area to where it's asked to be, as the core `Area` (ex. `'tween'`, or `{ type:
   * 'tween', duration: 300 }`), a new one up from the baseline.  A spring leaves it, as core's.
   */
  motion?: MotionProp;
  /** The d3 curve the area's edges take through its rows (ex. `curveMonotoneX`) */
  curve?: CurveFactory;
  /** Whether a row is drawn: the area breaks at rows it isn't, as the core `Area` does */
  defined?: (d: any, index: number, data: any[]) => boolean;
  /**
   * Draw a line along the top: in the fill's color, or as the core `Area`'s `line` takes it, with
   * its own `stroke` (a CSS color, or a key / function of the area's first row run through the
   * color scale), `strokeWidth`, and `class` (ex. `{ class: 'stroke-2 stroke-primary' }`).
   *
   * @default false
   */
  line?: boolean | { stroke?: ColorProp; strokeWidth?: number; class?: string };
  /**
   * Fill color, the name of a data property (resolved via the chart's `c` scale), or a function
   * (read from each area's first row).  Defaults to the chart's `c`, else its series' color,
   * else `var(--color-primary)`.
   */
  fill?: ColorProp;
  /**
   * Stroke color, the name of a data property, or a function (read from each area's first row):
   * an outline around each area, as the core `Area`'s path takes it.  None without one (here or
   * in `class`).
   */
  stroke?: ColorProp;
  /**
   * Opacity of the area and its outline (its line stays solid).
   *
   * @default 1
   */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;

  /**
   * Whether to animate the drawing of its outline over time (with a `stroke`), as the core
   * `Area`'s path draws it.  Pass either `true` or an object with transition options
   * (`duration`, `delay`, `speed`, `easing`) to enable the transition.
   *
   * Works best with `tweened` disabled.
   */
  draw?: boolean | Parameters<typeof drawTransition>[1];
  /**
   * Marker to attach to both start and end points of its outline (with a `stroke`): drawn flat
   * on the floor, turned along it, in its stroke color
   */
  marker?: MarkerOptions;
  /** Marker to attach to the middle point of the outline (each vertex between its ends) */
  markerMid?: MarkerOptions;
  /** Marker to attach to the start point of the outline */
  markerStart?: MarkerOptions;
  /** Marker to attach to the end point of the outline (where it closes, at its start) */
  markerEnd?: MarkerOptions;
  /**
   * Add additional content at the start of the area's path (its top's first point).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  startContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Add additional content at the end of the area's path (following it as `draw` draws it).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  endContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /** Opacity of its fill, with `opacity` @default 1 */
  fillOpacity?: number;
  /** Opacity of its outline (not its `line`), with `opacity` @default 1 */
  strokeOpacity?: number;
  /** The width of the line and the outline, in pixels. @default 1 */
  strokeWidth?: number;

  /** Override the chart's `y` accessor */
  y?: Accessor;
  /**
   * A curtain's base, likewise.
   *
   * @default 0 (the floor)
   */
  z0?: DataProp;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
