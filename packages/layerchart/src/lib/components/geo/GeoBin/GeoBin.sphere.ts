import { range } from 'd3-array';
import {
  geoArea,
  geoCentroid,
  geoDistance,
  geoInterpolate,
  geoProjection,
  geoRotation,
} from 'd3-geo';
// @ts-expect-error - no types available
import { geoGrayFullerRaw } from 'd3-geo-polygon';
// @ts-expect-error - no types available
import { geoDelaunay } from 'd3-geo-voronoi';
import { sideShade } from '$lib/utils/isometric.js';
import type {
  BinCell,
  BinShape,
  SphereBinning,
  SphereColumn,
} from '../../Bin/Bin.shared.svelte.js';

type LonLat = [number, number];

/** A grid of cells on the sphere: their centers, outlines, and which one a point falls in */
export type SphereGrid = {
  /** `[longitude, latitude]` of each cell's center */
  centers: LonLat[];
  /** Each cell's outline as a closed ring of `[longitude, latitude]` */
  polygons: LonLat[][];
  /** Index of the cell `[longitude, latitude]` falls in — the one with the nearest center */
  find(point: LonLat): number;
};

/** Angle between neighboring icosahedron vertices, `atan(2)` radians — the grid's spacing at `k = 1` */
export const ICOSAHEDRON_EDGE = Math.atan(2);

/** Turns the icosahedron so its 12 vertices — the grid's pentagons — fall in the ocean */
const AIROCEAN_ROTATION: [number, number, number] = [-83.65929, 25.44458, -87.45184];

/** Most cells a grid on the sphere may have, as fine zooms would otherwise build huge ones */
const MAX_CELLS = 100_000;

/** For the icosahedron's shapes, the angle between neighboring cells at `k = 1`, and how many cells `k` makes */
const SHAPES: Record<'hexagon' | 'triangle', { spacing: number; count: (k: number) => number }> = {
  // Fuller's icosahedron, its faces divided `k` times along each edge
  hexagon: { spacing: ICOSAHEDRON_EDGE, count: (k) => 10 * k * k + 2 },
  triangle: { spacing: ICOSAHEDRON_EDGE, count: (k) => 20 * k * k },
};

/**
 * Graticule steps in degrees that divide 180°, so cells start at the poles and the antimeridian —
 * from the finest within `MAX_CELLS` (`360 / 1 × 180 / 1`)
 */
const GRATICULE_STEPS = [1, 1.5, 2, 3, 4, 5, 6, 9, 10, 12, 15, 18, 20, 30, 36, 45, 60, 90];

/**
 * The grid resolution `k` whose `shape` cells are about `size` pixels across on a globe of `scale`
 * radius.  Kept to a few steps, each within an eighth of the ideal, so a zoom only builds and bins a
 * new grid now and then rather than on every frame.
 */
function sphereResolution(shape: BinShape, scale: number, size: number) {
  if (shape === 'square') {
    // The graticule step nearest `size`, as rows from pole to pole
    const ideal = (size / scale) * (180 / Math.PI);
    const step = GRATICULE_STEPS.reduce((best, s) =>
      Math.abs(Math.log(s / ideal)) < Math.abs(Math.log(best / ideal)) ? s : best
    );
    return 180 / step;
  }
  const { spacing, count } = SHAPES[shape];
  let max = 1;
  while (count(max + 1) <= MAX_CELLS) max++;
  const k = Math.min(Math.max((scale * spacing) / size, 1), max);
  if (k <= 8) return Math.round(k);
  const step = 2 ** (Math.floor(Math.log2(k)) - 2);
  return Math.min(Math.round(k / step) * step, max);
}

/**
 * Whether any of a ring on the sphere faces the viewer of `projection` — within its `clipAngle` of
 * the globe's center
 */
/** Farthest any cell's outline reaches from its center, in radians */
const reaches = new WeakMap<SphereGrid, number>();

function cellReach(grid: SphereGrid) {
  let reach = reaches.get(grid);
  if (reach == null) {
    reach = 0;
    grid.polygons.forEach((ring, i) => {
      for (const p of ring) reach = Math.max(reach!, geoDistance(grid.centers[i], p));
    });
    reaches.set(grid, reach);
  }
  return reach;
}

