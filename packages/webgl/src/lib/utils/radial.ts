import { pointRadial } from 'd3-shape';

export { pointRadial };

/**
 * A circle about the center, as line segments (`[x, height, y, x, height, y, ...]`, each a pair of
 * points) for `createSegments`: ex. a `radial` chart's grid circle at a `y` tick.  In enough pieces
 * to read as round at its size.
 */
export function circleSegments(radius: number, up = 0): number[] {
  if (!(radius > 0)) return [];
  const pieces = Math.max(48, Math.min(360, Math.ceil((2 * Math.PI * radius) / 3)));
  const segments: number[] = [];
  for (let i = 0; i < pieces; i++) {
    const [x1, y1] = pointRadial((i / pieces) * 2 * Math.PI, radius);
    const [x2, y2] = pointRadial(((i + 1) / pieces) * 2 * Math.PI, radius);
    segments.push(x1, up, y1, x2, up, y2);
  }
  return segments;
}

/**
 * A closed polygon through points at each angle, `radius` out (ex. a `radial` chart's grid line
 * through its `x` ticks, as a linear closed curve draws it), as line segments for `createSegments`
 */
export function polygonSegments(angles: number[], radius: number, up = 0): number[] {
  const segments: number[] = [];
  if (angles.length < 2) return segments;
  for (let i = 0; i < angles.length; i++) {
    const [x1, y1] = pointRadial(angles[i], radius);
    const [x2, y2] = pointRadial(angles[(i + 1) % angles.length], radius);
    segments.push(x1, up, y1, x2, up, y2);
  }
  return segments;
}

/**
 * Where `x` / `y` values sit on a `radial` chart, about its center, as the core marks place them:
 * `x` through its scale to an angle (clockwise from 12 o'clock), `y` through its own to a radius
 * (at the middle of a band)
 */
export function radialPosition(
  ctx: { xScale: any; yScale: any },
  xValue: unknown,
  yValue: unknown
): [number, number] {
  const yScale = ctx.yScale;
  const band = typeof yScale.bandwidth === 'function' ? yScale.bandwidth() / 2 : 0;
  return pointRadial(Number(ctx.xScale(xValue)), Number(yScale(yValue)) + band);
}

/** A point about a `radial` chart's center moved along its angle to `radius` out */
export function atRadius(x: number, y: number, radius: number): [number, number] {
  const length = Math.hypot(x, y);
  return length > 0 ? [(x / length) * radius, (y / length) * radius] : [0, 0];
}
