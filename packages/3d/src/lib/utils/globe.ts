import {
  geoDistance,
  geoInterpolate,
  geoOrthographic,
  geoRotation,
  type GeoProjection,
} from 'd3-geo';
import type { Geometry, Position } from 'geojson';
import type { ChartState } from 'layerchart';

const GLOBE = Symbol.for('layerchart.3d.globe');

/**
 * A projection onto a sphere, for a `Chart`'s `geo` in a `Scene`: `geo={{ projection: globe }}`.
 * Marks lay longitude and latitude on a globe you can orbit, with heights measured out from it.
 * To anything flat it's an orthographic projection, so fitting (`fitGeojson`), `scale`,
 * `translate`, and `rotate` work as they do for a flat globe: the globe is the size and place the
 * orthographic disk would be, standing on the floor, and `rotate` turns it.
 */
export function globe(): GeoProjection {
  const projection = geoOrthographic();
  (projection as any)[GLOBE] = true;
  return projection;
}

/** A point in the scene's axes under its root: `x` across, height, `y` down the plot */
export type ScenePoint = [x: number, height: number, y: number];

/** Where the chart's `globe` is, and how longitude / latitude land on it */
export type Sphere = {
  center: ScenePoint;
  radius: number;
  /** A longitude / latitude (degrees), `altitude` pixels off the surface */
  toScene(longitude: number, latitude: number, altitude?: number): ScenePoint;
  /** The longitude / latitude under a point in the scene */
  fromScene(point: ScenePoint): [longitude: number, latitude: number];
};

/** The chart's globe, when its projection is `globe`; `null` for a flat map or none */
export function getSphere(ctx: ChartState<any>): Sphere | null {
  const projection = ctx.geo.projection;
  if (!projection || !(projection as any)[GLOBE]) return null;
  const radius = projection.scale();
  const [x, y] = projection.translate();
  const center: ScenePoint = [x, radius, y];
  // The projection's `rotate` turns the globe, as it does a flat one
  const rotation = geoRotation(projection.rotate() as [number, number, number]);
  return {
    center,
    radius,
    toScene(longitude, latitude, altitude = 0) {
      const [λd, φd] = rotation([longitude, latitude]);
      const λ = (λd * Math.PI) / 180;
      const φ = (φd * Math.PI) / 180;
      const r = radius + altitude;
      // Longitude 0 faces the front of the plot (towards the viewer before the view turns), east
      // to its right, as an orthographic globe shows it
      return [
        center[0] + r * Math.sin(λ) * Math.cos(φ),
        center[1] + r * Math.sin(φ),
        center[2] + r * Math.cos(λ) * Math.cos(φ),
      ];
    },
    fromScene([px, height, py]) {
      const dx = px - center[0];
      const dy = height - center[1];
      const dz = py - center[2];
      const r = Math.hypot(dx, dy, dz) || 1;
      const λ = (Math.atan2(dx, dz) * 180) / Math.PI;
      const φ = (Math.asin(Math.max(-1, Math.min(1, dy / r))) * 180) / Math.PI;
      return rotation.invert([λ, φ]);
    },
  };
}

/** A degree or two between points, so lines follow the sphere rather than cutting through it */
const STEP = (1.5 * Math.PI) / 180;

/**
 * The great-circle arc between two points (longitude, latitude, altitude), as flattened points in
 * the scene's axes, the altitude eased between theirs.  `lift` raises its middle (ex. a flight).
 */
export function sphereArc(
  sphere: Sphere,
  a: [number, number, number?],
  b: [number, number, number?],
  lift = 0
): number[] {
  const steps = Math.max(1, Math.ceil(geoDistance([a[0], a[1]], [b[0], b[1]]) / STEP));
  const between = geoInterpolate([a[0], a[1]], [b[0], b[1]]);
  const points: number[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const [lon, lat] = between(t);
    const altitude = (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * t + 4 * lift * t * (1 - t);
    points.push(...sphere.toScene(lon, lat, altitude));
  }
  return points;
}

/** A line of longitude / latitude points as one polyline over the sphere */
function line(sphere: Sphere, positions: Position[], lift: number): number[] {
  const points: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    const arc = sphereArc(
      sphere,
      [positions[i - 1][0], positions[i - 1][1], lift],
      [positions[i][0], positions[i][1], lift]
    );
    // Each arc starts where the last ended
    for (let k = i === 1 ? 0 : 3; k < arc.length; k++) points.push(arc[k]);
  }
  return points;
}

/** A geometry's lines and polygon outlines as polylines over the sphere, `lift` pixels above it */
export function sphereLines(sphere: Sphere, geometry: Geometry | null, lift = 0.5): number[][] {
  if (!geometry) return [];
  switch (geometry.type) {
    case 'LineString':
      return [line(sphere, geometry.coordinates, lift)];
    case 'MultiLineString':
    case 'Polygon':
      return geometry.coordinates.map((positions) => line(sphere, positions, lift));
    case 'MultiPolygon':
      return geometry.coordinates.flatMap((polygon) =>
        polygon.map((ring) => line(sphere, ring, lift))
      );
    case 'GeometryCollection':
      return geometry.geometries.flatMap((g) => sphereLines(sphere, g, lift));
    default:
      return [];
  }
}

/**
 * A sphere of `segments` around, as positions and each vertex's longitude / latitude, for a mark
 * to raise (by `heightAt`) and color.  Vertices along the seam at ±180° are doubled, as a sphere's
 * texture wraps there.
 */
export function sphereGrid(sphere: Sphere, segments: number) {
  const columns = segments + 1;
  const rows = Math.max(8, Math.round(segments / 2)) + 1;
  const lonLat = new Float64Array(columns * rows * 2);
  const index: number[] = [];
  for (let j = 0; j < rows; j++) {
    const latitude = 90 - (180 * j) / (rows - 1);
    for (let i = 0; i < columns; i++) {
      const longitude = -180 + (360 * i) / (columns - 1);
      const k = j * columns + i;
      lonLat[k * 2] = longitude;
      lonLat[k * 2 + 1] = latitude;
    }
  }
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < columns - 1; i++) {
      const a = j * columns + i;
      index.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
    }
  }
  return { columns, rows, lonLat, index };
}
