import type { ColorProp, DataProp } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';

/**
 * The core `Circle`'s props (in its order, as it describes them), then its style props, then
 * those of a `WebGL` layer's own (`tooltip`, `style`)
 */
export type CircleProps = {
  /**
   * The center x position of the circle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @default 0
   */
  cx?: DataProp;
  /**
   * The initial center x position of the circle (pixel mode only), to ease from with `motion`.
   *
   * @default cx
   */
  initialCx?: number;
  /**
   * The center y position of the circle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @default 0
   */
  cy?: DataProp;
  /**
   * The initial center y position of the circle (pixel mode only), to ease from with `motion`.
   *
   * @default cy
   */
  initialCy?: number;
  /**
   * The radius of the circle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via rScale
   * - `function(d)`: accessor called per data item, result passed through rScale
   *
   * @default 1
   */
  r?: DataProp;
  /**
   * Its height off the floor: a number of pixels, or a data key / function through the chart's
   * `z` scale.  Without one, the chart's `z` in data mode, else flat on the floor.
   */
  z?: DataProp;
  /**
   * Keep the circle facing the viewer (round), as the core `Circle` on an `isometric` chart.
   * Always so here: a flat chart's circles are discs seen from above, and a 3D view's are
   * spheres, round from any side.
   *
   * @default false
   */
  viewport?: boolean;
  /**
   * The initial radius of the circle (pixel mode only), to ease from with `motion` (ex. `0` to
   * grow in).
   *
   * @default r
   */
  initialR?: number;
  /**
   * Data array to iterate over in data mode.
   * Falls back to chart context data when not provided.
   */
  data?: any[];
  /**
   * Which circle each row is as rows change, for `motion`.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => unknown;
  /**
   * Ease each circle to where it's asked to be, as the core `Circle` (ex. `'spring'`, or
   * `{ type: 'tween', duration: 300 }`), or each of `cx`, `cy`, and `r` by its own (ex.
   * `{ r: 'spring' }`)
   */
  motion?: MotionProp<'cx' | 'cy' | 'r'>;
  /**
   * Dashed-border pattern. Accepts a number (single dash length), a
   * `[dash, gap, ...]` array, or a string (same syntax as SVG
   * `stroke-dasharray`), in pixels: its ring's (drawn flat), its first dash and gap repeating.
   */
  dashArray?: number | number[] | string;

  /**
   * A CSS color, or a data key / function run through the chart's color scale (`none` or `null`
   * for only its ring).
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp | null;
  /** The fill opacity (0 to 1), as the core `Circle`'s. @default 1 */
  fillOpacity?: number;
  /** A ring around it, in a CSS color or a data key / function run through the color scale */
  stroke?: ColorProp;
  /** The ring's width, in pixels. @default 1 */
  strokeWidth?: number;
  /** The ring's opacity (0 to 1), as the core `Circle`'s `strokeOpacity`. @default 1 */
  strokeOpacity?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;

  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Inline CSS, as on the core marks' elements (ex. `--fill-color: var(--color-primary)`): the
   * colors it sets, as LayerChart's styles read them
   */
  style?: string;
};
