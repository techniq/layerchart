/**
 * A 2D affine matrix in SVG / canvas order — `x' = a·x + c·y + e`, `y' = b·x + d·y + f`.
 *
 * Plain numbers rather than `DOMMatrix`, which the server doesn't have.
 */
export type AffineMatrix = { a: number; b: number; c: number; d: number; e: number; f: number };

export type IsometricOptions = {
  /**
   * Degrees to turn the floor about its centre, clockwise like `<Text rotate>`.  The default
   * brings the origin (bottom-left) to the front corner, with `x` running up and to the right and
   * `y` up and to the left.
   *
   * @default -45
   */
  rotate?: number;

  /**
   * Degrees to tip the floor away from the viewer, from `0` (seen from directly above) towards
   * `90` (edge on, held just short of it).  The default is true isometric, where both axes meet
   * the horizontal at 30°.  `60` gives the 2:1 "pixel art" projection.
   *
   * @default 54.7356 (`acos(tan(30°))`)
   */
  tilt?: number;

  /**
   * The floor's width over its depth.  The floor keeps these proportions however the chart is
   * sized, like a real object.  `'auto'` takes them from the data: one cell each way when both
   * scales are bands (so cells are square), equal units when both are continuous (unless one runs
   * more than four times the other), and square otherwise.  A `radial` chart's floor is always
   * square, the circle it draws.
   *
   * @default 'auto'
   */
  aspect?: number | 'auto';
};

/** The tilt at which both axes meet the horizontal at 30° */
export const ISOMETRIC_TILT = (Math.acos(Math.tan(Math.PI / 6)) * 180) / Math.PI;

/** Upper bound for `tilt` — edge on, the floor collapses to a line and heights grow without bound */
const MAX_TILT = 89;

/** `tilt` in radians, kept between seen from above (`0`) and just short of edge on */
function tiltRadians(tilt: number) {
  return (Math.min(Math.max(tilt, 0), MAX_TILT) * Math.PI) / 180;
}

export type IsometricFit = {
  /**
   * The tallest height anything rises off the floor, in the floor's pixels — the fit leaves room
   * above the floor for it.
   */
  depth?: number;

  /**
   * What's drawn on the floor.  `'rect'` is the whole floor.  `'disc'` is the circle centred in it
   * — a radial chart, which keeps its width however it's turned, where fitting the floor's corners
   * would leave it smaller than it needs to be.
   *
   * @default 'rect'
   */
  footprint?: 'rect' | 'disc';
};

/** How far apart a continuous axis' ends may sit before `'auto'` gives up on equal units */
const MAX_AUTO_ASPECT = 4;

/**
 * The floor's proportions for `aspect: 'auto'`, from the `x` / `y` scales and their full domains.
 *
 * - **Band × band**: columns over rows, so each cell is square.
 * - **Continuous × continuous**: the domains' spans, so a unit runs as far across the floor as
 *   it does into it — falling back to square when one span is more than four times the other,
 *   where equal units would leave a sliver.
 * - **Anything else** (a band against values, dates against counts): square — the units don't
 *   compare.
 */
export function autoIsometricAspect(
  x: { scale: unknown; domain: unknown[] },
  y: { scale: unknown; domain: unknown[] }
) {
  const isBand = (scale: unknown) => typeof (scale as any)?.bandwidth === 'function';
  if (isBand(x.scale) && isBand(y.scale)) {
    return x.domain.length > 0 && y.domain.length > 0 ? x.domain.length / y.domain.length : 1;
  }

  const span = (domain: unknown[]) => {
    const [d0, d1] = [domain[0], domain[domain.length - 1]];
    return typeof d0 === 'number' && typeof d1 === 'number' ? Math.abs(d1 - d0) : NaN;
  };
  const ratio = span(x.domain) / span(y.domain);
  if (!Number.isFinite(ratio) || ratio <= 0) return 1;
  return ratio > MAX_AUTO_ASPECT || ratio < 1 / MAX_AUTO_ASPECT ? 1 : ratio;
}

/** The turn and tilt of the view, at its natural size */
function isometricLinear({ rotate = -45, tilt = ISOMETRIC_TILT }: IsometricOptions): AffineMatrix {
  const theta = (rotate * Math.PI) / 180;
  // Foreshortening across the floor — tipped away by `tilt`, it appears this much shorter
  const k = Math.cos(tiltRadians(tilt));
  return {
    a: Math.cos(theta),
    b: k * Math.sin(theta),
    c: -Math.sin(theta),
    d: k * Math.cos(theta),
    e: 0,
    f: 0,
  };
}

