import type { Snippet } from 'svelte';
import type { draw as drawTransition } from 'svelte/transition';
import type { MotionNoneOption, MotionTweenOption } from 'layerchart/utils/motion.svelte';
import type { CurveFactory } from 'd3-shape';
import type { ColorProp, DataProp } from 'layerchart';
import type { LinkSweep, LinkType } from 'layerchart/utils/linkUtils';
import type { ValueProp } from '../../utils/values.js';
import type { MarkerOptions } from '../Line/markers.js';

/**
 * The core `Link`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`arc`)
 */
export type LinkProps = {
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
   * Rows to draw a link each for, or one link (as the core `Link` takes it).  Falls back to the
   * chart's data when `x1` / `y1` read rows.
   */
  data?: any[] | any;
  /**
   * Draw a `Sankey` layout's link (`data`), as the core `Link`: from its source node's right
   * edge (`x1`) at its `y0` to its target's left edge (`x0`) at its `y1`, across horizontally.
   *
   * @default false
   */
  sankey?: boolean;
  /**
   * Without `x1` / `y1`: the node each link starts at (ex. a hierarchy's links), placed by `x`
   * and `y` in pixels.
   *
   * @default (d) => d.source (with `sankey`, the source node, at the link's `y0`)
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
  /** A `rounded` path's corner radius. @default 20 */
  radius?: number;
  /** A `swoop` path's bend, in degrees. @default 22.5 */
  bend?: number;
  /** The d3 curve for `type="d3"`. @default curveBumpY (curveBumpX with a horizontal `orientation`) */
  curve?: CurveFactory;
  /** Which way a preset path turns first, as the core `Link` */
  sweep?: LinkSweep;
  /** Which way the tree it links grows. @default 'vertical' ('horizontal' with `sankey`) */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Lay the link out around a circle, as the core `Link` on a `radial` chart: a node's `x` is
   * its angle (radians) and `y` its distance from the center, which is the origin (ex. inside a
   * `Group center`).  Defaults to the chart's `radial`.
   */
  radial?: boolean;
  /**
   * Marker to attach to both start and end points of the line: drawn flat on the floor, turned
   * along the link, in its color
   */
  marker?: MarkerOptions;
  /** Marker to attach to the middle point of the line (each corner between its ends) */
  markerMid?: MarkerOptions;
  /** Marker to attach to the start point of the line */
  markerStart?: MarkerOptions;
  /** Marker to attach to the end point of the line */
  markerEnd?: MarkerOptions;
  /**
   * Tween each link to where it's asked to be, as the core `Link` (ex. `'tween'`, or `{ type:
   * 'tween', duration: 300 }`)
   */
  motion?: MotionTweenOption | MotionNoneOption;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `stroke-surface-content/20`):
   * the stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /**
   * The `d` attribute of the rendered `<path>`: SVG path data in the chart's pixels, drawn in
   * place of the path between each link's ends (eased from its start's height to its end's).
   *
   * Accepts either a value (resolved at call site) or a function that returns the current value.
   */
  pathData?: string | null | (() => string | null | undefined);
  /**
   * Whether to animate the drawing of the path over time.  Pass either `true` or an object with
   * transition options (`duration`, `delay`, `speed`, `easing`) to enable the transition.  Each
   * link is drawn from its start, again as the links change.
   *
   * Works best with `tweened` disabled.
   */
  draw?: boolean | Parameters<typeof drawTransition>[1];
  /**
   * Add additional content at the start of each link (ex. a `Text`, inside a `Group` there).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  startContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Add additional content at the end of each link (following it as `draw` draws it).
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  endContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;
  /**
   * Raise every link `z` pixels off the floor, or to the end of `[start, end]` (an unfilled path
   * is only raised, as the core `Path`'s), over its ends' own `z1` / `z2`.  @default 0
   */
  z?: number | [start: number, end: number];
  /**
   * The fill color of the element, or a function of the row: between a link's path and the
   * chord across its ends, as an SVG path fills an open one.  Only for a link lying flat (its
   * ends at one height, without an `arc`, off a `globe`).
   */
  fill?: string | null | ((d: any) => string | null | undefined);
  /** The fill opacity of the element. @default 1 */
  fillOpacity?: number;
  /**
   * A CSS color, or a data key / function run through the chart's color scale.
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: ColorProp;
  /** The stroke opacity (0 to 1) @default 1 */
  strokeOpacity?: number;
  /** @default 1 */
  strokeWidth?: number;
  /** @default 1 */
  opacity?: number;

  /**
   * How high each link arches above the straight line between its ends, in pixels (ex. flight
   * paths over a map), or per row (a data key or function).
   *
   * @default 0 (straight)
   */
  arc?: ValueProp<number>;
};
