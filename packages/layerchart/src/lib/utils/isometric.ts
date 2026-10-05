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
   * Degrees to tip the plot area away from the viewer, from `0` (seen from directly above) towards
   * `90` (edge on, held just short of it).  The default is true isometric, where both axes meet the horizontal at 30°.  `60`
   * gives the 2:1 "pixel art" projection.
   *
   * @default 54.7356 (`acos(tan(30°))`)
   */
  tilt?: number;
};

/** The tilt at which both axes meet the horizontal at 30° */
export const ISOMETRIC_TILT = (Math.acos(Math.tan(Math.PI / 6)) * 180) / Math.PI;

/** Upper bound for `tilt` — edge on, the floor collapses to a line and heights grow without bound */
const MAX_TILT = 89;

/** `tilt` in radians, kept between seen from above (`0`) and just short of edge on */
function tiltRadians(tilt: number) {
  return (Math.min(Math.max(tilt, 0), MAX_TILT) * Math.PI) / 180;
}

/**
 * The matrix drawing a `width` × `height` plot area as a floor seen at an angle — turned by
 * `rotate`, foreshortened by `tilt`, then scaled down to fit back inside the same box and centred.
 * `depth` is the tallest height anything rises off the floor (in the same pixels as the floor), so
 * the fit leaves room for it.
 *
 * `rotate: 0, tilt: 0` is the identity, so animating to and from it moves between the flat and
 * isometric charts.
 */
export function createIsometricMatrix(
  { rotate = -45, tilt = ISOMETRIC_TILT }: IsometricOptions,
  width: number,
  height: number,
  depth = 0
): AffineMatrix {
  const theta = (rotate * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const tau = tiltRadians(tilt);
  // Foreshortening across the floor — tipped away by `tilt`, it appears this much shorter
  const k = Math.cos(tau);
  // A height rises straight up the screen, shortened as the floor is
  const rise = depth * Math.sin(tau);

  const linear = { a: cos, b: k * sin, c: -sin, d: k * cos, e: 0, f: 0 };

  const corners = [
    applyMatrix(linear, { x: 0, y: 0 }),
    applyMatrix(linear, { x: width, y: 0 }),
    applyMatrix(linear, { x: width, y: height }),
    applyMatrix(linear, { x: 0, y: height }),
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.flatMap((p) => [p.y, p.y - rise]);
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

/**
 * Where raising a point by one pixel of height moves it on the flat plot.
 *
 * The layers draw the flat plot through the isometric matrix, so a mark lifts something off the
 * floor by offsetting it along this before drawing — the matrix turns that offset straight up the
 * screen, foreshortened exactly as the floor is.  `{ x: 0, y: 0 }` seen from directly above,
 * where heights don't show.
 */
export function isometricLift({ rotate = -45, tilt = ISOMETRIC_TILT }: IsometricOptions) {
  const theta = (rotate * Math.PI) / 180;
  const t = Math.tan(tiltRadians(tilt));
  return { x: -t * Math.sin(theta), y: -t * Math.cos(theta) };
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

/**
 * The matrix cancelling the turn, tilt, and fit of `m` — its linear part inverted, with no
 * translation, so applied about a point it keeps that point's spot on the floor but draws what's
 * there facing the viewer, unskewed and at its natural size.
 *
 * `null` when there's nothing to cancel, or `m` collapses the plane (ex. `tilt: 90`).
 */
export function viewportMatrix(m: AffineMatrix | null) {
  return m ? invertMatrix({ ...m, e: 0, f: 0 }) : null;
}

/**
 * Text anchors for a `viewport`-aligned label sitting off a floor edge, pointing away from the floor along
 * `outward` (a direction on the flat plot, ex. `{ x: 0, y: 1 }` below the bottom edge).
 *
 * The edge runs at an angle on screen, so a label centred under its tick (the flat default) would
 * cut back across the floor.  Anchoring by where `outward` lands on screen hangs it clear instead.
 */
export function viewportAnchors(m: AffineMatrix, outward: { x: number; y: number }) {
  const sx = m.a * outward.x + m.c * outward.y;
  const sy = m.b * outward.x + m.d * outward.y;
  const length = Math.hypot(sx, sy) || 1;
  // Within ~12° of an axis, centre on it rather than hanging off one side
  const threshold = 0.2;
  const ux = sx / length;
  const uy = sy / length;
  return {
    textAnchor: ux > threshold ? 'start' : ux < -threshold ? 'end' : 'middle',
    verticalAnchor: uy > threshold ? 'start' : uy < -threshold ? 'end' : 'middle',
  } as const;
}

export type BoxFace = {
  /** `'side'` faces stand up off the floor; `'top'` is the footprint raised to the box's height */
  kind: 'side' | 'top';
  /** Corners on the flat plot, ready for the layer to draw through the isometric matrix */
  points: Array<{ x: number; y: number }>;
  /** How much to darken the face (`0`–`1`), as if lit from the upper left */
  shade: number;
};

/**
 * The faces of a box standing on a `width` × `height` footprint at `(x, y)`, from `z0` up to `z1`
 * pixels — in the order to paint them, so nearer faces cover farther ones.
 *
 * Only the sides facing the viewer are returned (the others are hidden behind the box), then the
 * top.  `lift` is `ChartState.isometricLift`, and `m` the matrix the layer draws through, which
 * decides which way each side faces on screen.
 */
export function boxFaces(
  box: { x: number; y: number; width: number; height: number; z0: number; z1: number },
  lift: { x: number; y: number },
  m: AffineMatrix
): BoxFace[] {
  const { x, y, width, height, z0, z1 } = box;
  const at = (px: number, py: number, z: number) => ({ x: px + lift.x * z, y: py + lift.y * z });

  // Footprint corners clockwise from the top-left, each with the outward normal of the edge that
  // starts there
  const corners = [
    { x, y, normal: { x: 0, y: -1 } },
    { x: x + width, y, normal: { x: 1, y: 0 } },
    { x: x + width, y: y + height, normal: { x: 0, y: 1 } },
    { x, y: y + height, normal: { x: -1, y: 0 } },
  ];

  const sides: BoxFace[] = [];
  corners.forEach((p, i) => {
    const q = corners[(i + 1) % corners.length];
    // On screen, a side faces the viewer when its normal points down (towards the front)
    const sx = m.a * p.normal.x + m.c * p.normal.y;
    const sy = m.b * p.normal.x + m.d * p.normal.y;
    if (sy <= 1e-9) return;
    sides.push({
      kind: 'side',
      points: [at(p.x, p.y, z0), at(q.x, q.y, z0), at(q.x, q.y, z1), at(p.x, p.y, z1)],
      // Lit from the upper left: a side turned to the right sits in more shadow
      shade: sx > 1e-9 ? 0.3 : 0.15,
    });
  });

  return [...sides, { kind: 'top', points: corners.map((p) => at(p.x, p.y, z1)), shade: 0 }];
}

/** `points` as an SVG path */
export function polygonPath(points: Array<{ x: number; y: number }>) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join('') + 'Z';
}
