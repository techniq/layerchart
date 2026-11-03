import { line, type CurveFactory } from 'd3-shape';

/** Points sampled along each curved segment */
const STEPS = 12;

/**
 * A line through `points` (`[x, y]` on the floor) shaped by a d3 `curve`, as LayerChart's `Spline`
 * draws it: each point sampled along it, with where it falls between the points it was drawn
 * through (`at`: `1.5` is halfway from the second to the third), for its height, color, and row
 */
export function curvePoints(
  points: [number, number][],
  curve: CurveFactory
): { x: number; y: number; at: number }[] {
  const sampled: [number, number][] = [];
  let last: [number, number] = [0, 0];
  const push = (x: number, y: number) => {
    sampled.push([x, y]);
    last = [x, y];
  };
  line()
    .curve(curve)
    .context({
      moveTo: push,
      lineTo: push,
      closePath: () => sampled.length && push(...sampled[0]),
      bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
        const [x0, y0] = last;
        for (let i = 1; i <= STEPS; i++) {
          const t = i / STEPS;
          const u = 1 - t;
          push(
            u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x,
            u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y
          );
        }
      },
      quadraticCurveTo(cx: number, cy: number, x: number, y: number) {
        const [x0, y0] = last;
        for (let i = 1; i <= STEPS; i++) {
          const t = i / STEPS;
          const u = 1 - t;
          push(u * u * x0 + 2 * u * t * cx + t * t * x, u * u * y0 + 2 * u * t * cy + t * t * y);
        }
      },
      arc() {},
      arcTo() {},
      rect() {},
    } as unknown as CanvasRenderingContext2D)(points);

  // Where each sampled point falls between the original points: by `x` when it only increases
  // (or decreases) along the line, as a series' does, else by the distance along it
  const xs = points.map(([x]) => x);
  const monotone =
    xs.every((x, i) => i === 0 || x >= xs[i - 1]) || xs.every((x, i) => i === 0 || x <= xs[i - 1]);
  const lengths = (path: [number, number][]) => {
    const out = [0];
    for (let i = 1; i < path.length; i++)
      out.push(out[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    return out;
  };
  const along = monotone ? xs : lengths(points);
  const sampledAlong = monotone ? sampled.map(([x]) => x) : lengths(sampled);
  const scale = monotone
    ? 1
    : along[along.length - 1] / (sampledAlong[sampledAlong.length - 1] || 1);
  const increasing = along[along.length - 1] >= along[0];

  let k = 0;
  return sampled.map(([x, y], i) => {
    const v = sampledAlong[i] * scale;
    // Walk forward to the original segment this falls in
    while (k < along.length - 2 && (increasing ? v > along[k + 1] : v < along[k + 1])) k++;
    const span = along[k + 1] - along[k];
    const t = span ? Math.min(1, Math.max(0, (v - along[k]) / span)) : 0;
    return { x, y, at: k + t };
  });
}
