import type { Accessor } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';

/** How a `Highlight`'s point is drawn, as the core `Circle` props */
export type HighlightPointProps = {
  /** Radius in pixels on screen. @default 4 */
  r?: number;
  /** Defaults to the row's color (the chart's `c`), else the primary color */
  fill?: string;
  /** @default 'white' */
  stroke?: string;
  /** Defaults to `2` with an `r`, else `6` */
  strokeWidth?: number;
  opacity?: number;
  class?: string;
};

/** How a `Highlight`'s lines are drawn, as the core `Line` props */
export type HighlightLineProps = {
  /** @default 'color-mix(in oklab, var(--color-surface-content) 20%, transparent)' */
  stroke?: string;
  /** Width in pixels, the same at any depth. @default 2 */
  strokeWidth?: number;
  opacity?: number;
  /** CSS classes to style them by (their stroke, width, and opacity) */
  class?: string;
};

/** How a `Highlight`'s shadows are drawn */
export type HighlightShadowProps = {
  /** Radius in pixels, as the view is fitted. @default 6 */
  r?: number;
  /** @default 'color-mix(in oklab, var(--color-surface-content) 20%, transparent)' */
  fill?: string;
  opacity?: number;
  /** CSS classes to style them by (their fill and opacity) */
  class?: string;
};

export type HighlightProps = {
  /**
   * The band (or slice) under the highlighted row, as the core `Highlight`'s `area`: `true`, or a
   * `Rect`'s props (ex. `{ class: 'fill-primary/10' }`)
   *
   * @default false
   */
  area?: boolean | Record<string, any>;
  /** The row to highlight.  Defaults to the tooltip's. */
  data?: any;
  /** Override `x` from context */
  x?: Accessor;
  /** Override `y` from context */
  y?: Accessor;
  /**
   * Override `z` from context: the point floats at the row's height.  `z={() => 0}` puts it on
   * the floor beneath instead.
   */
  z?: Accessor;
  /**
   * Use the chart's radius scale for the point's size: `true` for the chart's `r`, or an accessor
   * for the value to scale
   */
  r?: boolean | Accessor;
  /**
   * Which of the row's positions the lines trace: across the floor at its `x`, `y`, or both, and
   * up the back wall along that axis
   */
  axis?: 'x' | 'y' | 'both' | 'none';
  /**
   * Mark the row with a point facing the viewer, and how it's drawn.
   * @default false
   */
  points?: boolean | HighlightPointProps;
  /**
   * Trace the row's position on the floor and, with a `z`, each back wall: across it at the row's
   * height, and up it at the row's `x` or `y` (with `axis`).
   * @default false
   */
  lines?: boolean | HighlightLineProps;
  /**
   * With a `z`, a spot beneath the row on the floor and level with it on each back wall.
   * @default false
   */
  shadows?: boolean | HighlightShadowProps;
  /** The opacity of all of it (0 to 1) */
  opacity?: number;
  /**
   * `'spring'` to glide from one highlighted row to the next (as the core `Highlight`), or
   * `'none'`.  It follows each step of a pan or zoom at once, rather than chasing it.
   * @default 'spring'
   */
  motion?: MotionProp;
};
