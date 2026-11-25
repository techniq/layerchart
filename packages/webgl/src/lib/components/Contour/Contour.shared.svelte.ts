import type { GridDataProps } from '../../utils/grid.js';

export type ContourProps = GridDataProps & {
  /**
   * Pixels between samples of a function, scattered rows, or a grid on a map.
   *
   * @default 4
   */
  pixelSize?: number;
  /**
   * A count of evenly spaced thresholds, or the values.
   *
   * @default 10
   */
  thresholds?: number | number[];
  /**
   * Height off the floor: `'value'` raises each line to its threshold's height (through the
   * chart's `z` scale), and a number of pixels lays them all flat at that height.
   *
   * @default 0
   */
  z?: 'value' | number;
  /**
   * The lines' CSS color.
   *
   * @default 'var(--color-surface-content)'
   */
  stroke?: string;
  /** The lines' width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
};