/**
 * Whether any of a cell, by its center, faces the viewer of `projection` — within its `clipAngle`
 * of the globe's center, plus the farthest a cell reaches from its center.  A dot product a cell
 * rather than a distance a corner, as it's asked of every cell on every frame of a turn.
 */
function facingCell(
  projection: { rotate?(): number[]; clipAngle?(): number | null },
  grid: SphereGrid
) {
  // A flat map shows the whole sphere, and a composite one (`geoAlbersUsa`) has neither
  if (!projection.rotate || projection.clipAngle?.() == null) return () => true;
  const [lambda, phi] = projection.rotate();
  const view = cartesian([-lambda, -phi]);
  const reach = ((projection.clipAngle?.() ?? 90) * Math.PI) / 180 + cellReach(grid);
  if (reach >= Math.PI) return () => true;
  const least = Math.cos(reach);
  return (center: LonLat) => dot(cartesian(center), view) > least;
}

/**
 * A `Map` keeping only the `size` most recently used entries — a fine grid holds a lot, and a zoom
 * or a slider can visit many
 */
function recentCache<K, V>(size: number) {
  const entries = new Map<K, V>();
  return {
    get(key: K) {
      const value = entries.get(key);
      if (value !== undefined) {
        // Most recent last
        entries.delete(key);
        entries.set(key, value);
      }
      return value;
    },
    set(key: K, value: V) {
      entries.set(key, value);
      if (entries.size > size) entries.delete(entries.keys().next().value!);
    },
  };
}

const grids = recentCache<string, SphereGrid>(4);

/**
 * A near-equal-area grid of `shape` cells tiling the sphere at resolution `k`:
 * - `hexagon`: `10k² + 2` hexagons, and 12 pentagons where the icosahedron's vertices fall
 * - `triangle`: `20k²` triangles, joining the hexagons' centers
 * - `square`: `2k²` cells between meridians and parallels `180 / k`° apart, as a graticule draws
 *
 * Cached, as a grid depends only on its shape and `k`, and takes a while to build when fine.
 */
export function sphereGrid(shape: BinShape, k: number): SphereGrid {
  const key = `${shape}:${k}`;
  let grid = grids.get(key);
  if (!grid) {
    grid =
      shape === 'square'
        ? graticuleGrid(k)
        : shape === 'triangle'
          ? triangleGrid(k)
          : hexagonGrid(k);
    grids.set(key, grid);
  }
  return grid;
}

const geodesics = recentCache<number, { points: LonLat[]; delaunay: any }>(3);

/**
 * `10k² + 2` points spread evenly over the sphere, and their spherical Delaunay triangulation: each
 * icosahedron face divided `k` times along its edges, through Gray's equal-area transformation of
 * Fuller's projection.
 *
 * @see https://observablehq.com/@fil/gray-fuller-grid
 * @see https://github.com/tzakharko/uniform-geodesic-grid
 */
