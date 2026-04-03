/**
 * Trail path utilities for variable-width lines.
 *
 * Round cap (capsule) approach adapted from Vega's trail mark.
 * Copyright (c) 2015-2023, University of Washington Interactive Data Lab.
 * BSD 3-Clause License: https://github.com/vega/vega/blob/main/LICENSE
 *
 * Butt cap (polygon offset) and curve resampling via fake context
 * adapted from SveltePlot's trail mark.
 * Copyright 2024-2026, Gregor Aisch.
 * ISC License: https://github.com/svelteplot/svelteplot/blob/main/LICENSE
 */

import type { CurveFactory, CurveFactoryLineOnly } from 'd3-shape';

export type TrailPoint = { x: number; y: number; r: number };

export type TrailCap = 'round' | 'butt';

export type TrailPathOptions = {
  /** Curve interpolation factory from d3-shape */
  curve?: CurveFactory | CurveFactoryLineOnly;
  /** Cap style for trail endpoints. @default 'round' */
  cap?: TrailCap;
  /** Tension parameter for applicable curve factories (0–1) */
  tension?: number;
  /** Samples per segment for curve interpolation. Auto-estimated when omitted. */
  resolution?: number;
};

/**
 * Computes a filled SVG path for a trail with variable width.
 *
 * Supports optional curve interpolation (via d3-shape curve factories)
 * and two cap styles: 'round' (capsule-based) and 'butt' (polygon offset).
 */
export function computeTrailPath(
  points: TrailPoint[],
  options: TrailPathOptions = {}
): string {
  if (points.length === 0) return '';

  const { curve, cap = 'round', tension, resolution } = options;

  let drawPoints = points;

  // Resample through curve if provided
  if (curve) {
    drawPoints = resampleWithCurve(points, curve, tension, resolution);
  }

  if (drawPoints.length === 0) return '';

  if (drawPoints.length === 1) {
    const { x, y, r } = drawPoints[0];
    if (cap === 'butt') return '';
    return `M${x - r},${y}A${r},${r},0,1,1,${x + r},${y}A${r},${r},0,1,1,${x - r},${y}Z`;
  }

  return cap === 'butt' ? trailPathButt(drawPoints) : trailPathRound(drawPoints);
}

// ---------------------------------------------------------------------------
// Round caps (capsule-based, original approach)
// ---------------------------------------------------------------------------

function trailPathRound(points: TrailPoint[]): string {
  let d = '';

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const r1 = p1.r;
    const r2 = p2.r;

    let nx = p1.y - p2.y;
    let ny = p2.x - p1.x;
    const len = Math.hypot(nx, ny);

    if (len < 1e-6) continue;

    nx /= len;
    ny /= len;

    const x1L = p1.x - nx * r1, y1L = p1.y - ny * r1;
    const x1R = p1.x + nx * r1, y1R = p1.y + ny * r1;
    const x2L = p2.x - nx * r2, y2L = p2.y - ny * r2;
    const x2R = p2.x + nx * r2, y2R = p2.y + ny * r2;

    d += `M${x1L},${y1L}`;
    d += `L${x2L},${y2L}`;
    d += `A${r2},${r2},0,0,1,${x2R},${y2R}`;
    d += `L${x1R},${y1R}`;
    d += `A${r1},${r1},0,0,1,${x1L},${y1L}`;
    d += 'Z';
  }

  return d;
}

// ---------------------------------------------------------------------------
// Butt caps (polygon offset using angle bisector normals)
// ---------------------------------------------------------------------------

