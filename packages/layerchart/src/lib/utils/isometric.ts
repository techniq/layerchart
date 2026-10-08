import { untrack } from 'svelte';
import type { MotionProp } from './motion.svelte.js';
import { pathRings } from './path.js';

/**
 * A 2D affine matrix in SVG / canvas order: `x' = a·x + c·y + e`, `y' = b·x + d·y + f`.  Plain
 * numbers rather than `DOMMatrix`, which the server doesn't have.
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
   * The floor's width over its depth, kept however the chart is sized.  `'auto'` makes band cells
   * square, gives continuous axes equal units (unless one spans over 4× the other), and is square
   * otherwise.  A `radial` chart's floor is always square.
   *
   * @default 'auto'
   */
  aspect?: number | 'auto';

  /** Ease the view to new `rotate` / `tilt` values, ex. between flat (`tilt: 0`) and isometric */
  motion?: MotionProp;
};

/** The tilt at which both axes meet the horizontal at 30° */
export const ISOMETRIC_TILT = (Math.acos(Math.tan(Math.PI / 6)) * 180) / Math.PI;

/** Upper bound for `tilt`: edge on, the floor collapses to a line */
const MAX_TILT = 89;

/** `tilt` in radians, kept between seen from above (`0`) and just short of edge on */
function tiltRadians(tilt: number) {
  return (Math.min(Math.max(tilt, 0), MAX_TILT) * Math.PI) / 180;
}

export type IsometricFit = {
  /** The tallest height anything rises off the floor, in pixels, for the fit to leave room for */
  depth?: number;

  /**
   * What's drawn on the floor: the whole `'rect'`, or the `'disc'` centred in it (a radial chart,
   * whose width doesn't change as it turns).
   *
   * @default 'rect'
   */
  footprint?: 'rect' | 'disc';
};

/** How far apart a continuous axis' ends may sit before `'auto'` gives up on equal units */
const MAX_AUTO_ASPECT = 4;

/**
 * The floor's proportions for `aspect: 'auto'`: columns over rows for two band scales, the
 * domains' spans for two continuous ones (square when that would leave a sliver), else square.
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
 * The largest floor of the view's `aspect` that, turned and tilted with room above it for heights,
 * fits a `width` × `height` box (and fits it flat too).
 *
 * `depthAt` gives the tallest height for a floor size, since heights usually scale with the floor.
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

  // Heights depend on the floor's size and vice versa; fitting only gets harder as the floor grows,
  // so bisect for the largest that fits
  const fits = (size: number) => size <= fit(depthAt({ width: aspect * size, height: size }));
  let lo = 0;
  // Never larger than the plot area, so a circle (which turning doesn't widen) keeps its flat size
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
 * The matrix drawing a `floor`-sized plot area turned by `rotate`, foreshortened by `tilt`, and
 * centred in `box` with anything rising `depth` off it.
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
 * Where raising a point by one pixel of height moves it on the flat plot.  Drawn through the
 * isometric matrix, this offset points straight up the screen.  `{ x: 0, y: 0 }` from directly
 * above.
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
 * `m`'s linear part inverted: applied about a point, it draws what's there facing the viewer.
 * `null` when there's nothing to cancel or `m` collapses the plane.
 */
export function viewportMatrix(m: AffineMatrix | null) {
  return m ? invertMatrix({ ...m, e: 0, f: 0 }) : null;
}

/**
 * Text anchors for a `viewport` label off a floor edge, by where `outward` (a direction on the flat
 * plot, ex. `{ x: 0, y: 1 }` below the bottom edge) lands on screen, so it hangs clear of the floor.
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
 * The visible faces of a box on a `width` × `height` footprint at `(x, y)`, from `z0` to `z1`
 * pixels, in paint order: the sides facing the viewer, then the top.
 */
export function boxFaces(
  box: { x: number; y: number; width: number; height: number; z0: number; z1: number },
  lift: { x: number; y: number },
  m: AffineMatrix
): BoxFace[] {
  const { x, y, width, height, z0, z1 } = box;
  const at = (px: number, py: number, z: number) => ({ x: px + lift.x * z, y: py + lift.y * z });

  const sides: BoxFace[] = [];
  for (const edge of footprintEdges(x, y, width, height)) {
    const { from: p, to: q } = edge;
    // A rect with no depth (a wall) has no sides across it
    if (p.x === q.x && p.y === q.y) continue;
    const facing = edgeFacing(edge, m);
    if (!facing.front) continue;
    sides.push({
      kind: 'side',
      points: [at(p.x, p.y, z0), at(q.x, q.y, z0), at(q.x, q.y, z1), at(p.x, p.y, z1)],
      // Lit from the upper left: a side turned to the right sits in more shadow
      shade: facing.right ? 0.3 : 0.15,
    });
  }

  // ...nor a top
  if (!width || !height) return sides;
  const top = footprintEdges(x, y, width, height).map((e) => at(e.from.x, e.from.y, z1));
  return [...sides, { kind: 'top', points: top, shade: 0 }];
}