function geodesicPoints(k: number) {
  let geodesic = geodesics.get(k);
  if (geodesic) return geodesic;

  // One icosahedron face, as a spherical triangle
  const theta = (Math.atan(0.5) * 180) / Math.PI;
  const triangle: LonLat[] = [
    [0, theta],
    [36, -theta],
    [-36, -theta],
  ];
  const centroid = geoCentroid({ type: 'Polygon', coordinates: [[...triangle, triangle[0]]] });

  // Maps the spherical triangle onto a flat one with equal areas, so points spaced evenly there are
  // spaced evenly on the sphere
  const flat = geoProjection(geoGrayFullerRaw())
    .rotate([-centroid[0], -centroid[1]])
    .center([0, triangle[0][1] - centroid[1]])
    .scale(1)
    .translate([0, 0]);
  const corners = triangle.map((p) => flat(p) as LonLat);

  // Points strictly inside the face — those on its edges and corners are shared, so added once below
  const inside: LonLat[] = [];
  for (let u = k - 1; u >= 1; u--) {
    for (let v = 1; v <= k - u - 1; v++) {
      const w = [u / k, v / k, (k - u - v) / k];
      inside.push(
        [0, 1].map((c) => w.reduce((sum, wi, i) => sum + corners[i][c] * wi, 0)) as LonLat
      );
    }
  }

  // The same face's points on all 20 faces: 10 around the middle, and 5 at each pole
  const cap = geoRotation([0, 90 - theta, 180]);
  const facePoints = inside
    .map((p) => flat.invert!(p) as LonLat)
    .flatMap(([x0, y0]) => {
      const [x1, y1] = cap([x0, y0]) as LonLat;
      return [
        ...range(10).map((i): LonLat => [x0 + i * 36, (i % 2 ? -1 : 1) * y0]),
        ...range(5).map((i): LonLat => [x1 + i * 72, y1]),
        ...range(5).map((i): LonLat => [36 - x1 + i * 72, -y1]),
      ];
    });

  // The icosahedron's vertices, and points along its 30 edges
  const vertices: LonLat[] = [
    [0, 90],
    [0, -90],
    ...range(10).map((i): LonLat => [((i * 36 + 180) % 360) - 180, i & 1 ? -theta : theta]),
  ];
  const edges = vertices.flatMap((v0, i) =>
    vertices.slice(i + 1).flatMap((v1) => {
      // Neighboring vertices are `ICOSAHEDRON_EDGE` apart
      if (Math.abs(geoDistance(v0, v1) - ICOSAHEDRON_EDGE) >= 0.01) return [];
      const along = geoInterpolate(v0, v1);
      return range(1, k).map((i) => along(i / k) as LonLat);
    })
  );

  const toOcean = geoRotation(AIROCEAN_ROTATION);
  const turn = geoRotation([36, 0, 0]);
  const points = [...vertices, ...edges, ...facePoints].map(
    (p) => toOcean.invert!(turn(p) as LonLat) as LonLat
  );

  geodesic = { points, delaunay: geoDelaunay(points) };
  geodesics.set(k, geodesic);
  return geodesic;
}

/** The geodesic points' spherical Voronoi cells */
function hexagonGrid(k: number): SphereGrid {
  const { points, delaunay } = geodesicPoints(k);
  const polygons = (delaunay.polygons as number[][]).map((ring) =>
    closed(ring.map((j) => delaunay.centers[j] as LonLat))
  );
  // Walking from the last cell found, as nearby points tend to arrive together
  let last = 0;
  return {
    centers: points,
    polygons,
    find([lon, lat]) {
      const found = delaunay.find(lon, lat, last);
      if (found != null && found >= 0) last = found;
      return found;
    },
  };
}

/** The geodesic points' spherical Delaunay triangles */
function triangleGrid(k: number): SphereGrid {
  const { points, delaunay } = geodesicPoints(k);
  const corners = points.map(cartesian);
  const triangles = (delaunay.triangles as number[][]).map((t) =>
    // Clockwise seen from outside, as d3-geo takes a polygon's inside — and all alike, so
    // containment is the same test for each
    orientation(corners[t[0]], corners[t[1]], corners[t[2]]) > 0 ? [t[0], t[2], t[1]] : t
  );
  const polygons = triangles.map((t) => closed(t.map((i) => points[i])));
  const centers = triangles.map((t) =>
    spherical(normalize(add(add(corners[t[0]], corners[t[1]]), corners[t[2]])))
  );

  // The triangles around each point, as a point's triangle is (all but always) one of those around
  // the point nearest it
  const around: number[][] = points.map(() => []);
  triangles.forEach((t, i) => t.forEach((j) => around[j].push(i)));
  const contains = (i: number, p: Vec3) => {
    const [a, b, c] = triangles[i].map((j) => corners[j]);
    return orientation(a, b, p) <= 0 && orientation(b, c, p) <= 0 && orientation(c, a, p) <= 0;
  };

  let last = 0;
  return {
    centers,
    polygons,
    find([lon, lat]) {
      const nearest = delaunay.find(lon, lat, last);
      if (nearest == null || nearest < 0) return -1;
      last = nearest;
      const p = cartesian([lon, lat]);
      const candidates = around[nearest];
      const found =
        candidates.find((i) => contains(i, p)) ??
        candidates
          .flatMap((i) => triangles[i].flatMap((j) => around[j]))
          .find((i) => contains(i, p));
      if (found != null) return found;
      // Numerically on an edge: the candidate whose center is nearest
      let best = candidates[0];
      for (const i of candidates) {
        if (geoDistance(centers[i], [lon, lat]) < geoDistance(centers[best], [lon, lat])) best = i;
      }
      return best;
    },
  };
}

