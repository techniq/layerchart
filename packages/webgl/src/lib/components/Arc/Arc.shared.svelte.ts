import type { ArcProps as CoreArcProps, ColorProp, DataProp } from 'layerchart';
import type { MotionOptions } from 'layerchart/utils/motion.svelte';

/** How the track behind an arc is drawn */
export type ArcTrackProps = {
  /** CSS classes to style it by, as core marks take them (ex. `fill-red-500/10`) */
  class?: string;
  /** @default 'color-mix(in oklab, var(--color-surface-content) 10%, transparent)' */
  fill?: string;
  /** The outline's CSS color.  No outline without one. */
  stroke?: string;
  /** @default 1 */
  opacity?: number;
};

export type ArcProps = {
  /** The value the arc runs to, through `domain` into `range` (as a gauge) */
  value?: number;
  /** The value to ease from with `motion`. @default 0 */
  initialValue?: number;
  /** Domain [min,max] of `value`. @default [0, 100] */
  domain?: [number, number];
  /** Range [min,max] in degrees. See also startAngle/endAngle. @default [0, 360] */
  range?: [number, number];
  /**
   * Start angle in radians, clockwise from the top of the plot (its far edge before the view
   * turns)
   */
  startAngle?: number;
  /** End angle in radians */
  endAngle?: number;
  /**
   * Define innerRadius. Defaults to yRange min
   *   • value >= 1: discrete value
   *   • value < 1: percent of `outerRadius`
   *   • value < 0: offset of `outerRadius`
   */
  innerRadius?: number;
  /**
   * Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/2)
   */
  outerRadius?: number;
  /** @default 0 */
  cornerRadius?: number;
  /** @default 0 */
  padAngle?: number;
  /** Pixels to move it out from the center, along its middle angle (ex. to pull a slice out) */
  offset?: number;
  /**
   * Draw the whole range behind the arc (as a gauge's track): `true` for the default look, or
   * how to draw it
   */
  track?: boolean | ArcTrackProps;
  trackStartAngle?: number;
  trackEndAngle?: number;
  trackInnerRadius?: number;
  trackOuterRadius?: number;
  /** @default cornerRadius */
  trackCornerRadius?: number;
  /** @default padAngle */
  trackPadAngle?: number;
  /**
   * The center across, in pixels.  Defaults to the plot's center, or inside a `Group` (or a
   * centered layer) to its origin, as the core `Arc`.
   */
  x?: number;
  /** The center down, in pixels.  Defaults as `x`. */
  y?: number;
  /**
   * How tall it stands, as the core `Arc` on an `isometric` chart: pixels, or a
   * `[start, end]` pair of pixels to float it between (or a key / function of `data` through
   * the chart's `z` scale).  Flat on the floor without one.
   */
  z?: DataProp | [start: number, end: number];
  /** The row it shows in the tooltip, and its `fill` / `stroke` read */
  data?: any;
  /**
   * A CSS color, or a key / function of `data` run through the chart's color scale.
   *
   * @default 'var(--color-primary)'
   */
  fill?: ColorProp;
  /** The outline: a CSS color, or a key / function of `data` run through the color scale */
  stroke?: ColorProp;
  /** @default 1 */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /** Ease `value` changes */
  motion?: MotionOptions;
  /**
   * Show the tooltip for `data` when the pointer is over it (with the chart's
   * `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Drawn with the arc, given what the core `Arc` gives its children (ex. `getArcTextProps` to
   * place a `Text` at its centroid)
   */
  children?: CoreArcProps['children'];
};
