import type { Snippet } from 'svelte';
import type { Accessor, BinCell, BinShape, ColorProp, DataProp } from 'layerchart';

/** How `Bin`'s `grid` is drawn: `true`, or its stroke, width, opacity, and classes */
export type BinGridProps =
  | boolean
  | {
      class?: string;
      style?: string;
      stroke?: string;
      strokeWidth?: number;
      strokeOpacity?: number;
      opacity?: number;
    };

/**
 * The core `Bin`'s props (in its order, as it describes them), then those of a `WebGL` layer's
 * own (`gap`, `tooltip`)
 */
export type BinProps<T = any> = {
  /** Rows to bin.  Falls back to the chart's data. */
  data?: T[];
  /** Horizontal position accessor, or longitude on a geo chart.  Defaults to the chart's `x`. */
  x?: Accessor<T>;
  /** Vertical position accessor, or latitude on a geo chart.  Defaults to the chart's `y`. */
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
   * Width of a cell in pixels — the distance between neighboring hexagon centers, a square's side,
   * or a triangle's base.
   *
   * @default 20
   */
  size?: number;
  /**
   * Outline every cell of the grid beneath the bins, clipped to the plot, to show how it is divided.
   * Pass props (class, style, stroke, strokeWidth, strokeOpacity, opacity) to style its lines.
   *
   * @default false
   */
  grid?: BinGridProps;
  /**
   * Fill color of each cell.
   * - `undefined`: the cell's `count`, through a color ramp
   * - `string`: a cell property such as `'count'` through a color ramp, else a literal CSS color
   * - `function(cell)`: any value derived from the cell, ex. `(cell) => mean(cell.data, (d) => d.price)`
   *
   * Numbers are colored by the chart's `cScale` when it is continuous (re-domained to the cells'
   * extent unless `cDomain` is given), else a `YlGnBu` ramp.  Categories use the chart's `cScale`.
   */
  fill?: ColorProp<BinCell<T>>;
  /**
   * Stroke color of each cell, resolved like `fill`: around each cell's top, and up its corners
   * when it stands any height.  None without one (here or in `class`).
   */
  stroke?: ColorProp<BinCell<T>>;
  /** The fill opacity (0 to 1). @default 1 */
  fillOpacity?: number;
  /** The stroke opacity (0 to 1). @default 1 */
  strokeOpacity?: number;
  /** The stroke width in pixels, the same at any depth. @default 1 */
  strokeWidth?: number;
  /** The opacity (0 to 1). @default 1 */
  opacity?: number;
  /**
   * Size each cell by a value rather than filling the grid, ex. `r="count"`.
   * - `string` / `function(cell)`: area proportional to the value, the largest filling its cell
   * - `number`: circumradius in pixels
   */
  r?: DataProp<BinCell<T>>;
  /**
   * Stand each cell up as a prism, ex. `z="count"`.  Flat on the floor without one.
   * - `string` / `function(cell)`: resolved through `zScale`
   * - `number`: pixel height for every cell
   */
  z?: DataProp<BinCell<T>>;
  /**
   * CSS classes to style it by, as the core marks take them (ex. `fill-red-500 opacity-50`):
   * the fill, stroke, stroke width, and opacity they set, where its props don't say
   */
  class?: string;
  /**
   * Render the cells yourself (ex. as `Points` or `Text` labels, at each cell's `x` / `y`)
   * instead of as prisms
   */
  children?: Snippet<[{ cells: BinCell<T>[] }]>;
  /** Called with the cell clicked */
  onclick?: (e: MouseEvent, cell: BinCell<T>) => void;
  /** Called with the cell the pointer enters */
  onpointerenter?: (e: PointerEvent, cell: BinCell<T>) => void;
  /** Called with the cell the pointer moves over */
  onpointermove?: (e: PointerEvent, cell: BinCell<T>) => void;
  /** Called with the cell the pointer leaves */
  onpointerleave?: (e: PointerEvent, cell: BinCell<T>) => void;

  /**
   * Pixels between neighboring cells, so each stands apart.
   *
   * @default 0
   */
  gap?: number;
  /**
   * Show the tooltip for the cell the pointer is over (with the chart's `tooltipContext`).
   *
   * @default false
   */
  tooltip?: boolean;
};
