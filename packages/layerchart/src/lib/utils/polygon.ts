/**
 * Polygon helpers shared by marks that measure shapes on screen (ex. `Voronoi`'s `clip`, `Labels`'
 * `layout="shape"`).  Internal: not exported from the package.
 */
import { group, range } from 'd3-array';
import { geoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';

type Point = [number, number];

/**
 * A GeoJSON object's polygons on screen (clipped and resampled by the projection), each ring as its
 * own polygon (holes are rare, and only cost a label some room)
 */
export function geoPolygons(projection: GeoProjection, object: GeoPermissibleObjects): Point[][][] {
  const polygons: Point[][][] = [];
  let ring: Point[] = [];
  const context = {
    beginPath() {},
    moveTo(x: number, y: number) {
      ring = [[x, y]];
    },
    lineTo(x: number, y: number) {
      ring.push([x, y]);
    },
    closePath() {
      if (ring.length > 2) polygons.push([ring]);
      ring = [];
    },
    arc() {},
  };
  geoPath(projection, context as any)(object);
  return polygons;
}

/**
 * `subject` (any polygon) cut to within the convex `clip` polygon (Sutherland–Hodgman), keeping
 * `subject`'s winding.  Empty (or fewer than 3 points) when they don't overlap.
 */
export function clipToConvex(subject: Point[], clip: Point[]): Point[] {
  // Winding of the clip polygon (sign of its area), to know which side of each edge is inside
  let area = 0;
  for (let i = 0, n = clip.length; i < n; i++) {
    const [x, y] = clip[i];
    const [nx, ny] = clip[(i + 1) % n];
    area += x * ny - nx * y;
  }
  const sign = Math.sign(area);

  let output = subject;
  for (let i = 0, n = clip.length; i < n && output.length; i++) {
    const [ax, ay] = clip[i];
    const [bx, by] = clip[(i + 1) % n];
    if (ax === bx && ay === by) continue; // a closed ring's repeated first point
    const side = ([x, y]: Point) => sign * ((bx - ax) * (y - ay) - (by - ay) * (x - ax));
    const input = output;
    output = [];
    for (let j = 0; j < input.length; j++) {
      const current = input[j];
      const previous = input[(j + input.length - 1) % input.length];
      const sc = side(current);
      const sp = side(previous);
      if (sp >= 0 !== sc >= 0) {
        // The edge crosses the clip line
        const t = sp / (sp - sc);
        output.push([
          previous[0] + t * (current[0] - previous[0]),
          previous[1] + t * (current[1] - previous[1]),
        ]);
      }
      if (sc >= 0) output.push(current);
    }
  }
  return output;
}

/**
 * Points sharing a position moved a pixel apart, around it, so each gets a share of what they'd
 * otherwise contest (ex. two teams sharing a stadium, in a Voronoi diagram)
 */
export function spreadApart(points: Point[]): Point[] {
  const spread = points.map(([x, y]): Point => [x, y]);
  const shared = group(range(points.length), (i) => `${points[i][0]},${points[i][1]}`);
  for (const indexes of shared.values()) {
    if (indexes.length === 1) continue;
    indexes.forEach((i, k) => {
      const angle = (2 * Math.PI * k) / indexes.length;
      spread[i] = [points[i][0] + Math.cos(angle), points[i][1] + Math.sin(angle)];
    });
  }
  return spread;
}

/** SVG path data for polygons' rings */
export function ringsToPath(rings: Point[][]): string {
  return rings.map((ring) => `M${ring.join('L')}Z`).join('');
}
