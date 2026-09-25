/**
 * A 2D affine matrix in SVG / canvas order — `x' = a·x + c·y + e`, `y' = b·x + d·y + f`.
 *
 * Plain numbers rather than `DOMMatrix`, which the server doesn't have.
 */
export type AffineMatrix = { a: number; b: number; c: number; d: number; e: number; f: number };

export type IsometricOptions = {
  /**
   * Degrees to turn the plot area about its centre, clockwise like `<Text rotate>`.  The default
   * brings the origin (bottom-left) to the front corner, with `x` running up and to the right and
   * `y` up and to the left.
   *
   * @default -45
   */
  rotate?: number;

  /**
   * Degrees to tip the plot area away from the viewer, from `0` (seen from directly above) to `90`
   * (edge on).  The default is true isometric, where both axes meet the horizontal at 30°.  `60`
   * gives the 2:1 "pixel art" projection.
   *
   * @default 54.7356 (`acos(tan(30°))`)
   */
  tilt?: number;
};

/** The tilt at which both axes meet the horizontal at 30° */
export const ISOMETRIC_TILT = (Math.acos(Math.tan(Math.PI / 6)) * 180) / Math.PI;

/**
 * The matrix drawing a `width` × `height` plot area as a floor seen at an angle — turned by
 * `rotate`, foreshortened by `tilt`, then scaled down to fit back inside the same box and centred.
 *
 * `rotate: 0, tilt: 0` is the identity, so animating to and from it moves between the flat and
 * isometric charts.
 */
export function createIsometricMatrix(
  { rotate = -45, tilt = ISOMETRIC_TILT }: IsometricOptions,
  width: number,
  height: number
): AffineMatrix {
  const theta = (rotate * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  // Foreshortening of the depth axis — a floor tipped away by `tilt` appears this much shorter
  const k = Math.cos((tilt * Math.PI) / 180);

  const linear = { a: cos, b: k * sin, c: -sin, d: k * cos, e: 0, f: 0 };

  const corners = [
    applyMatrix(linear, { x: 0, y: 0 }),
    applyMatrix(linear, { x: width, y: 0 }),
    applyMatrix(linear, { x: width, y: height }),
    applyMatrix(linear, { x: 0, y: height }),
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];

  // Seen edge on, the floor has no height — fit it by its width alone
  const fitX = x1 > x0 ? width / (x1 - x0) : Infinity;
  const fitY = y1 > y0 ? height / (y1 - y0) : Infinity;
  const fit = Math.min(fitX, fitY);
  const scale = Number.isFinite(fit) ? fit : 1;

  return {
    a: scale * linear.a,
    b: scale * linear.b,
    c: scale * linear.c,
    d: scale * linear.d,
    e: width / 2 - (scale * (x0 + x1)) / 2,
    f: height / 2 - (scale * (y0 + y1)) / 2,
  };
}

export function applyMatrix(m: AffineMatrix, point: { x: number; y: number }) {
  return {
    x: m.a * point.x + m.c * point.y + m.e,
    y: m.b * point.x + m.d * point.y + m.f,
  };
}

/** The matrix undoing `m`, or `null` when it collapses the plane (ex. `tilt: 90`) */
export function invertMatrix(m: AffineMatrix): AffineMatrix | null {
  const det = m.a * m.d - m.b * m.c;
  if (det === 0) return null;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
}

/** `m` as an SVG / CSS `matrix()` transform function */
export function matrixToString(m: AffineMatrix) {
  return `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`;
}
