import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { Insets } from 'layerchart/utils/rect.svelte';
import type { MarkEvents } from '../../contexts/scene.svelte.js';
import type { Rounded } from '../../utils/rounded.js';

/**
 * The core `Bar`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`z`, `class`, `size`).  One row's bar, as `Bars` draws each, without registering it with
 * the chart.
 */
export type BarProps = {
  /** Data to render the bar from */
  data: any;
  /** Override `x` from context. @default ctx.x */
  x?: Accessor;
  /** Override `y` from context. @default ctx.y */
  y?: Accessor;
  /** Override `x1` from context. @default ctx.x1 */
  x1?: Accessor;
  /** Override `y1` from context. @default ctx.y1 */
  y1?: Accessor;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** Padding between stacked bars. */
  stackPadding?: number;
  /**
   * Corner radius in pixels, rounding flat bars.
   *
   * @default 0
   */
  radius?: number;
  /**
   * Pixels to leave between a bar and the edges of its band: on every side, or per side (ex.
   * `{ x: 4 }`).  A 3D bar takes the same on every side (`all`).
   */
  insets?: number | Insets;
  /** Where a new bar starts across `x` as it eases in with `motion`, in pixels */
  initialX?: number;
  /** Where a new bar starts down `y` as it eases in with `motion`, in pixels */
  initialY?: number;
  /** How tall (down `y`) a new bar starts as it eases in with `motion`, in pixels */
  initialHeight?: number;
  /** How wide a new bar starts as it eases in with `motion`, in pixels */
  initialWidth?: number;
  /** Fixed width in pixels. */
  width?: number;
  /** Fixed height in pixels (down `y`, its depth in a 3D view). */
  height?: number;
  /**
   * Which corners to round.  Takes an accessor as well as a value — which corner is the stack's
   * edge depends on the row, not just on the series.
   *
   * @default 'all'
   */
  rounded?: Rounded | ((d: any) => Rounded);
  /**
   * Ease each bar to where it's asked to be: one config for all (ex. `'spring'`, `{ type:
   * 'tween', duration: 300 }`), or one per prop (ex. `{ y: { type: 'tween', delay: 300 } }`, of
   * `x`, `y`, `z`, `width`, `depth`, and `height`).  A new bar grows from the baseline.
   */
  motion?: MotionProp<'x' | 'y' | 'z' | 'width' | 'depth' | 'height'>;
  /**
   * Setup pointer events to show tooltip for related data.
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * The fill color: a CSS color, or a data key / function run through the chart's color scale.
   * Defaults to the series', else the chart's `c`, else `var(--color-surface-content)`.
   */
  fill?: ColorProp;
  /** The fill opacity (0 to 1). @default 1 */
  fillOpacity?: number;
  /**
   * The stroke color, as the core isometric bars draw theirs: around each bar's top and up its
   * corners.  A CSS color, or a data key / function run through the chart's color scale.  None
   * without one (here or in `class`) or a `strokeWidth`, which outlines in black.
   */
  stroke?: ColorProp;
  /** The stroke width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  /** The stroke opacity (0 to 1). @default 1 */
  strokeOpacity?: number;
  /** The opacity (0 to 1), or a bar's by its row (ex. fading other series). @default 1 */
  opacity?: number | ((d: any) => number);
  /** Click event handler, called with the bar's row (`{ data }`) */
  onclick?: MarkEvents['onclick'];
  /** Double click event handler, called with the bar's row (`{ data }`) */
  ondblclick?: MarkEvents['ondblclick'];
  /** Pointer enter event handler, called with the bar's row (`{ data }`) */
  onpointerenter?: MarkEvents['onpointerenter'];
  /** Pointer move event handler, called with the bar's row (`{ data }`) */
  onpointermove?: MarkEvents['onpointermove'];
  /** Pointer leave event handler, called with the bar's row (`{ data }`) */
  onpointerleave?: MarkEvents['onpointerleave'];
  /** Pointer over event handler, called with the bar's row (`{ data }`) */
  onpointerover?: MarkEvents['onpointerover'];
  /** Pointer out event handler, called with the bar's row (`{ data }`) */
  onpointerout?: MarkEvents['onpointerout'];

  /**
   * The bar's height: a data key or function (through the chart's `z` scale), or a number of
   * pixels.  Defaults to the chart's `z`, stacked when the chart stacks along `z`.  With neither,
   * the bars are LayerChart's 2D ones, flat on the floor.
   */
  z?: DataProp;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /**
   * A bar's width and depth in pixels along an axis without bands (and on a `globe`).
   *
   * @default 10
   */
  size?: number;
};

/** The pointer handlers a bar takes */
export type BarEvents = Pick<
  BarProps,
  | 'onclick'
  | 'ondblclick'
  | 'onpointerenter'
  | 'onpointermove'
  | 'onpointerleave'
  | 'onpointerover'
  | 'onpointerout'
>;
