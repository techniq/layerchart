import type { DataProp } from 'layerchart';
import type { GridDataProps } from '../../utils/grid.js';

/**
 * The core `Contour`'s props (in its order, as it describes them), then those of a `WebGL`
 * layer's own (`pixelSize`, `class`).  Flat (on a flat chart, at `z={0}`) it's LayerChart's own
 * `Contour`, drawn with WebGL marks; raised, or in a 3D view, lines of its own at each threshold.
 */
export type ContourProps = {
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
   * A count of evenly spaced thresholds, or the values.
   *
   * @default 10
   */
  thresholds?: number | number[];
  /**
   * Blur the grid's values over this many cells before tracing the contours, smoothing out
   * noise.
   *
   * @default 0
   */
  blur?: number;
  /**
   * Interpolate where each contour crosses between cells, rather than following the cells' edges.
   *
   * @default true
   */
  smooth?: boolean;
  /**
   * Height off the floor: a band property (ex. `'value'`, each line at its threshold's height) or
   * function of the band, through the chart's `z` scale, or a number of pixels laying them all
   * flat at that height.  At `0` on a flat chart, it's LayerChart's own `Contour`: bands filled
   * through the color scale, outlined only with a `stroke`.  Raised, they're lines.
   *
   * @default 0
   */
  z?: DataProp;
  /**
   * The bands' fill color, flat.  Defaults to each band's color through the chart's color scale.
   * `'none'` (without a `stroke`) draws only their outlines, in those colors.
   */
  fill?: string;
  /** The fill opacity of the bands, flat. (0 to 1) */
  fillOpacity?: number;
  /**
   * The lines' color.  Flat, none without one; raised, `var(--color-surface-content)`.
   */
  stroke?: string;
  /** The stroke opacity of the raised lines. (0 to 1) */
  strokeOpacity?: number;
  /** The lines' width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  /** The opacity of the element. (0 to 1) */
  opacity?: number;

  /**
   * Pixels between samples of a function, scattered rows, or a grid on a map.  Raised lines
   * only: flat, the core `Contour` samples its own grid.
   *
   * @default 4
   */
  pixelSize?: number;
  /** CSS classes for the flat bands, as the core `Contour` takes them */
  class?: string;
};
