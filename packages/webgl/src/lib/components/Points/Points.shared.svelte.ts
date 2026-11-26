import type { Snippet } from 'svelte';
import type { Point } from 'layerchart/base';
import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { ImageSource } from '../../utils/texture.js';
import type { Offset } from '../../utils/marks.js';
import type { ValueProp } from '../../utils/values.js';
import type { MotionProp } from 'layerchart/utils/motion.svelte';

/**
 * The core `Points`' props (in its order, as it describes them, then those it takes from
 * `Circle`), then those of a `WebGL` layer's own (`glow`, `image`, ...)
 */
export type PointsProps = {
  /** Override data instead of using context */
  data?: any[];
  /** Override `x` accessor from Chart context */
  x?: Accessor;
  /** Override `y` accessor from Chart context */
  y?: Accessor;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /**
   * Override `r` accessor from Chart context: a radius in pixels, or per row (a data key or
   * function, in pixels).  Defaults to the chart's `r` scale when it has one.
   *
   * @default 5
   */
  r?: ValueProp<number>;
  /** The offset of the point in the x direction */
  offsetX?: Offset;
  /** The offset of the point in the y direction */
  offsetY?: Offset;
  /** Draws in place of the points, given each row's point (ex. `Labels`' text at each) */
  children?: Snippet<[{ points: Point[] }]>;
  /**
   * Fill color: a CSS color, or a data key / function run through the chart's color scale.
   * Defaults to the chart's `c`, else `var(--color-primary)`.
   */
  fill?: ColorProp;
  /** Fill opacity (0-1) */
  fillOpacity?: number;
  /**
   * Stroke color: a CSS color, or a data key / function run through the chart's color scale.
   * Drawn flat (2D), where points are discs; a 3D view's lit spheres have none.
   */
  stroke?: ColorProp;
  /** Stroke width in pixels @default 1 */
  strokeWidth?: number;
  /** Stroke opacity (0-1) */
  strokeOpacity?: number;
  /** Overall opacity (0-1) @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set.  A `mix-blend-mode` of `plus-lighter`
   * or `screen` (ex. `mix-blend-plus-lighter`) adds the points' light together where they
   * overlap.
   */
  class?: string;
  /**
   * Height off the floor: a data key or function (through the chart's `z` scale), or a number
   * of pixels.  Defaults to the chart's `z`.
   */
  z?: DataProp;
  /**
   * The initial center x position of each new point, in pixels, to ease from with `motion`.
   *
   * @default its own
   */
  initialCx?: number;
  /**
   * The initial center y position of each new point, in pixels, to ease from with `motion` (ex.
   * the plot's bottom, to rise in).
   *
   * @default its own
   */
  initialCy?: number;
  /**
   * Keep the points facing the viewer (round), as the core `Points` on an `isometric` chart.
   * Always so here: a flat chart's points are discs seen from above, and a 3D view's are
   * spheres, round from any side.
   *
   * @default false
   */
  viewport?: boolean;
  /**
   * The initial radius of each new point, to ease from with `motion` (ex. `0` to grow in).
   *
   * @default its own
   */
  initialR?: number;
  /**
   * Which point each row is as rows change, for `motion` (a new key eases in from
   * `initialCx` / `initialCy` / `initialR`).
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => unknown;
  /**
   * Ease each point to where it's asked to be, as the core `Points` (a `Circle` each) do (ex.
   * `'spring'`, or `{ type: 'tween', duration: 300 }`), or each of `cx`, `cy`, and `r` by its
   * own (ex. `{ r: 'spring' }`).  None without it, at no cost.
   */
  motion?: MotionProp<'cx' | 'cy' | 'r'>;
  /**
   * Dashed-border pattern. Accepts a number (single dash length), a
   * `[dash, gap, ...]` array, or a string (same syntax as SVG
   * `stroke-dasharray`), in pixels: its ring's (drawn flat), its first dash and gap repeating.
   */
  dashArray?: number | number[] | string;

  /**
   * Scale of the hovered point.
   *
   * @default 1.4
   */
  hoverScale?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Draw each sphere in its own color (or image), whatever the lights: ex. a star, lighting the
   * rest with a `Light type="point"` inside it.
   *
   * @default false
   */
  glow?: boolean;
  /**
   * An equirectangular image to wrap each sphere in (ex. a planet's surface): a URL, or an image
   * or canvas already drawn, or per row, a data key or function.  A string names the row's field
   * when the row has one by that name, else is a URL when it looks like one (`"earth.jpg"`).
   * Rows without one are colored by `fill`.
   */
  image?: ValueProp<ImageSource | null | undefined>;
  /**
   * Degrees to turn an image-wrapped sphere about its axis (ex. a planet's spin), or per row (a
   * data key or function).
   *
   * @default 0
   */
  rotate?: ValueProp<number>;
  /**
   * Degrees an image-wrapped sphere's axis leans from upright (ex. `23.4` for the Earth), or per
   * row (a data key or function).
   *
   * @default 0
   */
  tilt?: ValueProp<number>;
};
