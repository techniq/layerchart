import type { GridDataProps } from '../../utils/grid.js';

/**
 * The core `Raster`'s props (in its order, as it describes them), then those of a `WebGL`
 * layer's own (`z`, `tooltip`)
 */
export type RasterProps = {
  /**
   * Row-major grid values (with `width` and `height`), or rows of scattered samples (with `x`,
   * `y`, and `value`) to interpolate onto a grid.
   */
  data?: GridDataProps['data'];
  /** Columns in a `data` grid */
  width?: number;
  /** Rows in a `data` grid */
  height?: number;
  /** Where a `data` grid's first column starts, in data coordinates (longitude on a map) */
  x1?: number;
  /** Where a `data` grid's first row starts, in data coordinates (latitude on a map) */
  y1?: number;
  /** Where a `data` grid's last column ends, in data coordinates */
  x2?: number;
  /** Where a `data` grid's last row ends, in data coordinates */
  y2?: number;
  /**
   * A scattered row's value (a key or accessor), or a function `(x, y) => value` sampled across
   * the plot in data coordinates (longitude and latitude on a map).
   *
   * @default 'value'
   */
  value?: GridDataProps['value'];
  /** A scattered row's `x`.  Defaults to the chart's. */
  x?: GridDataProps['x'];
  /** A scattered row's `y`.  Defaults to the chart's. */
  y?: GridDataProps['y'];
  /** @default 'barycentric' */
  interpolate?: GridDataProps['interpolate'];
  /**
   * Pixels between samples of a function, scattered rows, or a grid on a map.
   *
   * @default 1
   */
  pixelSize?: number;
  /**
   * Blur the image over this many cells, smoothing between them.
   *
   * @default 0
   */
  blur?: number;
  /**
   * `'pixelated'` shows each cell as a hard-edged square; `'auto'` blends between them.
   * `'crisp-edges'` is `'pixelated'`.
   *
   * @default 'auto'
   */
  imageRendering?: 'auto' | 'pixelated' | 'crisp-edges';
  /** The opacity of the element. (0 to 1) @default 1 */
  opacity?: number;

  /**
   * Height off the floor, in pixels.
   *
   * @default 0
   */
  z?: number;
  /**
   * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
