import type { Rounded } from '../../utils/rounded.js';
import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { Snippet } from 'svelte';
import type { Accessor, ColorProp, DataProp } from 'layerchart';
import type { Insets } from 'layerchart/utils/rect.svelte';

export type BarsProps = {
  /** Override the chart's `data` */
  data?: any[];
  /** Override the chart's `x` accessor */
  x?: Accessor;
  /** Override the chart's `y` accessor */
  y?: Accessor;
  /**
   * The bar's height: a data key or function (through the chart's `z` scale), or a number of
   * pixels.  Defaults to the chart's `z`, stacked when the chart stacks along `z`.  With neither,
   * the bars are LayerChart's 2D ones, flat on the floor.
   */
  z?: DataProp;
  /**
   * A CSS color, or a data key / function run through the chart's color scale.  Defaults to the
   * chart's `c`, else `var(--color-surface-content)` (as the core bars).
   */
  fill?: ColorProp;
  /**
   * The outline, as the core isometric bars draw theirs: around each bar's top and up its
   * corners.  A CSS color, or a key / function of the row run through the color scale.  None
   * without one (here or in `class`) or a `strokeWidth`, which outlines in black.
   */
  stroke?: ColorProp;
  /** Outline width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /**
   * Pixels to leave between a bar and the edges of its band: on every side, or per side as the
   * core `Bars` take them (ex. `{ x: 4 }`).  A 3D bar takes the same on every side (`all`).
   *
   * @default 0
   */
  insets?: number | Insets;
  /**
   * A bar's width and depth in pixels along an axis without bands (and on a `globe`).
   *
   * @default 10
   */
  size?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
  /**
   * Ease each bar to where it's asked to be, as the core `Bars`: one config for all (ex.
   * `'spring'`, `{ type: 'tween', duration: 300 }`), or one per prop (ex. `{ y: { type: 'tween',
   * delay: 300 } }`, of `x`, `y`, `z`, `width`, `depth`, and `height`).  A new bar grows from the
   * baseline.
   */
  motion?: MotionProp<'x' | 'y' | 'z' | 'width' | 'depth' | 'height'>;
  /**
   * Corner radius in pixels, for flat bars (as the core `Bars`).
   *
   * @default 0
   */
  radius?: number;
  /**
   * Which corners `radius` rounds, as the core `Bars`: `'all'`, `'edge'` (the value's end), a
   * side (`'top'`), or a corner (`'top-left'`), or per row (a function).
   *
   * @default 'all'
   */
  rounded?: Rounded | ((d: any) => Rounded);
  /** Which bar each row is as rows change, for `motion`. @default (d, i) => i */
  key?: (d: any, index: number) => unknown;
  /** Drawn in place of its bars (ex. a `Bar` per row, styled each its own way), as the core `Bars` */
  children?: Snippet;
};
