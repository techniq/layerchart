import type { Accessor } from 'layerchart';

/**
 * The core `Rule`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`z`, and its line's look)
 */
export type RuleProps = {
  /** Override the data from the context */
  data?: any[];
  /**
   * Create a vertical `x` line
   * - If true or '$left', will draw at chart left (xRange[0])
   * - If '$right', will draw at chart right (xRange[1])
   * - Use number | Date value for annotation (xScale(value))
   * - Use an accessor for a line per row
   *
   * @default false
   */
  x?: number | Date | boolean | '$left' | '$right' | Accessor;
  /** Pixel offset to apply to `x` coordinate. @default 0 */
  xOffset?: number;
  /**
   * Create a horizontal `y` line
   * - If true or '$bottom', will draw at chart bottom (yRange[0])
   * - If '$top', will draw at chart top (yRange[1])
   * - Use number | Date value for annotation (yScale(value))
   * - Use an accessor for a line per row
   *
   * @default false
   */
  y?: number | Date | boolean | '$top' | '$bottom' | Accessor;
  /** Pixel offset to apply to `y` coordinate. @default 0 */
  yOffset?: number;
  /**
   * Series key to follow, fading the rule while another series is highlighted and removing it
   * while the series is hidden. Only applicable if `<Chart>` uses `series`.
   */
  seriesKey?: string;

  /** Pixels up off the floor to draw at. @default 0 */
  z?: number;
  /**
   * The line's CSS color.  Rows' lines take the chart's color scale (`c`) without one.
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: string;
  /**
   * Width in pixels, the same at any depth.
   *
   * @default 1
   */
  strokeWidth?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `stroke-red-500`): the
   * stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
};
