import { Delaunay } from 'd3-delaunay';

export type InterpolateMethod = 'none' | 'nearest' | 'barycentric';

/**
 * Interpolate scattered 2D points onto a regular grid.
 *
 * @param points - Array of [x, y, value] triples in grid coordinates
 * @param width - Grid width (columns)
 * @param height - Grid height (rows)
 * @param method - Interpolation method
 * @returns Flat Float64Array of grid values (row-major, length = width * height)
 */
export function interpolateGrid(
  points: [number, number, number][],
  width: number,
  height: number,
  method: InterpolateMethod = 'barycentric'
): Float64Array {
  const n = width * height;
  const grid = new Float64Array(n);

  if (points.length === 0) {
    grid.fill(NaN);
    return grid;
  }

  // Need at least 3 points for triangulation
  if (points.length < 3) {
    return interpolateNearest(points, width, height, grid);
  }

  switch (method) {
    case 'none':
      return interpolateNone(points, width, height, grid);
    case 'nearest':
      return interpolateNearest(points, width, height, grid);
    case 'barycentric':
      return interpolateBarycentric(points, width, height, grid);
    default:
      return interpolateBarycentric(points, width, height, grid);
  }
}

/** Only fill grid cells that directly contain a data point */
function interpolateNone(
  points: [number, number, number][],
  width: number,
  _height: number,
  grid: Float64Array
): Float64Array {
  grid.fill(NaN);
  for (const [x, y, value] of points) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < width && iy >= 0 && iy < grid.length / width) {
      grid[iy * width + ix] = value;
    }
  }
  return grid;
}

/** Assign each grid cell the value of its nearest data point (Voronoi) */
function interpolateNearest(
  points: [number, number, number][],
  width: number,
  height: number,
  grid: Float64Array
): Float64Array {
  const delaunay = Delaunay.from(
    points,
    (d) => d[0],
    (d) => d[1]
  );
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const idx = delaunay.find(i + 0.5, j + 0.5);
      grid[j * width + i] = points[idx][2];
    }
  }
  return grid;
}

/** Delaunay triangulation with barycentric interpolation within triangles */
function interpolateBarycentric(
  points: [number, number, number][],
  width: number,
  height: number,
  grid: Float64Array
): Float64Array {
  const delaunay = Delaunay.from(
    points,
    (d) => d[0],
    (d) => d[1]
  );
  const { triangles } = delaunay;
  const numTriangles = triangles.length / 3;

  // Build per-point triangle adjacency for fast lookup
  const pointTriangles: number[][] = Array.from({ length: points.length }, () => []);
  for (let t = 0; t < numTriangles; t++) {
    pointTriangles[triangles[t * 3]].push(t);
    pointTriangles[triangles[t * 3 + 1]].push(t);
    pointTriangles[triangles[t * 3 + 2]].push(t);
  }

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const px = i + 0.5;
      const py = j + 0.5;
      const nearest = delaunay.find(px, py);

      let value = NaN;

      // Check triangles incident to the nearest point
      for (const t of pointTriangles[nearest]) {
        const i0 = triangles[t * 3];
        const i1 = triangles[t * 3 + 1];
        const i2 = triangles[t * 3 + 2];

        const x0 = points[i0][0],
          y0 = points[i0][1];
        const x1 = points[i1][0],
          y1 = points[i1][1];
        const x2 = points[i2][0],
          y2 = points[i2][1];

        // Barycentric coordinates
        const denom = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
        if (Math.abs(denom) < 1e-10) continue;

        const w0 = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) / denom;
        const w1 = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) / denom;
        const w2 = 1 - w0 - w1;

        // Point is inside triangle (with small epsilon for edge cases)
        if (w0 >= -1e-6 && w1 >= -1e-6 && w2 >= -1e-6) {
          value = w0 * points[i0][2] + w1 * points[i1][2] + w2 * points[i2][2];
          break;
        }
      }

      // Fallback for points outside convex hull
      if (isNaN(value)) {
        value = points[nearest][2];
      }

      grid[j * width + i] = value;
    }
  }

  return grid;
}