type FootprintEdge = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** The direction the edge's side faces, away from the footprint */
  normal: { x: number; y: number };
  /** Which axis the edge runs along */
  axis: 'x' | 'y';
};

/** A rectangle's edges, clockwise from its top-left corner */
function footprintEdges(x: number, y: number, width: number, height: number): FootprintEdge[] {
  const tl = { x, y };
  const tr = { x: x + width, y };
  const br = { x: x + width, y: y + height };
  const bl = { x, y: y + height };
  return [
    { from: tl, to: tr, normal: { x: 0, y: -1 }, axis: 'x' },
    { from: tr, to: br, normal: { x: 1, y: 0 }, axis: 'y' },
    { from: br, to: bl, normal: { x: 0, y: 1 }, axis: 'x' },
    { from: bl, to: tl, normal: { x: -1, y: 0 }, axis: 'y' },
  ];
}

/** Which way an edge's side faces on screen — towards the viewer (`front`), and to the right */
function edgeFacing(edge: FootprintEdge, m: AffineMatrix) {
  const sx = m.a * edge.normal.x + m.c * edge.normal.y;
  const sy = m.b * edge.normal.x + m.d * edge.normal.y;
  return { front: sy > 1e-9, right: sx > 1e-9 };
}

/** The floor's far edges for the view `m`, where the back walls stand */
export function backWalls(floor: { width: number; height: number }, m: AffineMatrix) {
  return footprintEdges(0, 0, floor.width, floor.height)
    .filter((edge) => !edgeFacing(edge, m).front && !isEdgeOn(edge, m))
    .map(({ from, to, axis }) => ({ from, to, axis }));
}

/** An edge seen exactly edge on — its side neither faces the viewer nor turns away */
function isEdgeOn(edge: FootprintEdge, m: AffineMatrix) {
  return Math.abs(m.b * edge.normal.x + m.d * edge.normal.y) <= 1e-9;
}

/** The floor corner furthest to one side of the screen — where the back walls end */
export function floorCorner(
  floor: { width: number; height: number },
  m: AffineMatrix,
  side: 'left' | 'right'
) {
  const corners = footprintEdges(0, 0, floor.width, floor.height).map((e) => e.from);
  const screenX = (p: { x: number; y: number }) => m.a * p.x + m.c * p.y;
  return corners.reduce((best, p) =>
    side === 'left'
      ? screenX(p) < screenX(best)
        ? p
        : best
      : screenX(p) > screenX(best)
        ? p
        : best
  );
}

/** A screen-space offset restated on the floor, or `null` when `m` collapses the plane */
export function screenToFloor(m: AffineMatrix, offset: { x: number; y: number }) {
  const inverse = viewportMatrix(m);
  return inverse ? applyMatrix(inverse, offset) : null;
}

/**
 * SVG path data for a circle of radius `r` about `c` on the plane spanned by `u` and `v` (ex.
 * `(1, 0)` and `(0, 1)` for the floor), on the flat plot: the ellipse it is on screen.
 */
export function planeCircle(
  c: { x: number; y: number },
  u: { x: number; y: number },
  v: { x: number; y: number },
  r: number
) {
  // The ellipse is the image of the unit circle under [u v]; its axes come from (u v)(u v)ᵀ
  const a = u.x * u.x + v.x * v.x;
  const b = u.x * u.y + v.x * v.y;
  const d = u.y * u.y + v.y * v.y;
  const mean = (a + d) / 2;
  const spread = Math.hypot((a - d) / 2, b);
  const rx = r * Math.sqrt(Math.max(mean + spread, 0));
  const ry = r * Math.sqrt(Math.max(mean - spread, 0));
  const angle = Math.atan2(2 * b, a - d) / 2;
  const rotate = (angle * 180) / Math.PI;
  const dx = rx * Math.cos(angle);
  const dy = rx * Math.sin(angle);
  const arc = (sign: number) => `A${rx},${ry},${rotate},0,1,${c.x + sign * dx},${c.y + sign * dy}`;
  return `M${c.x + dx},${c.y + dy}${arc(-1)}${arc(1)}Z`;
}

/** A rectangle on the floor, by its corners — the shape `d3-hierarchy` lays nodes out in */
export type Footprint = { x0: number; y0: number; x1: number; y1: number };