/**
 * Cells between meridians and parallels `180 / k`° apart — those of a `Graticule` drawn at that
 * step.  Unlike the other shapes, not equal in area: they narrow toward the poles, to triangles
 * around them.
 */
/** How far short of a pole, in degrees, the cells around it stop — about 100m */
const POLE_GAP = 1e-3;

function graticuleGrid(k: number): SphereGrid {
  const step = 180 / k;

  // A parallel drawn as one, rather than the great circle between its ends.  The cells around a pole
  // stop a hair short of it: a globe turned to face the equator has its poles exactly on the horizon,
  // and a corner there is clipped as if the cell were inside out, filling the globe
  const parallel = (lat: number, lon0: number, lon1: number) => {
    lat = Math.sign(lat) * Math.min(Math.abs(lat), 90 - POLE_GAP);
    const steps = Math.max(1, Math.ceil(Math.abs(lon1 - lon0) / 2));
    return range(steps + 1).map((i): LonLat => [lon0 + ((lon1 - lon0) * i) / steps, lat]);
  };

  const centers: LonLat[] = [];
  const polygons: LonLat[][] = [];
  for (let r = 0; r < k; r++) {
    const lat0 = -90 + r * step;
    for (let c = 0; c < 2 * k; c++) {
      const lon0 = -180 + c * step;
      centers.push([lon0 + step / 2, lat0 + step / 2]);
      let ring = closed([
        ...parallel(lat0 + step, lon0, lon0 + step),
        ...parallel(lat0, lon0 + step, lon0),
      ]);
      // Clockwise seen from outside, as d3-geo takes a polygon's inside
      if (geoArea({ type: 'Polygon', coordinates: [ring] }) > 2 * Math.PI) ring = ring.reverse();
      polygons.push(ring);
    }
  }

  return {
    centers,
    polygons,
    find([lon, lat]) {
      const r = Math.min(Math.max(Math.floor((lat + 90) / step), 0), k - 1);
      const wrapped = ((((lon + 180) % 360) + 360) % 360) / step;
      return r * 2 * k + Math.min(Math.floor(wrapped), 2 * k - 1);
    },
  };
}

type Vec3 = [number, number, number];

const radians = Math.PI / 180;

function cartesian([lon, lat]: LonLat): Vec3 {
  const phi = lat * radians;
  const lambda = lon * radians;
  return [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)];
}

