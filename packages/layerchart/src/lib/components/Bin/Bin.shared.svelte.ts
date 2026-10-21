import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';
import type { ColorProp, DataProp, StyleProp } from '$lib/utils/dataProp.js';

export type BinShape = 'hexagon' | 'square' | 'triangle';

/** One cell of the grid, with the rows that fell in it */
export type BinCell<T = any> = {
  /** Pixel x of the cell's center */
  x: number;
  /** Pixel y of the cell's center */
  y: number;
  /** Rows that fell in the cell */
  data: T[];
  /** Number of rows in the cell (`data.length`) */
  count: number;
  /** The cell's vertices in pixels, before any `r` scaling */
  polygon: [number, number][];
};

export type BinPropsWithoutHTML<T = any> = {
  /** Rows to bin.  Falls back to the chart's (or facet panel's) data. */
  data?: T[];
  /** Horizontal position accessor, or longitude on a geo chart.  Defaults to the chart's `x`. */
  x?: Accessor<T>;
  /** Vertical position accessor, or latitude on a geo chart.  Defaults to the chart's `y`. */
  y?: Accessor<T>;
  /**
   * Shape of the cells tiling the plot.
   * @default 'hexagon'
   */
  shape?: BinShape;
  /**
   * Width of a cell in pixels — the distance between neighboring hexagon centers, a square's side,
   * or a triangle's base.  On an `isometric` chart, measured against the floor laid flat in the plot.
   * @default 20
   */
  size?: number;
  /**
   * Also draw the cells no row fell in, tiling the whole plot.  With no `data`, a grid to show how
   * the plot is divided.
   * @default false
   */
  empty?: boolean;
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
  /** Stroke color of each cell, resolved like `fill` */
  stroke?: ColorProp<BinCell<T>>;
  fillOpacity?: StyleProp<number | undefined, BinCell<T>>;
  strokeOpacity?: StyleProp<number | undefined, BinCell<T>>;
  strokeWidth?: StyleProp<number | undefined, BinCell<T>>;
  opacity?: StyleProp<number | undefined, BinCell<T>>;
  /**
   * Size each cell by a value rather than filling the grid, ex. `r="count"`.
   * - `string` / `function(cell)`: area proportional to the value, the largest filling its cell
   * - `number`: circumradius in pixels
   */
  r?: DataProp<BinCell<T>>;
  /**
   * On an `isometric` chart, stand each cell up as a prism, ex. `z="count"`.
   * - `string` / `function(cell)`: resolved through `zScale`, domained to `[0, max]` unless the
   *   chart has a `zDomain`
   * - `number`: pixel height for every cell
   */
  z?: DataProp<BinCell<T>>;
  class?: string;
  /** Render the cells yourself (ex. as `Circle`s or `Text` labels) instead of as polygons */
  children?: Snippet<[{ cells: BinCell<T>[] }]>;
  onclick?: (e: MouseEvent, cell: BinCell<T>) => void;
  onpointerenter?: (e: PointerEvent, cell: BinCell<T>) => void;
  onpointermove?: (e: PointerEvent, cell: BinCell<T>) => void;
  onpointerleave?: (e: PointerEvent, cell: BinCell<T>) => void;
};

export type BinProps<T = any> = BinPropsWithoutHTML<T> &
  Without<SVGAttributes<SVGGElement>, BinPropsWithoutHTML<T>>;

const SQRT3 = Math.sqrt(3);

type Grid = {
  /** The cell `[x, y]` falls in, as a key and its center */
  locate(x: number, y: number): { key: string; x: number; y: number; up?: boolean };
  /** Every cell overlapping `[0, width] × [0, height]` */
  cover(width: number, height: number): { key: string; x: number; y: number; up?: boolean }[];
  /** Vertices of the cell centered at `[x, y]` */
  polygon(x: number, y: number, up?: boolean): [number, number][];
  /** Distance from a cell's center to its vertices */
  circumradius: number;
};

/**
 * Pointy-topped hexagons in rows `size * √3 / 2` apart, every other row shifted half a cell, with
 * the first centered on the plot's top-left corner.
 */
function hexagonGrid(size: number): Grid {
  const r = size / SQRT3;
  const dy = r * 1.5;
  const center = (i: number, j: number) => ({
    key: `${i},${j}`,
    x: (i + (j & 1) / 2) * size,
    y: j * dy,
  });
  return {
    locate(x, y) {
      // The nearest of the two candidate rows' centers — a hexagonal grid's cells are exactly the
      // regions closest to each center
      const j = Math.round(y / dy);
      const a = center(Math.round(x / size - (j & 1) / 2), j);
      const j2 = y / dy < j ? j - 1 : j + 1;
      const b = center(Math.round(x / size - (j2 & 1) / 2), j2);
      return (x - a.x) ** 2 + (y - a.y) ** 2 <= (x - b.x) ** 2 + (y - b.y) ** 2 ? a : b;
    },
    cover(width, height) {
      const cells = [];
      for (let j = 0; j * dy - r < height; j++) {
        for (let i = -1; (i - 0.5) * size < width; i++) {
          const c = center(i, j);
          if (c.x + size / 2 > 0 && c.x - size / 2 < width) cells.push(c);
        }
      }
      return cells;
    },
    polygon(x, y) {
      return [
        [x, y - r],
        [x + size / 2, y - r / 2],
        [x + size / 2, y + r / 2],
        [x, y + r],
        [x - size / 2, y + r / 2],
        [x - size / 2, y - r / 2],
      ];
    },
    circumradius: r,
  };
}

