import { range } from 'd3-array';
import { degreesToRadians } from './math.js';

/** Get points to create a polygon with given number of points and radius
 *
 * @param count - Number of points
 * @param radius - Radius of the polygon
 * @returns Array of points (angle, radius)
 */
export function polygonPoints(count: number, radius: number, rotate: number = 0) {
  const angle = 360 / count;

  return range(count).map((index) => {
    return {
      angle: degreesToRadians(angle * index) + degreesToRadians(rotate),
      radius,
    };
  });
}

/** Create polygon
 *
 * @param cx - Center x coordinate
 * @param cy - Center y coordinate
 * @param count - Number of points
 * @param radius - Radius of the polygon
 * @param rotate - Rotation of the polygon (degrees)
 * @param inset - Percent to inset odd points (<1 inset, >1 outset)
 * @param scaleX - Horizontal stretch factor
 * @param scaleY - Vertical stretch factor
 * @returns Array of points (x, y)
 */
export function polygon(options: {
  cx: number;
  cy: number;
  count: number;
  radius: number;
  rotate?: number;
  inset?: number;
  scaleX?: number;
  scaleY?: number;
}) {
  const { cx, cy, count, radius, rotate = 0, inset = 1, scaleX = 1, scaleY = 1 } = options;
  return polygonPoints(count, radius, rotate).map(({ angle, radius }, i) => {
    const scale = i % 2 == 0 ? 1 : inset;
    return {
      x: cx + radius * scale * Math.cos(angle) * scaleX,
      y: cy + radius * scale * Math.sin(angle) * scaleY,
    };
  });
}
