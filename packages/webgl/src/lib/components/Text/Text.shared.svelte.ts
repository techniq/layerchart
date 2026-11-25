import type { ColorProp, DataProp, TruncateTextOptions } from 'layerchart';
import type { FormatConfig, FormatType } from '@layerstack/utils';
import type { ValueProp } from '../../utils/values.js';

export type TextProps = {
  /** Rows to draw a label each for.  Falls back to the chart's data when `x` / `y` read rows. */
  data?: any[];
  /** The text: a data property name (with rows), a function of the row, or the text itself */
  value: string | number | ((d: any) => string | number | null | undefined);
  /**
   * Across the plot: a data property name or function of the row through the chart's `x` scale
   * (longitude on a map), or pixels.  Defaults to the chart's `x` with rows.
   */
  x?: DataProp;
  /**
   * Down the plot: a data property name or function of the row through the chart's `y` scale
   * (latitude on a map), or pixels.  Defaults to the chart's `y` with rows.
   */
  y?: DataProp;
  /**
   * Height off the floor: a data property name or function of the row through the chart's `z`
   * scale, or pixels.  Defaults to the chart's `z` with rows, else `0`.
   */
  z?: DataProp;
  /**
   * Keep each label facing the viewer, drawn over the scene upright and crisp however the view
   * turns (styled with `class`).  Otherwise it lies on the surface at its height (ex. the tops
   * of boxes), turning and tipping with the view, and hidden behind whatever's nearer.
   *
   * @default false
   */
  viewport?: boolean;
  /**
   * Which end of a label is at its point: its `start`, `middle`, or `end` as it reads.  Lying on
   * the surface, it stays on that side of the point as the view turns.
   *
   * @default 'middle'
   */
  textAnchor?: 'start' | 'middle' | 'end';
  /**
   * Which edge of a label is at its point: its top (`start`), `middle`, or bottom (`end`) as it
   * reads.
   *
   * @default 'middle'
   */
  verticalAnchor?: 'start' | 'middle' | 'end';
  /** Pixels to move each label across: on screen with `viewport`, else across the plot */
  dx?: number;
  /** Pixels to move each label down: on screen with `viewport`, else down the plot */
  dy?: number;
  /** How to format a number or date `value` (as the core `format`) */
  format?: FormatType | FormatConfig;
  /** Wrap words onto more lines to keep each label within this many pixels */
  width?: number;
  /** Line spacing of wrapped labels, in multiples of the font size (or `'1.2em'`) */
  lineHeight?: number | string;
  /** Shorten each label with an ellipsis to fit `width` (or as the options say) */
  truncate?: boolean | TruncateTextOptions;
  /** Shrink a label lying on the surface to fit `width`, rather than wrapping it */
  scaleToFit?: boolean;
  /**
   * Font size in pixels of the plot, for labels lying on the surface, or per row (a data key or
   * function).
   *
   * @default 12
   */
  fontSize?: ValueProp<number>;
  /**
   * Font weight, for labels lying on the surface.
   *
   * @default 600
   */
  fontWeight?: number | string;
  /**
   * Which way labels lying on the surface run, in degrees clockwise from left to right across the plot,
   * or per row (a data key or function).
   * Turned half round whenever they'd read backwards from where the view is.
   *
   * @default 0
   */
  rotate?: ValueProp<number>;
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
  /** Class added to each `viewport` label */
  class?: string;
};
