import type { MotionProp } from 'layerchart/utils/motion.svelte';

export type PathProps = {
  /**
   * SVG path data in the chart's pixels (ex. a d3 shape's, as the core `Path` takes it), or a
   * function returning it.  Lines, curves, and arcs, absolute or relative, in any number of
   * subpaths.
   */
  pathData?: string | null | (() => string | null | undefined);
  /** A CSS color.  Drawn only with one (here or in `class`), as subpaths filled between them */
  fill?: string | null;
  /** @default 1 */
  fillOpacity?: number;
  /** A CSS color.  The outline, drawn without a `fill` in `surface-content` unless `none` */
  stroke?: string | null;
  /** Outline width in pixels. @default 1 */
  strokeWidth?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-primary/20
   * stroke-primary`): the fill, stroke, stroke width, and opacity they set, where its props don't
   */
  class?: string;
  /** @default 1 */
  opacity?: number;
  /** How far above the floor it lies, in pixels (the top of a `[start, end]` pair). @default 0 */
  z?: number | [start: number, end: number];
  /**
   * Tween to new path data, as the core `Path` (ex. `'tween'`, or `{ type: 'tween', duration:
   * 300 }`)
   */
  motion?: MotionProp;
};
