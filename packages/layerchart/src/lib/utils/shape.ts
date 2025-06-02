import { range } from 'd3-array';
import { degreesToRadians } from './math.js';

/** Get points to create a polygon with given number of points and radius
 *
 * @param count - Number of points
 * @param radius - Radius of the polygon
 * @returns Array of points (angle, radius)
 */
export function polygonPoints(count: number, radius: number) {
  const angle = 360 / count;
  const offsetDeg = 90 - (180 - angle) / 2;
  const offset = degreesToRadians(offsetDeg);

  return range(count).map((index) => {
    return {
      angle: offset + degreesToRadians(angle * index),
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
 * @returns Array of points (x, y)
 */
export function polygon(cx: number, cy: number, count: number, radius: number) {
  return polygonPoints(count, radius).map(({ angle, radius }) => {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

/** Create star using polygon points and adjusting odd points by `percent` (<1 inset, >1 outset)
 *
 * @param cx - Center x coordinate
 * @param cy - Center y coordinate
 * @param count - Number of points
 * @param radius - Radius of the polygon
 * @param percent - Percent to inset odd points
 * @returns Array of points (x, y)
 */
export function star(cx: number, cy: number, count: number, radius: number, percent: number) {
  return polygonPoints(count, radius).map(({ angle, radius }, i) => {
    const scale = i % 2 == 0 ? 1 : percent;
    return {
      x: cx + radius * scale * Math.cos(angle),
      y: cy + radius * scale * Math.sin(angle),
    };
  });
}
