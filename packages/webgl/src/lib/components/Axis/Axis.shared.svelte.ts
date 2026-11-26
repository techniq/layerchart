import type { autoTickFormat, TicksConfig } from 'layerchart';

/** How an axis draws its labels, as `Text` draws them */
export type AxisLabelProps = {
  /**
   * Face the viewer, drawn over the scene upright and crisp, rather than on the plot box: the
   * floor's labels (`bottom`, `left`) lie on it, as an `isometric` chart's do, and the height
   * axis' (`back`) stand on the back wall beside its edge, turning with it.
   *
   * @default false
   */
  viewport?: boolean;
  /** Class added to each `viewport` label */
  class?: string;
  /**
   * Font size in pixels of the plot, for labels on the plot box.  Defaults to read about as
   * large as `viewport` labels as the view is fitted.
   */
  fontSize?: number;
  /** Font weight, for labels on the plot box */
  fontWeight?: number | string;
  /** CSS color, for labels on the plot box */
  fill?: string;
  /** Degrees to turn tick labels on the plot box, as the core `Axis`' (ex. `315` up and across) */
  rotate?: number;
  /** Tick labels' horizontal anchor, as the core `Axis`' (ex. `'end'` with `rotate`) */
  textAnchor?: 'start' | 'middle' | 'end';
  /** Tick labels' vertical anchor, as the core `Axis`' */
  verticalAnchor?: 'start' | 'middle' | 'end';
};

export type AxisProps = {
  /**
   * Which axis: `bottom` labels `x` along the floor's front edge (`top` along its back), `left`
   * labels `y` along its side (`right` along the other), and `back` labels `z` up a corner.  Same
   * as an `isometric` chart's.  The edges turn to stay in front as the camera orbits.
   */
  placement: 'bottom' | 'top' | 'left' | 'right' | 'back';
  /**
   * Lines across the plot at its ticks, as the core `Axis` draws them: in their CSS `stroke`, or
   * the one a `class` sets
   *
   * @default false
   */
  grid?: boolean | { stroke?: string; class?: string };
  /** Title drawn beyond the tick labels */
  label?: string;
  /** A count, values, or an interval */
  ticks?: TicksConfig;
  /**
   * Pixels between ticks, picking how many there are as the axis' length changes (as the core
   * `Axis`).  `null` leaves the count to the scale.
   *
   * @default 50 in a 3D view (80 across a flat one)
   */
  tickSpacing?: number | null;
  /** How to format tick values */
  format?: Parameters<typeof autoTickFormat>[0]['formatType'];
  /**
   * Draw a line along the axis' edge of the plot box.
   *
   * @default false
   */
  rule?: boolean;
  /**
   * Draw a mark out from the edge at each tick.
   *
   * @default true
   */
  tickMarks?: boolean;
  /**
   * How far tick marks reach out from the edge, in pixels.
   *
   * @default 4
   */
  tickLength?: number;
  /**
   * Pixels between the plot box's edge and the tick labels, as the core `Axis` spaces them.
   *
   * @default tickLength beside the plot (`left` / `right`), tickLength + 2 above or below it
   */
  tickLabelOffset?: number;
  /** How the tick labels are drawn */
  tickLabelProps?: AxisLabelProps;
  /** How `label` is drawn */
  labelProps?: AxisLabelProps;
};
