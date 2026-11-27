import type { Snippet } from 'svelte';
import type { draw as drawTransition } from 'svelte/transition';
import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { MarkerOptions } from '../Line/markers.js';

/**
 * The core `Path`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`class`)
 */
export type PathProps = {
  /**
   * The `d` attribute of the rendered `<path>`: SVG path data in the chart's pixels (ex. a d3
   * shape's), lines, curves, and arcs, absolute or relative, in any number of subpaths.
   *
   * Accepts either a value (resolved at call site) or a function that returns the current value.
   */
  pathData?: string | null | (() => string | null | undefined);
  /**
   * Whether to animate the drawing of the path over time.  Pass either `true` or an object with
   * transition options (`duration`, `delay`, `speed`, `easing`) to enable the transition.  Drawn
   * again as the path data changes.
   *
   * Works best with `tweened` disabled.
   */
  draw?: boolean | Parameters<typeof drawTransition>[1];
  /**
   * Marker to attach to both start and end points of the line: drawn flat on the floor, turned
   * along the path, in its stroke color
   */
  marker?: MarkerOptions;
  /** Marker to attach to the middle point of the line (each vertex between its ends) */
  markerMid?: MarkerOptions;
  /** Marker to attach to the start point of the line */
  markerStart?: MarkerOptions;
  /** Marker to attach to the end point of the line */
  markerEnd?: MarkerOptions;
  /**
   * Add additional content at the start of the line (ex. a `Text`, inside a `Group` there).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  startContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Add additional content at the end of the line (following it as `draw` draws it).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  endContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Tween to new path data, as the core `Path` (ex. `'tween'`, or `{ type: 'tween', duration:
   * 300 }`)
   */
  motion?: MotionProp;
  /**
   * Stand the shape up `z` pixels off the floor (on an `isometric` chart, or in a 3D view), or
   * between `[start, end]` (it lies at the top).  @default 0
   */
  z?: number | [start: number, end: number];
  /** The fill color of the element.  Drawn only with one (here or in `class`), between its subpaths */
  fill?: string | null;
  /** The fill opacity of the element. @default 1 */
  fillOpacity?: number;
  /**
   * The stroke color of the element.  Drawn without a `fill` in `surface-content` unless
   * `none`.
   */
  stroke?: string | null;
  /** The stroke width of the element, in pixels. @default 1 */
  strokeWidth?: number;
  /** The stroke opacity of the element. (0 to 1) @default 1 */
  strokeOpacity?: number;
  /** The opacity of the element. (0 to 1) @default 1 */
  opacity?: number;

  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-primary/20
   * stroke-primary`): the fill, stroke, stroke width, and opacity they set, where its props don't
   */
  class?: string;
};
