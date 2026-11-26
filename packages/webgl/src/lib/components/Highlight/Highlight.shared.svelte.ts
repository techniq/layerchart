import type { Snippet } from 'svelte';
import type { Accessor, HighlightPoint } from 'layerchart';
import type { BarProps } from '../Bar/Bar.shared.svelte.js';
import type { MotionProp } from 'layerchart/utils/motion.svelte';

/** The band (or slice) under the highlighted row, in pixels, as an `area` snippet is given it */
export type HighlightArea = { x: number; y: number; width: number; height: number };

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

/**
 * The core `Highlight`'s props (in its order, as it describes them).  Its points are drawn over
 * the scene facing the viewer, and its lines and shadows in it.
 */
export type HighlightProps = {
  /** Highlight specific data (annotate).  Defaults to the tooltip's row. */
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
  /**
   * Show area and pass props to Rect: the band (or slice) under the highlighted row (ex.
   * `{ class: 'fill-primary/10' }`), or a snippet drawing it from the `area`
   *
   * @default false
   */
  area?: boolean | Record<string, any> | Snippet<[{ area: HighlightArea }]>;
  /**
   * Show bar and pass props to Bar: the highlighted row's bar, over its own (ex. `{ class:
   * 'fill-primary' }`), or a snippet drawing it
   *
   * @default false
   */
  bar?: boolean | Partial<BarProps> | Snippet;
  /**
   * `'spring'` to glide from one highlighted row to the next (as the core `Highlight`), or
   * `'none'`.  It follows each step of a pan or zoom at once, rather than chasing it.
   * @default 'spring'
   */
  motion?: MotionProp;
  /** The opacity of the element. (0 to 1) */
  opacity?: number;
  /** Called with the highlighted row as its `area` is clicked */
  onAreaClick?: (e: MouseEvent, detail: { data: any }) => void;
  /** Called with the highlighted row as its `bar` is clicked */
  onBarClick?: (e: MouseEvent, detail: { data: any }) => void;
  /** Called with its point (in the chart's pixels) and the highlighted row as the point is clicked */
  onPointClick?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
  /** Called with its point and the highlighted row as the pointer moves onto the point */
  onPointEnter?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
  /** Called with its point and the highlighted row as the pointer moves off the point */
  onPointLeave?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
};