/**
 * Whether a box on `a` must be painted before one on `b`: a containing footprint first (the tier
 * below), otherwise the one farther back along the axis they're apart on.
 */
function paintsBefore(a: Footprint, b: Footprint, m: AffineMatrix) {
  const contains = (p: Footprint, q: Footprint) =>
    p.x0 <= q.x0 && q.x1 <= p.x1 && p.y0 <= q.y0 && q.y1 <= p.y1;
  if (contains(a, b)) return true;
  if (contains(b, a)) return false;

  // `> 0` when `a` is farther back along the axis — screen depth grows by `m.b` per pixel of `x`
  // and `m.d` per pixel of `y`
  const apart = (a0: number, a1: number, b0: number, b1: number) =>
    a1 <= b0 ? 1 : b1 <= a0 ? -1 : 0;
  const alongX = apart(a.x0, a.x1, b.x0, b.x1) * Math.sign(m.b);
  const alongY = apart(a.y0, a.y1, b.y0, b.y1) * Math.sign(m.d);
  if (alongX && alongY) return alongX > 0 && alongY > 0;
  return (alongX || alongY) > 0;
}

/**
 * `items` in back-to-front paint order for boxes standing on their footprints.  Unlike sorting by
 * depth, exact for footprints of any size; quadratic, so meant for one node's children.
 */
export function paintOrder<T extends Footprint>(items: readonly T[], m: AffineMatrix): T[] {
  const n = items.length;
  const later: number[][] = Array.from({ length: n }, () => []);
  const waiting = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (paintsBefore(items[i], items[j], m)) {
        later[i].push(j);
        waiting[j]++;
      } else if (paintsBefore(items[j], items[i], m)) {
        later[j].push(i);
        waiting[i]++;
      }
    }
  }

  // Free to go in any order, boxes go farthest first — a steady order as the view turns
  const depth = (f: Footprint) => m.b * (f.x0 + f.x1) + m.d * (f.y0 + f.y1);
  const candidates = items.map((_, i) => i).sort((i, j) => depth(items[i]) - depth(items[j]));
  const order: T[] = [];
  const done = new Array<boolean>(n).fill(false);
  while (order.length < n) {
    // Overlapping footprints can't be ordered; take the farthest left rather than stall
    const next =
      candidates.find((i) => !done[i] && waiting[i] === 0) ?? candidates.find((i) => !done[i])!;
    done[next] = true;
    order.push(items[next]);
    for (const j of later[next]) waiting[j]--;
  }
  return order;
}

/** A turn sharper than this, in degrees, between edges of an outline is a corner between faces */
const FACE_CORNER = 30;

/** Faces shorter than this, in pixels, join the one before */
const MIN_FACE = 6;

/** Whether `point` lies inside `ring` (even-odd) */
function insideRing([px, py]: [number, number], ring: Array<[number, number]>) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** A face of a stood-up shape's sides, and how much to darken it (`0`–`1`) */
export type ExtrudedSide = { d: string; opacity: number };

/**
 * The visible sides of `rings` stood up from `z0` to `z1` pixels.  Holes are rings inside another,
 * whatever their winding.
 *
 * `sides` is one path for all of them.  `shades` splits them into faces at the outline's corners,
 * each darkened by which way it faces (`0.15` left to `0.3` right, like a box's sides), so a curve
 * stays one face and a jagged outline's slivers join their neighbours.
 */