function trailPathButt(points: TrailPoint[]): string {
  const n = points.length;
  if (n < 2) return '';

  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];

  const normalize = (x: number, y: number): [number, number] => {
    const len = Math.hypot(x, y);
    return len === 0 ? [0, 0] : [x / len, y / len];
  };

  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const r = curr.r;
    const hasPrev = i > 0;
    const hasNext = i < n - 1;

    const prev = hasPrev ? points[i - 1] : curr;
    const next = hasNext ? points[i + 1] : curr;

    const dirPrev = hasPrev
      ? normalize(curr.x - prev.x, curr.y - prev.y)
      : normalize(next.x - curr.x, next.y - curr.y);
    const dirNext = hasNext
      ? normalize(next.x - curr.x, next.y - curr.y)
      : dirPrev;

    // Perpendicular normals (rotate 90° CCW)
    const normPrev: [number, number] = [-dirPrev[1], dirPrev[0]];
    const normNext: [number, number] = [-dirNext[1], dirNext[0]];

    // Average normal (bisector direction)
    let nx = normPrev[0] + normNext[0];
    let ny = normPrev[1] + normNext[1];
    const nLen = Math.hypot(nx, ny);

    if (nLen < 1e-6) {
      nx = normPrev[0];
      ny = normPrev[1];
    } else {
      nx /= nLen;
      ny /= nLen;
    }

    // Miter scale: compensate for the angle so offset width is correct
    const dot = nx * normPrev[0] + ny * normPrev[1];
    const safeDot = Math.abs(dot) < 1e-6 ? 1 : dot;
    // Clamp miter to avoid extreme spikes at sharp turns
    const scale = Math.min(r / safeDot, r * 4);
    const ox = nx * scale;
    const oy = ny * scale;

    left.push([curr.x + ox, curr.y + oy]);
    right.push([curr.x - ox, curr.y - oy]);
  }

  let d = `M${left[0][0]},${left[0][1]}`;
  for (let i = 1; i < left.length; i++) {
    d += `L${left[i][0]},${left[i][1]}`;
  }
  for (let i = right.length - 1; i >= 0; i--) {
    d += `L${right[i][0]},${right[i][1]}`;
  }
  d += 'Z';

  return d;
}

// ---------------------------------------------------------------------------
// Curve resampling
// ---------------------------------------------------------------------------

type PathCommand =
  | { type: 'M'; x: number; y: number; r: number }
  | { type: 'L'; from: [number, number, number]; to: [number, number, number] }
  | { type: 'C'; from: [number, number, number]; cp1: [number, number]; cp2: [number, number]; to: [number, number, number] }
  | { type: 'Q'; from: [number, number, number]; cp: [number, number]; to: [number, number, number] };

/**
 * Resample points through a d3-shape curve factory, producing dense
 * intermediate points with interpolated radii.
 */
function resampleWithCurve(
  points: TrailPoint[],
  curveFactory: CurveFactory | CurveFactoryLineOnly,
  tension?: number,
  resolution?: number
): TrailPoint[] {
  if (points.length < 2) return points;

  // Apply tension if the curve factory supports it
  const factory = applyTension(curveFactory, tension);

  // Capture curve commands via a fake context
  const commands: PathCommand[] = [];
  let currentPoint: [number, number] | null = null;
  let currentRadius = points[0].r;
  let pendingRadius = points[0].r;

  const ctx = {
    moveTo(x: number, y: number) {
      currentPoint = [x, y];
      currentRadius = pendingRadius;
      commands.push({ type: 'M', x, y, r: currentRadius });
    },
    lineTo(x: number, y: number) {
      const from = currentPoint ?? [x, y];
      commands.push({
        type: 'L',
        from: [from[0], from[1], currentRadius],
        to: [x, y, pendingRadius],
      });
      currentPoint = [x, y];
      currentRadius = pendingRadius;
    },
    bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
      const from = currentPoint ?? [x, y];
      commands.push({
        type: 'C',
        from: [from[0], from[1], currentRadius],
        cp1: [x1, y1],
        cp2: [x2, y2],
        to: [x, y, pendingRadius],
      });
      currentPoint = [x, y];
      currentRadius = pendingRadius;
    },
    quadraticCurveTo(x1: number, y1: number, x: number, y: number) {
      const from = currentPoint ?? [x, y];
      commands.push({
        type: 'Q',
        from: [from[0], from[1], currentRadius],
        cp: [x1, y1],
        to: [x, y, pendingRadius],
      });
      currentPoint = [x, y];
      currentRadius = pendingRadius;
    },
    closePath() {},
    beginPath() {},
    arc() {},
    rect() {},
  };

  // Drive the curve factory with our points
  const curve = factory(ctx as unknown as CanvasRenderingContext2D);
  curve.lineStart();
  for (const pt of points) {
    pendingRadius = pt.r;
    curve.point(pt.x, pt.y);
  }
  curve.lineEnd();

  // Determine samples per segment
  const samplesPerSegment = resolution ?? estimateSamplesPerSegment(points);

  // Flatten captured commands into dense points
  const dense = flattenCommands(commands, samplesPerSegment);
  if (dense.length === 0) return points;

  // Interpolate radii based on arc-length proportion
  interpolateRadii(points, dense);

  return dense;
}

/**
 * Apply tension to a curve factory if it supports it.
 * d3-shape conventions: curveCardinal.tension(), curveCatmullRom.alpha(), curveBundle.beta()
 */
