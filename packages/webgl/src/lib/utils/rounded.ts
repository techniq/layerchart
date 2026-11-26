import { Shape } from 'three';

/** Which corners of a bar or rect to round, as the core `Bar` takes them */
export type Rounded =
  | 'all'
  | 'none'
  | 'edge'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Corner radii `[top-left, top-right, bottom-right, bottom-left]` for `rounded`, as the core
 * `Bar`'s (on the screen: top is up the plot)
 */
export function cornerRadii(
  rounded: Exclude<Rounded, 'edge'>,
  radius: number
): [number, number, number, number] {
  const has = (...names: string[]) => names.includes(rounded);
  return [
    has('all', 'top', 'left', 'top-left') ? radius : 0,
    has('all', 'top', 'right', 'top-right') ? radius : 0,
    has('all', 'bottom', 'right', 'bottom-right') ? radius : 0,
    has('all', 'bottom', 'left', 'bottom-left') ? radius : 0,
  ];
}

/** The circle's control-point distance for a quarter turn as a cubic curve */
const KAPPA = 0.5523;

/**
 * A rectangle at `(x, y)` (its top-left corner, y down the plot) with rounded corners, as a
 * three.js shape (each radius no more than half its shorter side, as SVG's)
 */
export function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  [tl, tr, br, bl]: [number, number, number, number]
): Shape {
  const most = Math.min(width, height) / 2;
  const [a, b, c, d] = [tl, tr, br, bl].map((r) => Math.max(0, Math.min(r, most)));
  const shape = new Shape();
  const right = x + width;
  const bottom = y + height;
  shape.moveTo(x + a, y);
  shape.lineTo(right - b, y);
  if (b) shape.bezierCurveTo(right - b + b * KAPPA, y, right, y + b - b * KAPPA, right, y + b);
  shape.lineTo(right, bottom - c);
  if (c) {
    shape.bezierCurveTo(
      right,
      bottom - c + c * KAPPA,
      right - c + c * KAPPA,
      bottom,
      right - c,
      bottom
    );
  }
  shape.lineTo(x + d, bottom);
  if (d) shape.bezierCurveTo(x + d - d * KAPPA, bottom, x, bottom - d + d * KAPPA, x, bottom - d);
  shape.lineTo(x, y + a);
  if (a) shape.bezierCurveTo(x, y + a - a * KAPPA, x + a - a * KAPPA, y, x + a, y);
  return shape;
}
