import type { GridDataProps } from '../../utils/grid.js';

export type RasterProps = GridDataProps & {
  /**
   * Pixels between samples of a function, scattered rows, or a grid on a map.
   *
   * @default 1
   */
  pixelSize?: number;
  /**
   * Height off the floor, in pixels.
   *
   * @default 0
   */
  z?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * `'pixelated'` shows each cell as a hard-edged square; `'auto'` blends between them.
   *
   * @default 'auto'
   */
  imageRendering?: 'auto' | 'pixelated';
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
