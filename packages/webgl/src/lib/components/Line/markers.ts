import { line, type CurveFactory } from 'd3-shape';
import type { LineProps as CoreLineProps } from 'layerchart';
import { flattenPath } from '../../utils/path.js';

/**
 * A marker, as the core marks take one: a type (`arrow`, `triangle`, `line`, `circle`,
 * `circle-stroke`, `dot`, `square`, `square-stroke`), or the core `Marker`'s props.  A snippet
 * (custom SVG) can't be drawn in a scene, so draws nothing.
 */
export type MarkerOptions = NonNullable<CoreLineProps['marker']>;

/** A line to mark: its points (`[x, height, y]` each), color, and vertices for `markerMid` */
export type MarkedLine = {
  points: ArrayLike<number>;
  color: string;
  /** The points between its first and last a mid marker goes on (ex. a path's corners) */
  mids?: number[];
};

/**
 * Where SVG path data's commands end, as indices into `flattenPath(d)`'s points, but for its
 * first and last: the vertices an SVG path draws its `marker-mid` on, rather than every point
 * its curves are drawn in
 */
export function pathVertices(d: string): number[] {
  const fine = flattenPath(d);
  // A piece per curve, so just where each command ends
  const coarse = flattenPath(d, 1);
  const vertices: number[] = [];
  let from = 0;
  for (const [x, y] of coarse) {
    let i = from;
    while (i < fine.length && (fine[i][0] !== x || fine[i][1] !== y)) i++;
    if (i < fine.length) {
      vertices.push(i);
      from = i + 1;
    }
  }
  return vertices.slice(1, -1);
}

/**
 * Where the commands of a d3 `curve` through `points` end, as indices into `sampled` (the curve's
 * points `[x, height, y]` each, as `curvePoints` samples it): the vertices an SVG path of it draws
 * its `marker-mid` on, first and last included
 */
export function curveVertices(
  points: [number, number][],
  curve: CurveFactory,
  sampled: ArrayLike<number>
): number[] {
  const ends: [number, number][] = [];
  let start: [number, number] = [0, 0];
  line()
    .curve(curve)
    .context({
      moveTo: (x: number, y: number) => ends.push((start = [x, y])),
      lineTo: (x: number, y: number) => ends.push([x, y]),
      bezierCurveTo: (_a: number, _b: number, _c: number, _d: number, x: number, y: number) =>
        ends.push([x, y]),
      quadraticCurveTo: (_a: number, _b: number, x: number, y: number) => ends.push([x, y]),
      closePath: () => ends.push(start),
      arc() {},
      arcTo() {},
      rect() {},
    } as unknown as CanvasRenderingContext2D)(points);
  // Each command's end is one of the points sampled, exactly (a curve's last step lands on it)
  const vertices: number[] = [];
  const count = Math.floor(sampled.length / 3);
  let from = 0;
  for (const [x, y] of ends) {
    let i = from;
    while (
      i < count &&
      (Math.abs(sampled[3 * i] - x) > 1e-6 || Math.abs(sampled[3 * i + 2] - y) > 1e-6)
    )
      i++;
    if (i < count) {
      vertices.push(i);
      from = i + 1;
    }
  }
  return vertices;
}
