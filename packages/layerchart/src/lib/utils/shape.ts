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
 * @param tiltX - Tilt factor for x-coordinates (0 = no tilt, positive moves points top => down, negative moves points bottom => up)
 * @param tiltY - Tilt factor for y-coordinates (0 = no tilt, positive moves points left => right, negative moves points right => left)
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
    tiltX = 0,
    tiltY = 0,
  } = options;
  const skewXRad = degreesToRadians(skewX);
  const skewYRad = degreesToRadians(skewY);
  return polygonPoints(count, radius, rotate).map(({ angle, radius }, i) => {
    // inset
    const insetScale = i % 2 == 0 ? 1 : 1 - inset;

    // scale
    let x = radius * insetScale * Math.cos(angle) * scaleX;
    let y = radius * insetScale * Math.sin(angle) * scaleY;

    // tilt
    const normalizedY = (y + radius) / (2 * radius);
    const normalizedX = (x + radius) / (2 * radius);
    const tiltScaleX = tiltX > 0 ? 1 + tiltX * (1 - normalizedY) : 1 - tiltX * normalizedY;
    const tiltScaleY = tiltY > 0 ? 1 + tiltY * (1 - normalizedX) : 1 - tiltY * normalizedX;
    x *= tiltScaleX;
    y *= tiltScaleY;

    // skew
    const xSkewed = x + Math.tan(skewXRad) * y;
    const ySkewed = y + Math.tan(skewYRad) * x;
    return {
      x: cx + xSkewed,
      y: cy + ySkewed,
    };
  });
}
