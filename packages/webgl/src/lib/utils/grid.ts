import {
  accessor,
  interpolateGrid,
  resolveRasterBounds,
  sampleGridAtBounds,
  type Accessor,
  type ChartState,
  type InterpolateMethod,
} from 'layerchart';

/** How a grid of values is given — the same inputs as LayerChart's `Raster` */
export type GridDataProps = {
  /**
   * Row-major grid values (with `width` and `height`), or rows of scattered samples (with `x`,
   * `y`, and `value`) to interpolate onto a grid.
   */
  data?: ArrayLike<number> | any[];
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
  value?: Accessor | ((x: number, y: number) => number);
  /** A scattered row's `x`.  Defaults to the chart's. */
  x?: Accessor;
  /** A scattered row's `y`.  Defaults to the chart's. */
  y?: Accessor;
  /** @default 'barycentric' */
  interpolate?: InterpolateMethod;
  /** Pixels between samples of a function, scattered rows, or a grid on a map */
  pixelSize?: number;
};

/**
 * Values on a regular grid, and the plot area (in chart pixels) its cells cover: cell `(i, j)` is
 * centered at `left + (i + 0.5) * (right - left) / columns`, likewise down the rows.
 */
export type Grid = {
  values: Float64Array;
  columns: number;
  rows: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/**
 * Sample `props` onto a grid over the plot.  A grid of values lays out across its bounds through
 * the chart's scales (or fills the plot without bounds); on a map, and for functions and scattered
 * rows, the plot is sampled every `pixelSize` pixels.
 */
export function sampleGrid(
  ctx: ChartState<any>,
  props: GridDataProps,
  pixelSize: number
): Grid | null {
  const width = ctx.width;
  const height = ctx.height;
  if (!width || !height) return null;

  const projection = ctx.geo.projection;
  const isGrid = !!(props.data && props.width && props.height);
  const hasBounds = [props.x1, props.y1, props.x2, props.y2].some((v) => v !== undefined);

  // A grid of values laid out by the chart's scales, a cell per value
  if (isGrid && !projection) {
    const columns = props.width!;
    const rows = props.height!;
    const values = Float64Array.from(props.data as ArrayLike<number>);
    if (!hasBounds) return { values, columns, rows, left: 0, top: 0, right: width, bottom: height };
    const bounds = resolveRasterBounds(columns, rows, props.x1, props.y1, props.x2, props.y2);
    return {
      values,
      columns,
      rows,
      left: Number(ctx.xScale(bounds.x1)),
      top: Number(ctx.yScale(bounds.y1)),
      right: Number(ctx.xScale(bounds.x2)),
      bottom: Number(ctx.yScale(bounds.y2)),
    };
  }

  // Otherwise sampled across the plot, every `pixelSize` pixels
  const columns = Math.max(2, Math.ceil(width / pixelSize));
  const rows = Math.max(2, Math.ceil(height / pixelSize));
  const values = new Float64Array(columns * rows);
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  /** A cell center in data coordinates, or `null` where it has none (off a map's globe) */
  const invert = (px: number, py: number): [number, number] | null => {
    if (projection) {
      const point = projection.invert?.([px, py]);
      // Past some projections' edges (ex. Natural Earth's) the inverse still answers, off the globe
      // or not mapping back here
      if (!point || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) return null;
      const back = projection(point);
      if (!back || Math.hypot(back[0] - px, back[1] - py) > pixelSize) return null;
      return point;
    }
    const x = ctx.xScale.invert ? ctx.xScale.invert(px) : px;
    const y = ctx.yScale.invert ? ctx.yScale.invert(py) : py;
    return [Number(x), Number(y)];
  };

  if (isGrid) {
    // A grid on a map, read at each point's longitude / latitude
    const source = Float64Array.from(props.data as ArrayLike<number>);
    const bounds = resolveRasterBounds(
      props.width!,
      props.height!,
      props.x1,
      props.y1,
      props.x2,
      props.y2
    );
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        const point = invert((i + 0.5) * cellWidth, (j + 0.5) * cellHeight);
        values[j * columns + i] = point
          ? sampleGridAtBounds(source, props.width!, props.height!, bounds, point[0], point[1])
          : NaN;
      }
    }
  } else if (typeof props.value === 'function' && props.value.length >= 2) {
    const fn = props.value as (x: number, y: number) => number;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        const point = invert((i + 0.5) * cellWidth, (j + 0.5) * cellHeight);
        values[j * columns + i] = point ? fn(point[0], point[1]) : NaN;
      }
    }
  } else {
    const rowsData = (props.data ?? ctx.data ?? []) as any[];
    const x = accessor(props.x ?? ctx.config.x);
    const y = accessor(props.y ?? ctx.config.y);
    const value = accessor((props.value ?? 'value') as Accessor);
    const points: [number, number, number][] = [];
    for (const d of rowsData) {
      const p = projection
        ? projection([Number(x(d)), Number(y(d))])
        : [Number(ctx.xScale(x(d))), Number(ctx.yScale(y(d)))];
      if (!p) continue;
      points.push([p[0] / cellWidth, p[1] / cellHeight, Number(value(d))]);
    }
    values.set(interpolateGrid(points, columns, rows, props.interpolate ?? 'barycentric'));
  }

  return { values, columns, rows, left: 0, top: 0, right: width, bottom: height };
}

/** The `[min, max]` of a grid's finite values, or `null` without any */
export function gridExtent(values: ArrayLike<number>): [number, number] | null {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return min <= max ? [min, max] : null;
}

/**
 * The tooltip row for a point on a grid's mark (in chart pixels): the value of the cell under it,
 * and where it is in data coordinates (longitude / latitude on a map).  `undefined` off the grid.
 */
export function gridDatum(ctx: ChartState<any>, grid: Grid, px: number, py: number) {
  const i = Math.floor(((px - grid.left) / (grid.right - grid.left)) * grid.columns);
  const j = Math.floor(((py - grid.top) / (grid.bottom - grid.top)) * grid.rows);
  if (i < 0 || j < 0 || i >= grid.columns || j >= grid.rows) return undefined;
  const value = grid.values[j * grid.columns + i];
  if (!Number.isFinite(value)) return undefined;
  const projection = ctx.geo.projection;
  const [x, y] = projection
    ? (projection.invert?.([px, py]) ?? [NaN, NaN])
    : [
        ctx.xScale.invert ? ctx.xScale.invert(px) : px,
        ctx.yScale.invert ? ctx.yScale.invert(py) : py,
      ];
  return { x, y, value };
}