function applyTension(
  factory: CurveFactory | CurveFactoryLineOnly,
  tension?: number
): CurveFactory | CurveFactoryLineOnly {
  if (tension == null) return factory;

  const f = factory as any;
  if (typeof f.tension === 'function') return f.tension(tension);
  if (typeof f.alpha === 'function') return f.alpha(tension);
  if (typeof f.beta === 'function') return f.beta(tension);

  return factory;
}

/**
 * Auto-estimate samples per segment based on average segment length relative to radius.
 */
function estimateSamplesPerSegment(points: TrailPoint[]): number {
  let distSum = 0;
  let rSum = 0;

  for (let i = 0; i < points.length; i++) {
    rSum += points[i].r;
    if (i > 0) {
      distSum += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
  }

  const meanDist = points.length > 1 ? distSum / (points.length - 1) : 0;
  const meanRadius = rSum / points.length;
  const base = meanRadius > 0 ? meanDist / meanRadius : meanDist;

  return Math.max(4, Math.min(32, Math.round(base || 8)));
}

/**
 * Flatten captured path commands into dense {x, y, r} samples.
 * Bézier curves are subdivided parametrically.
 */
function flattenCommands(commands: PathCommand[], samplesPerSegment: number): TrailPoint[] {
  const result: TrailPoint[] = [];
  let last: [number, number] | null = null;

  const push = (x: number, y: number, r: number) => {
    // Deduplicate consecutive identical points
    if (last && Math.abs(last[0] - x) < 1e-6 && Math.abs(last[1] - y) < 1e-6) return;
    result.push({ x, y, r });
    last = [x, y];
  };

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      push(cmd.x, cmd.y, cmd.r);
      continue;
    }

    if (cmd.type === 'L') {
      const [x0, y0, r0] = cmd.from;
      const [x1, y1, r1] = cmd.to;
      for (let s = 1; s <= samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        push(lerp(x0, x1, t), lerp(y0, y1, t), lerp(r0, r1, t));
      }
      continue;
    }

    if (cmd.type === 'C') {
      const [x0, y0, r0] = cmd.from;
      const [x1, y1] = cmd.cp1;
      const [x2, y2] = cmd.cp2;
      const [x3, y3, r3] = cmd.to;
      for (let s = 1; s <= samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        push(cubic(x0, x1, x2, x3, t), cubic(y0, y1, y2, y3, t), lerp(r0, r3, t));
      }
      continue;
    }

    if (cmd.type === 'Q') {
      const [x0, y0, r0] = cmd.from;
      const [cx, cy] = cmd.cp;
      const [x1, y1, r1] = cmd.to;
      for (let s = 1; s <= samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        push(quad(x0, cx, x1, t), quad(y0, cy, y1, t), lerp(r0, r1, t));
      }
    }
  }

  return result;
}

/**
 * Assign interpolated radii to dense resampled points based on
 * arc-length proportion relative to the original points.
 */
function interpolateRadii(original: TrailPoint[], dense: TrailPoint[]): void {
  if (original.length < 2 || dense.length < 2) return;

  // Cumulative arc-length of original points
  const origCum: number[] = [0];
  for (let i = 1; i < original.length; i++) {
    origCum.push(origCum[i - 1] + Math.hypot(
      original[i].x - original[i - 1].x,
      original[i].y - original[i - 1].y
    ));
  }
  const origTotal = origCum[origCum.length - 1] || 1;

  // Cumulative arc-length of dense points
  const denseCum: number[] = [0];
  for (let i = 1; i < dense.length; i++) {
    denseCum.push(denseCum[i - 1] + Math.hypot(
      dense[i].x - dense[i - 1].x,
      dense[i].y - dense[i - 1].y
    ));
  }
  const denseTotal = denseCum[denseCum.length - 1] || 1;

  for (let i = 0; i < dense.length; i++) {
    const frac = denseCum[i] / denseTotal;
    const target = frac * origTotal;

    // Find bracketing segment in original
    let idx = 1;
    while (idx < origCum.length && origCum[idx] < target) idx++;
    if (idx >= origCum.length) {
      dense[i].r = original[original.length - 1].r;
    } else {
      const t0 = origCum[idx - 1];
      const t1 = origCum[idx];
      const r0 = original[idx - 1].r;
      const r1 = original[idx].r;
      const t = t1 === t0 ? 0 : (target - t0) / (t1 - t0);
      dense[i].r = lerp(r0, r1, t);
    }
  }
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const it = 1 - t;
  return it * it * it * p0 + 3 * it * it * t * p1 + 3 * it * t * t * p2 + t * t * t * p3;
}

function quad(p0: number, p1: number, p2: number, t: number): number {
  const it = 1 - t;
  return it * it * p0 + 2 * it * t * p1 + t * t * p2;
}
