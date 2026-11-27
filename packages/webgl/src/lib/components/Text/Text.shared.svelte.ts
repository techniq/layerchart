import type { ColorProp, DataProp, TruncateTextOptions } from 'layerchart';
import type { MotionProp } from 'layerchart/utils/motion.svelte';
import type { FormatConfig, FormatType } from '@layerstack/utils';
import type { ValueProp } from '../../utils/values.js';

/** A run of text in its own style, as the core `Text`'s `segments` take them */
export type TextSegment = {
  value: string | number;
  /** Classes styling this run (ex. `font-bold fill-primary`), over the label's own */
  class?: string;
};

/**
 * The core `Text`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`fontWeight`), and its letters' look
 */
export type TextProps = {
  /**
   * Text value to render.
   * - `number`: direct value
   * - `string`: in data mode, treated as a data property name (e.g. `"label"` → `d.label`);
   *   in pixel mode, used as literal text
   * - `function(d)`: accessor called per data item to get the text value
   */
  value?: string | number | ((d: any) => string | number | null | undefined);
  /**
   * Array of styled text segments for inline mixed styling.
   * Each segment has its own value and optional class (its color, font size, and weight).
   * Mutually exclusive with `value`.
   */
  segments?: TextSegment[];
  /** Wrap words onto more lines to keep each label within this many pixels */
  width?: number;
  /**
   * Across the plot: a data property name or function of the row through the chart's `x` scale
   * (longitude on a map), or pixels.  Defaults to the chart's `x` with rows.
   */
  x?: DataProp;
  /**
   * Initial x position of the text (pixel mode only), in pixels, to ease from with `motion`.
   *
   * @default x
   */
  initialX?: number;
  /**
   * Down the plot: a data property name or function of the row through the chart's `y` scale
   * (latitude on a map), or pixels.  Defaults to the chart's `y` with rows.
   */
  y?: DataProp;
  /**
   * Initial y position of the text (pixel mode only), in pixels, to ease from with `motion`.
   *
   * @default y
   */
  initialY?: number;
  /** Pixels to move each label across: on screen with `viewport`, else across the plot */
  dx?: number;
  /** Pixels to move each label down: on screen with `viewport`, else down the plot */
  dy?: number;
  /** Line spacing of wrapped labels, in multiples of the font size (or `'1.2em'`) */
  lineHeight?: number | string;
  /**
   * Font size in pixels of the plot, for labels lying on the surface, or per row (a data key or
   * function).  When set, `capHeight` defaults to `fontSize * 0.71`.
   *
   * @default the chart's (or its `class`'s) font size, as a core label
   */
  fontSize?: ValueProp<number>;
  /**
   * Cap height of the text — used by vertical anchor math to align the text to its visual
   * center (as opposed to the font box), for labels lying on the surface: pixels, or `'px'` /
   * `'em'` (of 16px) as the core `Text` reads it.
   *
   * @default '0.71em' (or `fontSize * 0.71` when `fontSize` is set)
   */
  capHeight?: string | number;
  /** Shrink a label lying on the surface to fit `width`, rather than wrapping it */
  scaleToFit?: boolean;
  /**
   * Which end of a label is at its point: its `start`, `middle`, or `end` as it reads.  Lying on
   * the surface, it stays on that side of the point as the view turns.
   *
   * @default 'start'
   */
  textAnchor?: 'start' | 'middle' | 'end';
  /**
   * Which part of a label is at its point, as the core `Text`: its cap height's top (`start`),
   * its middle (`middle`), or its baseline (`end`).
   *
   * @default 'end'
   */
  verticalAnchor?: 'start' | 'middle' | 'end';
  /** Where its baseline sits on `path` (`'hanging'`, `'middle'`, else on it) */
  dominantBaseline?: string;
  /**
   * Which way labels lying on the surface run, in degrees clockwise from left to right across the plot,
   * or per row (a data key or function).
   * Turned half round whenever they'd read backwards from where the view is.
   *
   * @default 0
   */
  rotate?: ValueProp<number>;
  /**
   * Keep each label facing the viewer, drawn over the scene upright and crisp however the view
   * turns (styled with `class`).  Otherwise it lies on the surface at its height (ex. the tops
   * of boxes), turning and tipping with the view, and hidden behind whatever's nearer.
   *
   * @default false
   */
  viewport?: boolean;
  /**
   * Height off the floor: a data property name or function of the row through the chart's `z`
   * scale, or pixels.  Defaults to the chart's `z` with rows, else `0`.
   */
  z?: DataProp;
  /**
   * How to format a number or date `value` (as the core `format`).  When set with `motion` and a
   * numeric `value`, the number will tween smoothly and be formatted for display.
   */
  format?: FormatType | FormatConfig;
  /**
   * Ease each label to where it's asked to be, as the core `Text` (ex. `'spring'`, or
   * `{ type: 'tween', duration: 300 }`), each by its `key`, or each of `x` and `y` by its own
   * (ex. `{ y: 'spring' }`).  A numeric `value` tweens too (pixel mode, with a `{ type }`).
   */
  motion?: MotionProp<'x' | 'y'>;
  /** Shorten each label with an ellipsis to fit `width` (or as the options say) */
  truncate?: boolean | TruncateTextOptions;
  /**
   * SVG path data to place it along, as the core `Text` sets it on a path (ex. from `Arc`'s
   * `getArcTextProps('outer')`): at `startOffset`, turned the way the path runs there (straight,
   * rather than bent along it)
   */
  path?: string;
  /** How far along `path`: pixels, or a percentage of its length (ex. `'50%'`). @default 0 */
  startOffset?: string | number;
  /** Rows to draw a label each for.  Falls back to the chart's data when `x` / `y` read rows. */
  data?: any[];
  /**
   * Which label each row is as rows change, for `motion`.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => unknown;

  /**
   * Font weight, for labels lying on the surface.
   *
   * @default the chart's (or its `class`'s) font weight, as a core label
   */
  fontWeight?: number | string;
  /**
   * The labels' color: a CSS color, or a data key / function run through the chart's color
   * scale.  `viewport` labels without one take their color from `class`.
   *
   * @default 'var(--color-surface-content)'
   */
  fill?: ColorProp;
  /**
   * A halo around the letters, behind them, as the core `Text` draws its stroke (ex. to read
   * over a busy surface): a CSS color, or a data key / function run through the chart's color
   * scale.  None without one.
   */
  stroke?: ColorProp;
  /** The halo's width in pixels, half of it outside the letters. @default 1 */
  strokeWidth?: number;
  /**
   * The fill opacity (0 to 1).
   * - `number`: static value
   * - `function(d)`: accessor called per data item
   */
  fillOpacity?: number | ((d: any) => number | undefined);
  /**
   * The stroke opacity (0 to 1): its halo's.
   * - `number`: static value
   * - `function(d)`: accessor called per data item
   */
  strokeOpacity?: number | ((d: any) => number | undefined);
  /**
   * The opacity (0 to 1): of the whole label, its halo and letters together.
   * - `number`: static value
   * - `function(d)`: accessor called per data item
   */
  opacity?: number | ((d: any) => number | undefined);
  /** Class added to each `viewport` label */
  class?: string;
};