/** Where a `width` × `height` floor, and anything rising `depth` off it, lands on screen */
function floorBounds(
  options: IsometricOptions,
  width: number,
  height: number,
  { depth = 0, footprint = 'rect' }: IsometricFit
) {
  const linear = isometricLinear(options);
  // A height rises straight up the screen, shortened as the floor is
  const rise = depth * Math.sin(tiltRadians(options.tilt ?? ISOMETRIC_TILT));

  let xs: number[];
  let ys: number[];
  if (footprint === 'disc') {
    // Turning a circle leaves it be, and tilting squashes it — an ellipse `2r` wide, `2r·k` tall
    const r = Math.min(width, height) / 2;
    const k = Math.hypot(linear.b, linear.d);
    const c = applyMatrix(linear, { x: width / 2, y: height / 2 });
    xs = [c.x - r, c.x + r];
    ys = [c.y - r * k - rise, c.y + r * k];
  } else {
    const corners = [
      applyMatrix(linear, { x: 0, y: 0 }),
      applyMatrix(linear, { x: width, y: 0 }),
      applyMatrix(linear, { x: width, y: height }),
      applyMatrix(linear, { x: 0, y: height }),
    ];
    xs = corners.map((p) => p.x);
    ys = corners.flatMap((p) => [p.y, p.y - rise]);
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/**
 * The floor's size: the largest floor of the view's `aspect` that, turned and tilted, fits a
 * `width` × `height` box — with room above it for heights — and fits the box flat too.  The chart lays out on this floor
 * rather than on the box, so it keeps its proportions as the chart resizes, and draws at its
 * natural size.
 *
 * `depthAt` is how tall the tallest height is for a floor of a given size — heights usually
 * scale with the floor (the default `z` range does), so the fit settles on both together.
 */
export function fitIsometricFloor(
  options: IsometricOptions,
  width: number,
  height: number,
  {
    footprint = 'rect',
    depthAt = () => 0,
  }: {
    footprint?: IsometricFit['footprint'];
    depthAt?: (floor: { width: number; height: number }) => number;
  } = {}
) {
  const aspect =
    footprint === 'disc' || typeof options.aspect !== 'number' ? 1 : Math.max(options.aspect, 1e-6);
  // Bounds of a floor one unit deep, then scaled to fit
  const unit = floorBounds(options, aspect, 1, { footprint });
  const unitWidth = unit.x1 - unit.x0;
  const unitHeight = unit.y1 - unit.y0;
  const rise = Math.sin(tiltRadians(options.tilt ?? ISOMETRIC_TILT));

  const fit = (depth: number) => {
    const byWidth = unitWidth > 0 ? width / unitWidth : Infinity;
    const byHeight = unitHeight > 0 ? (height - depth * rise) / unitHeight : Infinity;
    const size = Math.min(byWidth, byHeight);
    return Number.isFinite(size) ? Math.max(size, 0) : Math.min(width, height);
  };

  // Heights follow the floor's size, and the floor's size makes room for the heights — so find
  // the largest floor that fits along with its own heights.  Fitting only gets harder as the floor
  // grows, which makes it a bisection.
  const fits = (size: number) => size <= fit(depthAt({ width: aspect * size, height: size }));
  let lo = 0;
  // Never larger than the plot area itself, so a floor that already fits — a circle, which turning
  // doesn't widen — keeps the size it has flat rather than growing into the room the tilt frees
  let hi = Math.min(fit(0), width / aspect, height);
  if (fits(hi)) lo = hi;
  else {
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
  }
  return { width: aspect * lo, height: lo };
}

/**
 * The matrix drawing a `floor`-sized plot area as a floor seen at an angle — turned by `rotate`,
 * foreshortened by `tilt`, and centred in a `box`, along with anything rising `depth` off it.
 * Draws at its natural size: `fitIsometricFloor` already sized the floor to fit.
 */
export function createIsometricMatrix(
  options: IsometricOptions,
  floor: { width: number; height: number },
  box: { width: number; height: number },
  fit: IsometricFit = {}
): AffineMatrix {
  const linear = isometricLinear(options);
  const { x0, x1, y0, y1 } = floorBounds(options, floor.width, floor.height, fit);
  return {
    ...linear,
    e: box.width / 2 - (x0 + x1) / 2,
    f: box.height / 2 - (y0 + y1) / 2,
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

/** `m` after `n` — the matrix applying `n` first, then `m` */
export function multiplyMatrix(m: AffineMatrix, n: AffineMatrix): AffineMatrix {
  return {
    a: m.a * n.a + m.c * n.b,
    b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d,
    d: m.b * n.c + m.d * n.d,
    e: m.a * n.e + m.c * n.f + m.e,
    f: m.b * n.e + m.d * n.f + m.f,
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
