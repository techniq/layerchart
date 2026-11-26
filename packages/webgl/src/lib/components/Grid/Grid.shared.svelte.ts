import type { TicksConfig } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';

/** How one axis' grid lines are drawn, as the core `Grid` forwards them onto its lines */
export type GridLineProps = {
  /** CSS classes to style them by (their stroke, width, and opacity) */
  class?: string;
  stroke?: string;
  /** Width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  opacity?: number;
  /** Dashed-line pattern: a dash length, `[dash, gap]`, or an SVG `stroke-dasharray`, in pixels */
  dashArray?: number | number[] | string;
};

/**
 * The core `Grid`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`walls`, `fill`)
 */
export type GridProps = {
  /**
   * Draw a x-axis lines, across the floor and up the wall behind. Pass props (class, stroke,
   * strokeWidth, opacity, dashArray) to style them.
   *
   * @default true
   */
  x?: boolean | GridLineProps;
  /**
   * Draw a y-axis lines, across the floor and up the wall behind. Pass props (class, stroke,
   * strokeWidth, opacity, dashArray) to style them.
   *
   * @default true
   */
  y?: boolean | GridLineProps;
  /**
   * Draw lines at the `z` scale's ticks, around both walls, and pass props to style them.
   *
   * @default true
   */
  z?: boolean | GridLineProps;
  /** Control the number of x-axis ticks: a count, values, or an interval, as for `Axis` */
  xTicks?: TicksConfig;
  /** Control the number of y-axis ticks: a count, values, or an interval, as for `Axis` */
  yTicks?: TicksConfig;
  /** Control the number of `z` gridlines: a count, values, or an interval, as for `Axis` */
  zTicks?: TicksConfig;
  /**
   * Line alignment when band scale is used (x or y axis): through each band's middle, or between
   * the bands (and past the last).
   *
   * @default 'center'
   */
  bandAlign?: 'center' | 'between';
  /**
   * Stroke color for grid lines.
   *
   * @default 'color-mix(in oklab, var(--color-surface-content) 10%, transparent)'
   */
  stroke?: string;
  /**
   * Classes to style the lines by (their stroke, width, and opacity): `root` for all of it,
   * `line` for every line.
   *
   * @default {}
   */
  classes?: {
    root?: string;
    line?: string;
  };
  /** Ease each line to where its tick moves, ex. `'tween'` or `{ type: 'spring' }` */
  motion?: MotionProp;

  /**
   * Shade the floor and the two walls away from the camera.  The walls turn to stay behind
   * the plot as the camera orbits, and only stand when the chart has height (`z`).  Flat
   * (without a `view`), the floor is left clear, as the core `Grid` leaves it.
   *
   * @default true with a `view`, else false
   */
  walls?: boolean;
  /** The floor and walls' CSS color */
  fill?: string;
};
