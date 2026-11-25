/**
 * Polygon helpers shared by marks that measure shapes on screen (ex. `Labels`' `layout="shape"`).
 * Internal: not exported from the package.
 */
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
