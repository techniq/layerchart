import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { ImageSource } from '../../utils/texture.js';
import type { ValueProp } from '../../utils/values.js';

export type PointsProps = {
  /** Override the chart's `data` */
  data?: any[];
  /** Override the chart's `x` accessor */
  x?: Accessor;
  /** Override the chart's `y` accessor */
  y?: Accessor;
  /**
   * Height off the floor: a data key or function (through the chart's `z` scale), or a number
   * of pixels.  Defaults to the chart's `z`.
   */
  z?: DataProp;
  /**
   * Radius in pixels, or per row (a data key or function, in pixels).  Defaults to the chart's
   * `r` scale when it has one, else `5`.
   */
  r?: ValueProp<number>;
  /**
   * A CSS color, or a data key / function run through the chart's color scale.  Defaults to the
   * chart's `c`, else `var(--color-primary, currentColor)`.
   */
  fill?: ColorProp;
  /**
   * A ring around each point, straddling its edge as the core `Points` strokes its circles:
   * a CSS color, or a data key / function run through the chart's color scale.  None without
   * one (here or in `class`).  Drawn in the flat (2D) mode, where points are discs; a 3D view's
   * lit spheres have none.
   */
  stroke?: ColorProp;
  /** The ring's width in pixels. @default 1 */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say.  A
   * `mix-blend-mode` of `plus-lighter` or `screen` (ex. `mix-blend-plus-lighter`) adds the
   * points' light together where they overlap.
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
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
