import type { TicksConfig } from 'layerchart';

export type GridProps = {
  /**
   * Draw lines at the `x` scale's ticks, across the floor and up the wall behind.
   *
   * @default true
   */
  x?: boolean;
  /**
   * Draw lines at the `y` scale's ticks, across the floor and up the wall behind.
   *
   * @default true
   */
  y?: boolean;
  /**
   * Draw lines at the `z` scale's ticks, around both walls.
   *
   * @default true
   */
  z?: boolean;
  /** The `x` ticks: a count, values, or an interval, as for `Axis` */
  xTicks?: TicksConfig;
  /** The `y` ticks: a count, values, or an interval, as for `Axis` */
  yTicks?: TicksConfig;
  /** The `z` ticks: a count, values, or an interval, as for `Axis` */
  zTicks?: TicksConfig;
  /**
   * Shade the floor and the two walls away from the camera.  The walls turn to stay behind
   * the plot as the camera orbits, and only stand when the chart has height (`z`).  Flat
   * (without a `view`), the floor is left clear, as the core `Grid` leaves it.
   *
   * @default true with a `view`, else false
   */
  walls?: boolean;
  /**
   * The lines' CSS color.
   *
   * @default 'color-mix(in oklab, var(--color-surface-content) 10%, transparent)'
   */
  stroke?: string;
  /** The floor and walls' CSS color */
  fill?: string;
};
