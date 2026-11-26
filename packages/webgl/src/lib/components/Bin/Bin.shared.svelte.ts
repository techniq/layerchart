import type { Accessor, BinCell, BinShape, ColorProp, DataProp } from 'layerchart';

export type BinProps<T = any> = {
  /** Rows to bin.  Falls back to the chart's data. */
  data?: T[];
  /** Horizontal position accessor, or longitude on a map.  Defaults to the chart's `x`. */
  x?: Accessor<T>;
  /** Vertical position accessor, or latitude on a map.  Defaults to the chart's `y`. */
  y?: Accessor<T>;
  /**
   * How much each row counts toward its cell's `count`, ex. the people in a cell of gridded
   * population data.  Without it, each row counts once.
   */
  weight?: Accessor<T>;
  /**
   * Shape of the cells tiling the plot (as projected, on a map).
   *
   * @default 'hexagon'
   */
  shape?: BinShape;
  /**
   * Width of a cell in pixels: the distance between neighboring hexagon centers, a square's
   * side, or a triangle's base.
   *
   * @default 20
   */
  size?: number;
  /**
   * Pixels between neighboring cells, so each stands apart.
   *
   * @default 0
   */
  gap?: number;
  /**
   * How tall each cell stands: a cell property or function of the cell (through the chart's `z`
   * scale, ex. `'count'`), or a number of pixels.  Flat on the floor without one.
   */
  z?: DataProp<BinCell<T>>;
  /**
   * Size each cell by a value rather than filling the grid, as the core `Bin` (ex. `r="count"`):
   * a cell property or function, its area in proportion (the largest filling its cell), or a
   * number, a circumradius in pixels
   */
  r?: DataProp<BinCell<T>>;
  /**
   * Each cell's color: a cell property (ex. `'count'`) or a function of the cell, numbers
   * colored as the core `Bin` colors them (the chart's continuous `cScale`, else
   * yellow-green-blue), or a CSS color.
   *
   * @default 'count'
   */
  fill?: ColorProp<BinCell<T>>;
  /**
   * The cells' outline, as the core `Bin` draws it: around each cell's top, and up its
   * corners when it stands any height.  A CSS color, or a cell property / function run through
   * the chart's color scale.  None without one.
   */
  stroke?: ColorProp<BinCell<T>>;
  /** Outline width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  /** @default 1 */
  opacity?: number;
  /**
   * Show the tooltip for the cell the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