function spherical([x, y, z]: Vec3): LonLat {
  return [Math.atan2(y, x) / radians, Math.asin(Math.max(-1, Math.min(1, z))) / radians];
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale(a: Vec3, k: number): Vec3 {
  return [a[0] * k, a[1] * k, a[2] * k];
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(a: Vec3): Vec3 {
  return scale(a, 1 / Math.sqrt(dot(a, a)));
}

/** `> 0` when `c` is to the left of the great circle from `a` to `b`, seen from outside */
function orientation(a: Vec3, b: Vec3, c: Vec3) {
  return (
    c[0] * (a[1] * b[2] - a[2] * b[1]) +
    c[1] * (a[2] * b[0] - a[0] * b[2]) +
    c[2] * (a[0] * b[1] - a[1] * b[0])
  );
}

/** `ring` with its first point repeated at the end */
function closed(ring: LonLat[]) {
  return [...ring, ring[0]];
}

/**
 * A cell stood up `height` pixels off an orthographic globe, as a column pointing out from its
 * center — or `null` when it's on the far side.
 *
 * An orthographic globe is a parallel projection, so a point raised off the sphere lands along the
 * line from the globe's center through where it's drawn, as much farther out as it's raised over
 * the radius.  Its sides are drawn where they face the viewer, shaded by how far they turn, as an
 * `isometric` chart shades a raised shape's.
 */
function sphereColumn(
  projection: {
    (point: LonLat): [number, number] | null;
    rotate(): number[];
    scale(): number;
    translate(): number[];
  },
  ring: LonLat[],
  center: LonLat,
  height: number
): SphereColumn | null {
  const turn = geoRotation(projection.rotate() as [number, number, number]);
  // Right, up, and toward the viewer, as the globe is turned to face them
  const facingViewer = (p: LonLat): Vec3 => {
    const [lambda, phi] = turn(p);
    const c = Math.cos(phi * radians);
    return [
      c * Math.sin(lambda * radians),
      Math.sin(phi * radians),
      c * Math.cos(lambda * radians),
    ];
  };
  const axis = facingViewer(center);
  if (axis[2] <= 0) return null;
  // Only while all of its base faces the viewer: a corner past the horizon is drawn as if seen
  // through the globe, and would stand its sides up across it
  const corners = ring.slice(0, -1);
  const around = corners.map(facingViewer);
  if (around.some((p) => p[2] <= 0)) return null;

  const [tx, ty] = projection.translate();
  const out = 1 + Math.max(0, height) / projection.scale();
  const base = corners.map((p): [number, number] => projection(p) ?? [tx, ty]);
  const top = base.map(([x, y]) => [tx + (x - tx) * out, ty + (y - ty) * out] as [number, number]);
  const polygon = (points: [number, number][]) => `M${points.join('L')}Z`;

  let sides = '';
  const shades: SphereColumn['shades'] = [];
  if (height > 0) {
    for (let i = 0; i < corners.length; i++) {
      const j = (i + 1) % corners.length;
      // The side's outward normal: from the column's axis toward the middle of its edge
      const middle = normalize(add(around[i], around[j]));
      const along = dot(middle, axis);
      const normal: Vec3 = [
        middle[0] - along * axis[0],
        middle[1] - along * axis[1],
        middle[2] - along * axis[2],
      ];
      if (normal[2] <= 1e-9) continue;
      const d = polygon([base[i], base[j], top[j], top[i]]);
      sides += d;
      shades.push({ d, opacity: sideShade(normal[0], normal[2]) });
    }
  }

  return { sides, shades, top: polygon(top), depth: axis[2] };
}

/** Each cell's outline on the sphere, for drawing it through the projection */
const sphereRings = new WeakMap<object, LonLat[]>();

/**
 * Group `data` into the cells of a sphere `grid` by `[longitude, latitude]`, in order of each cell's
 * first row.  Cells have a `center` rather than a position, which only the projection gives.
 */
function binSphere<T>(data: Iterable<T>, lonLat: (d: T) => LonLat, grid: SphereGrid): BinCell<T>[] {
  const cells = new Map<number, BinCell<T>>();
  for (const d of data) {
    const p = lonLat(d);
    if (!Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
    const i = grid.find(p);
    let cell = cells.get(i);
    if (!cell) {
      cell = { x: NaN, y: NaN, data: [], count: 0, polygon: [], center: grid.centers[i] };
      sphereRings.set(cell, grid.polygons[i]);
      cells.set(i, cell);
    }
    cell.data.push(d);
    cell.count++;
  }
  return Array.from(cells.values());
}

/**
 * A cell placed where the projection draws it.  Its outline is projected only when read — drawing
 * goes through the projection instead — and kept on the prototype, as a turning globe places every
 * cell facing the viewer on every frame.
 */
class ShownCell<T> implements BinCell<T> {
  data: T[];
  count: number;
  center: LonLat;
  #ring: LonLat[];
  #project: (point: LonLat) => [number, number] | null;
  #polygon: [number, number][] | undefined;

  constructor(
    cell: BinCell<T>,
    ring: LonLat[],
    project: (point: LonLat) => [number, number] | null,
    public x: number,
    public y: number
  ) {
    this.data = cell.data;
    this.count = cell.count;
    this.center = cell.center!;
    this.#ring = ring;
    this.#project = project;
  }

  get polygon() {
    return (this.#polygon ??= this.#ring.slice(0, -1).map((p) => this.#project(p) ?? [NaN, NaN]));
  }

  static ring(cell: object) {
    return #ring in cell ? (cell as ShownCell<unknown>).#ring : undefined;
  }
}

/** How `GeoBin` bins on the sphere, given to `Bin`'s implementation so only `GeoBin` loads it */
export const sphereBinning: SphereBinning<SphereGrid> = {
  grid: (shape, scale, size) => sphereGrid(shape, sphereResolution(shape, scale, size)),
  bin: binSphere,
  polygons: (grid) => grid.polygons,
  centers: (grid) => grid.centers,
  ring: (cell) => ShownCell.ring(cell) ?? sphereRings.get(cell),
  show(cell, projection) {
    const [x, y] = projection(cell.center!) ?? [NaN, NaN];
    return new ShownCell(cell, sphereRings.get(cell)!, projection, x, y);
  },
  facing: facingCell,
  column: sphereColumn,
};