export function extrudeRings(
  rings: Array<Array<[number, number]>>,
  z0: number,
  z1: number,
  lift: { x: number; y: number },
  m: AffineMatrix
) {
  const at = ([x, y]: [number, number], z: number) => `${x + lift.x * z},${y + lift.y * z}`;
  const corner = Math.cos((FACE_CORNER * Math.PI) / 180);
  let sides = '';
  const shades: ExtrudedSide[] = [];

  for (const ring of rings) {
    const n = ring.length;
    if (n < 2) continue;
    // Inside an odd number of other rings, it's a hole — its sides face into it
    const depth = rings.filter((other) => other !== ring && insideRing(ring[0], other)).length;
    let area = 0;
    for (let k = 0; k < n; k++) {
      const [x0, y0] = ring[k];
      const [x1, y1] = ring[(k + 1) % n];
      area += x0 * y1 - x1 * y0;
    }
    const sign = (area > 0 ? 1 : -1) * (depth % 2 ? -1 : 1);

    /** How the outward normal from `p` to `q` faces on screen: towards the viewer, and across */
    const facingOf = (p: [number, number], q: [number, number]) => {
      const nx = sign * (q[1] - p[1]);
      const ny = sign * -(q[0] - p[0]);
      return { toward: m.b * nx + m.d * ny, across: m.a * nx + m.c * ny };
    };
    const front = ring.map((p, k) => facingOf(p, ring[(k + 1) % n]).toward > 0);

    /** A face through a run's `vertices`, as a shape and its shade */
    const face = (vertices: number[]) => {
      const bottom = vertices.map((k) => at(ring[k], z0));
      const top = vertices.map((k) => at(ring[k], z1)).reverse();
      const facing = facingOf(ring[vertices[0]], ring[vertices[vertices.length - 1]]);
      const t = facing.across / (Math.hypot(facing.across, facing.toward) || 1);
      return { d: `M${bottom.join('L')}L${top.join('L')}Z`, opacity: 0.15 + (0.15 * (t + 1)) / 2 };
    };

    // Each run of facing edges, starting where one begins (or anywhere, when they all face)
    const begin = front.findIndex((f, k) => f && !front[(k - 1 + n) % n]);
    if (begin < 0 && !front[0]) continue;
    const first = begin < 0 ? 0 : begin;
    for (let step = 0; step < n; ) {
      const k0 = (first + step) % n;
      if (!front[k0]) {
        step++;
        continue;
      }
      // The run's vertices, from the start of its first edge to the end of its last
      const vertices: number[] = [k0];
      while (step < n && front[(first + step) % n]) {
        vertices.push((first + step + 1) % n);
        step++;
      }
      sides += face(vertices).d;

      // Split at the corners into faces, joining any too short to stand alone onto the one before
      const faces: number[][] = [[vertices[0]]];
      let length = 0;
      for (let i = 1; i < vertices.length; i++) {
        const [px, py] = ring[vertices[i - 1]];
        const [qx, qy] = ring[vertices[i]];
        faces[faces.length - 1].push(vertices[i]);
        length += Math.hypot(qx - px, qy - py);
        if (i === vertices.length - 1) break;
        const [rx, ry] = ring[vertices[i + 1]];
        const ax = qx - px;
        const ay = qy - py;
        const bx = rx - qx;
        const by = ry - qy;
        const turn = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1);
        if (turn < corner && length >= MIN_FACE) {
          faces.push([vertices[i]]);
          length = 0;
        }
      }
      for (const vertices of faces) if (vertices.length > 1) shades.push(face(vertices));
    }
  }

  return { sides, shades };
}

/**
 * A path stood up from `z0` to `z1` pixels: the offset to draw its top at, and its sides (none
 * when unfilled).
 */
export function extrudePath(
  d: string,
  [z0, z1]: [number, number],
  lift: { x: number; y: number },
  m: AffineMatrix,
  filled = true
) {
  const shift = { x: lift.x * z1, y: lift.y * z1 };
  if (!filled || z1 <= z0) return { shift, sides: '', shades: [] as ExtrudedSide[] };
  return { shift, ...extrudeRings(pathRings(d), z0, z1, lift, m) };
}

/** `points` as an SVG path */
export function polygonPath(points: Array<{ x: number; y: number }>) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join('') + 'Z';
}

/**
 * A check reporting whether `getLift` has changed since it last ran: a path built through it
 * then moved only because the view turned, and should follow at once rather than ease.
 */
export function liftChanged(getLift: () => { x: number; y: number } | null) {
  let last: { x: number; y: number } | null | undefined;
  return () => {
    const lift = untrack(getLift);
    const changed = last !== undefined && (lift?.x !== last?.x || lift?.y !== last?.y);
    last = lift;
    return changed;
  };
}

/**
 * How near the viewer a pie slice comes on an isometric floor, to paint slices back to front: the
 * depth of its nearest point on the rim, which is the very front if it spans that.  Not its middle,
 * which for a wide slice reaching round the front can be farther back than a narrow neighbour's.
 * Angles run clockwise from 12 o'clock, as `d3-shape` lays them out.
 */
export function sectorDepth(startAngle: number, endAngle: number, m: AffineMatrix) {
  // On a unit rim, depth at `angle` is `m.b·sin − m.d·cos`: greatest at `front`
  const depth = (angle: number) => m.b * Math.sin(angle) - m.d * Math.cos(angle);
  const front = Math.atan2(m.b, -m.d);
  const [a0, a1] = startAngle <= endAngle ? [startAngle, endAngle] : [endAngle, startAngle];
  const tau = 2 * Math.PI;
  const past = (((front - a0) % tau) + tau) % tau;
  if (past <= a1 - a0) return Math.hypot(m.b, m.d);
  return Math.max(depth(a0), depth(a1));
}
