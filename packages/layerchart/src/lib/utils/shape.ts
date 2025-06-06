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
 * @param skewX - Skew angle in degrees along the X axis
 * @param skewY - Skew angle in degrees along the Y axis
 * @param tiltX - Tilt factor for x-coordinates (1 = no tilt, <1 = tilt left, >1 = tilt right)
 * @param tiltY - Tilt factor for y-coordinates (1 = no tilt, <1 = tilt up, >1 = tilt down)
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
  skewX?: number;
  skewY?: number;
  tiltX?: number;
  tiltY?: number;
}) {
  const {
    cx,
    cy,
    count,
    radius,
    rotate = 0,
    inset = 1,
    scaleX = 1,
    scaleY = 1,
    skewX = 0,
    skewY = 0,
    tiltX = 1,
    tiltY = 1,
  } = options;
  const skewXRad = degreesToRadians(skewX);
  const skewYRad = degreesToRadians(skewY);
  return polygonPoints(count, radius, rotate).map(({ angle, radius }, i) => {
    const scale = i % 2 == 0 ? 1 : 1 - inset;
    let x = radius * scale * Math.cos(angle) * scaleX;
    let y = radius * scale * Math.sin(angle) * scaleY;

    // Apply tilt effects
    const normalizedY = (y + radius) / (2 * radius); // 0 to 1 from bottom to top
    const normalizedX = (x + radius) / (2 * radius); // 0 to 1 from left to right
    const tiltScaleX = 1 + (tiltX - 1) * normalizedY;
    const tiltScaleY = 1 + (tiltY - 1) * normalizedX;
    x *= tiltScaleX;
    y *= tiltScaleY;

    const xSkewed = x + Math.tan(skewXRad) * y;
    const ySkewed = y + Math.tan(skewYRad) * x;
    return {
      x: cx + xSkewed,
      y: cy + ySkewed,
    };
  });
}
