import type { Snippet } from 'svelte';
import type { autoTickFormat, DataProp, TicksConfig } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { MarkerOptions } from '../Line/markers.js';

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
  /** Class added to each `viewport` label, and the fill (and opacity) it sets, for the others */
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
  /**
   * Pixels across from where it's placed, for labels on the plot box (in place of the core
   * `Axis`' default offset from its tick, as there)
   */
  dx?: number;
  /**
   * Pixels down from where it's placed, for labels on the plot box (in place of the core `Axis`'
   * default offset from its tick, as there)
   */
  dy?: number;
};

/** How an axis' rule or grid lines are drawn */
export type AxisLineProps = {
  /** CSS classes to style them by (their stroke, width, and opacity) */
  class?: string;
  stroke?: string;
  /** Width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  opacity?: number;
  /** Dashed-line pattern (grid lines): a dash length, `[dash, gap]`, or an SVG `stroke-dasharray` */
  dashArray?: number | number[] | string;
};

/** How an axis' rule is drawn: as its other lines, with markers at its ends, as a `Rule`'s */
export type AxisRuleProps = AxisLineProps & {
  /** A marker at its start and end: a type (ex. `'arrow'`) or the core `Marker`'s props */
  marker?: MarkerOptions;
  /** A marker at its start (where the core `Rule` starts it: its left, or a side's bottom) */
  markerStart?: MarkerOptions;
  markerMid?: MarkerOptions;
  /** A marker at its end (its right, or a side's top) */
  markerEnd?: MarkerOptions;
};

/** What a `label` or `tickLabel` snippet is given to spread on a `Text` */
export type AxisTextProps = {
  x: number;
  y: number;
  z: number;
  value: string;
  textAnchor: 'start' | 'middle' | 'end';
  verticalAnchor: 'start' | 'middle' | 'end';
  dx: number;
  dy: number;
  rotate: number;
  fontSize: number;
  fontWeight: number | string;
  /** Pixels from a line's top to its baseline, as the core `Axis`' labels */
  capHeight: number;
  /** Between lines, in multiples of `fontSize` */
  lineHeight: number;
  fill: string;
  class?: string;
  viewport?: boolean;
};

/**
 * The core `Axis`' props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`tickLabelOffset`)
 */
export type AxisProps = {
  /**
   * Which axis: `bottom` labels `x` along the floor's front edge (`top` along its back), `left`
   * labels `y` along its side (`right` along the other), and `back` labels `z` up a corner.  Same
   * as an `isometric` chart's.  The edges turn to stay in front as the camera orbits.  In a
   * `radial` chart, `angle` labels `x` around its rim and `radius` labels `y` out from its center.
   */
  placement: 'bottom' | 'top' | 'left' | 'right' | 'back' | 'angle' | 'radius';
  /**
   * The label for the axis, drawn beyond the tick labels.
   *
   * Can either be a string or a snippet to render custom content.  The snippet receives
   * spreadable props to apply to a `Text`.
   */
  label?: string | Snippet<[{ props: AxisTextProps }]>;
  /**
   * Location of axis label along the axis
   * @default 'middle'
   */
  labelPlacement?: 'start' | 'middle' | 'end';
  /** Props applied to label Text */
  labelProps?: AxisLabelProps;
  /**
   * Draw a rule line along the axis' edge of the plot box, and how
   * @default false
   */
  rule?: boolean | AxisRuleProps;
  /**
   * Draw grid lines across the plot at its ticks, as the core `Axis` draws them. Pass props
   * (class, stroke, strokeWidth, opacity, dashArray) to forward onto the grid lines.
   * @default false
   */
  grid?: boolean | AxisLineProps;
  /** Control the number of ticks: a count, values, or an interval */
  ticks?: TicksConfig;
  /**
   * Width or height of each tick in pixels (enabling responsive count).  `null` leaves the count
   * to the scale.
   *
   * @default 50 in a 3D view (80 across a flat one)
   */
  tickSpacing?: number | null;
  /**
   * Drop ticks whose labels would overlap one already kept, measuring each label at the size
   * it actually renders.  Across a flat chart; a 3D view keeps every tick (its labels turn with
   * the view, so what overlaps changes as it does).
   *
   * `tickSpacing` only picks a tick *count* — it cannot know how wide a formatted label turns
   * out to be, so a long format (`'Wednesday'`, `'$1,234,567'`) still collides at any count
   * that fits the axis.  This measures instead.
   *
   * - `priority`: which ticks win when labels compete. `'end'` (default) keeps the last tick and
   *   walks backwards (the newest value on a time axis); `'start'` keeps the first; `'start-end'`
   *   anchors both ends of the axis and thins what is between them.
   * - `padding`: minimum gap, in pixels, required between two kept labels.
   *
   * @default false
   */
  tickOcclusion?: boolean | { padding?: number; priority?: 'start' | 'end' | 'start-end' };
  /**
   * Whether to render tick labels on multiple lines for additional context
   *
   * @default false
   */
  tickMultiline?: boolean;
  /**
   * Length of the tick line
   * @default 4
   */
  tickLength?: number;
  /**
   * Whether to render tick marks.
   *
   * @default true
   */
  tickMarks?: boolean;
  /** Format tick labels */
  format?: Parameters<typeof autoTickFormat>[0]['formatType'];
  /** Props to apply to each tick label */
  tickLabelProps?: AxisLabelProps;
  /** A snippet to render your own custom tick label, given props to spread on a `Text` */
  tickLabel?: Snippet<[{ props: AxisTextProps; index: number }]>;
  /** Override scale for the axis */
  scale?: any;
  /**
   * Domain for the axis, on a copy of `scale` (or the chart's scale for this placement) that keeps
   * its range and type.  Useful for a secondary axis, e.g. `domain={[0, 100]}` on the right.
   */
  domain?: any[];
  /** Stroke color for axis rule, grid lines, and tick marks. */
  stroke?: string;
  /** Fill color for tick labels and axis label. */
  fill?: string;
  /**
   * Classes for styling various parts of the axis (the stroke, width, and opacity they set on
   * its lines, and the fill on its labels)
   * @default {}
   */
  classes?: {
    root?: string;
    label?: string;
    rule?: string;
    tick?: string;
    tickLabel?: string;
  };
  /** Ease each tick (its mark, label, and grid line) to where it moves, ex. `'tween'` */
  motion?: MotionProp;
  /**
   * Translate x position of the axis, in pixels (or per row, through the `x` scale, as `Group`)
   */
  x?: DataProp;
  /** Initial translate x (pixel mode only). @default x */
  initialX?: number;
  /**
   * Translate y position of the axis, in pixels (or per row, through the `y` scale, as `Group`)
   */
  y?: DataProp;
  /** Initial translate y (pixel mode only). @default y */
  initialY?: number;
  /** Data array to iterate over in data mode (an axis per row, as `Group`) */
  data?: any[];
  /** Key function for each row's axis in data mode. @default (d, i) => i */
  key?: (d: any, index: number) => any;
  /**
   * Series key to follow, fading the axis while another series is highlighted and removing it
   * while the series is hidden. Only applicable if `<Chart>` uses `series`.
   */
  seriesKey?: string;
  /** Center within chart. @default false */
  center?: boolean | 'x' | 'y';
  /** The opacity of the element. (0 to 1) */
  opacity?: number;

  /**
   * Pixels between the plot box's edge and the tick labels, as the core `Axis` spaces them.
   *
   * @default tickLength beside the plot (`left` / `right`), tickLength + 2 above or below it
   */
  tickLabelOffset?: number;
};