/** Squares with their corners on multiples of `size` */
function squareGrid(size: number): Grid {
  const center = (i: number, j: number) => ({
    key: `${i},${j}`,
    x: (i + 0.5) * size,
    y: (j + 0.5) * size,
  });
  return {
    locate(x, y) {
      return center(Math.floor(x / size), Math.floor(y / size));
    },
    cover(width, height) {
      const cells = [];
      for (let j = 0; j * size < height; j++) {
        for (let i = 0; i * size < width; i++) cells.push(center(i, j));
      }
      return cells;
    },
    polygon(x, y) {
      const s = size / 2;
      return [
        [x - s, y - s],
        [x + s, y - s],
        [x + s, y + s],
        [x - s, y + s],
      ];
    },
    circumradius: size / Math.SQRT2,
  };
}

/**
 * Equilateral triangles in rows `size * √3 / 2` tall, alternately pointing up and down, every other
 * row shifted half a cell so their vertices meet.
 */
function triangleGrid(size: number): Grid {
  const h = (size * SQRT3) / 2;
  // `i` counts apexes along row `j`: an upward triangle is centered under apex `i`, a downward one
  // between apexes `i` and `i + 1`
  const center = (i: number, j: number, up: boolean) => ({
    key: `${i},${j},${up ? 'u' : 'd'}`,
    x: (i + (j & 1) / 2 + (up ? 0 : 0.5)) * size,
    y: j * h + (up ? (2 * h) / 3 : h / 3),
    up,
  });
  return {
    locate(x, y) {
      const j = Math.floor(y / h);
      // How far down its row the point is, and where along it in cells
      const depth = y / h - j;
      const u = x / size - (j & 1) / 2;
      const apex = Math.round(u);
      // An upward triangle is `depth` cells wide at that depth
      return Math.abs(u - apex) <= depth / 2
        ? center(apex, j, true)
        : center(Math.floor(u), j, false);
    },
    cover(width, height) {
      const cells = [];
      for (let j = 0; j * h < height; j++) {
        for (let i = -1; (i - 0.5) * size < width; i++) {
          for (const up of [true, false]) {
            const c = center(i, j, up);
            if (c.x + size / 2 > 0 && c.x - size / 2 < width) cells.push(c);
          }
        }
      }
      return cells;
    },
    polygon(x, y, up) {
      // The centroid sits a third of the way up from the base
      const s = size / 2;
      return up
        ? [
            [x, y - (2 * h) / 3],
            [x + s, y + h / 3],
            [x - s, y + h / 3],
          ]
        : [
            [x - s, y - h / 3],
            [x + s, y - h / 3],
            [x, y + (2 * h) / 3],
          ];
    },
    circumradius: size / SQRT3,
  };
}

export function binGrid(shape: BinShape, size: number): Grid {
  switch (shape) {
    case 'square':
      return squareGrid(size);
    case 'triangle':
      return triangleGrid(size);
    default:
      return hexagonGrid(size);
  }
}

/**
 * Group `data` into the cells of a `shape` grid by pixel position, in order of each cell's first row.
 * With `empty`, every cell overlapping `[0, width] × [0, height]` is included, in row order, ahead
 * of any outside it.
 */
export function binCells<T>(
  data: Iterable<T>,
  position: (d: T) => [number, number] | null | undefined,
  options: { shape: BinShape; size: number; empty?: { width: number; height: number } }
): BinCell<T>[] {
  const grid = binGrid(options.shape, options.size);
  const cells = new Map<string, BinCell<T> & { up?: boolean }>();

  const add = (c: { key: string; x: number; y: number; up?: boolean }) => {
    const cell = { x: c.x, y: c.y, data: [] as T[], count: 0, polygon: [], up: c.up };
    cells.set(c.key, cell);
    return cell;
  };

  if (options.empty) {
    for (const c of grid.cover(options.empty.width, options.empty.height)) add(c);
  }

  for (const d of data) {
    const p = position(d);
    if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
    const c = grid.locate(p[0], p[1]);
    const cell = cells.get(c.key) ?? add(c);
    cell.data.push(d);
    cell.count++;
  }

  return Array.from(cells.values(), ({ up, ...cell }) => {
    cell.polygon = grid.polygon(cell.x, cell.y, up);
    return cell;
  });
}
