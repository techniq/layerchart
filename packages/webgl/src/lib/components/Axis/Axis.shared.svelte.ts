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
};

export type AxisProps = {
  /**
   * Which axis: `bottom` labels `x` along the floor's front edge, `left` labels `y` along its
   * side, and `back` labels `z` up a corner.  Same as an `isometric` chart's.  The edges turn
   * to stay in front as the camera orbits.
   */
  placement: 'bottom' | 'left' | 'back';
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
   * Pixels between the plot box's edge and the tick labels.
   *
   * @default tickLength + 2
   */
  tickLabelOffset?: number;
  /** How the tick labels are drawn */
  tickLabelProps?: AxisLabelProps;
  /** How `label` is drawn */
  labelProps?: AxisLabelProps;
};
