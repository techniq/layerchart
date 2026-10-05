import { describe, it, expect } from 'vitest';

import {
  applyMatrix,
  boxFaces,
  createIsometricMatrix,
  invertMatrix,
  isometricLift,
} from './isometric.js';

/** Screen angle of a direction, in degrees above the horizontal */
function elevation(v: { x: number; y: number }) {
  return (Math.atan2(-v.y, Math.abs(v.x)) * 180) / Math.PI;
}

describe('createIsometricMatrix', () => {
  it('is the identity when neither turned nor tipped', () => {
    const m = createIsometricMatrix({ rotate: 0, tilt: 0 }, 400, 300);
    expect(m.a).toBeCloseTo(1);
    expect(m.b).toBeCloseTo(0);
    expect(m.c).toBeCloseTo(0);
    expect(m.d).toBeCloseTo(1);
    expect(m.e).toBeCloseTo(0);
    expect(m.f).toBeCloseTo(0);
  });

  it('runs both axes up from the origin at 30° by default', () => {
    const m = createIsometricMatrix({}, 400, 400);
    const origin = applyMatrix(m, { x: 0, y: 400 });
    const xEnd = applyMatrix(m, { x: 400, y: 400 });
    const yEnd = applyMatrix(m, { x: 0, y: 0 });

    // x runs up and to the right, y up and to the left
    expect(xEnd.x).toBeGreaterThan(origin.x);
    expect(yEnd.x).toBeLessThan(origin.x);
    expect(elevation({ x: xEnd.x - origin.x, y: xEnd.y - origin.y })).toBeCloseTo(30);
    expect(elevation({ x: yEnd.x - origin.x, y: yEnd.y - origin.y })).toBeCloseTo(30);
  });

  it('gives the 2:1 projection at a 60° tilt', () => {
    const m = createIsometricMatrix({ tilt: 60 }, 400, 400);
    const origin = applyMatrix(m, { x: 0, y: 400 });
    const xEnd = applyMatrix(m, { x: 400, y: 400 });
    expect((origin.y - xEnd.y) / (xEnd.x - origin.x)).toBeCloseTo(0.5);
  });

  it('fits the floor inside the box and centers it', () => {
    for (const [width, height] of [
      [400, 400],
      [800, 300],
      [300, 800],
    ]) {
      const m = createIsometricMatrix({}, width, height);
      const corners = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ].map(([x, y]) => applyMatrix(m, { x, y }));
      const xs = corners.map((p) => p.x);
      const ys = corners.map((p) => p.y);

      expect(Math.min(...xs)).toBeGreaterThanOrEqual(-1e-9);
      expect(Math.max(...xs)).toBeLessThanOrEqual(width + 1e-9);
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(-1e-9);
      expect(Math.max(...ys)).toBeLessThanOrEqual(height + 1e-9);
      expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(width / 2);
      expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(height / 2);

      // Touches the box along at least one axis, rather than floating smaller than it needs to
      const fillsX = Math.max(...xs) - Math.min(...xs);
      const fillsY = Math.max(...ys) - Math.min(...ys);
      expect(Math.max(fillsX / width, fillsY / height)).toBeCloseTo(1);
    }
  });
});

describe('invertMatrix', () => {
  it('maps a point back to where it came from', () => {
    const m = createIsometricMatrix({ rotate: -30, tilt: 50 }, 500, 320);
    const inverse = invertMatrix(m)!;
    const point = { x: 123, y: 45 };
    const back = applyMatrix(inverse, applyMatrix(m, point));
    expect(back.x).toBeCloseTo(point.x);
    expect(back.y).toBeCloseTo(point.y);
  });

  it('returns null for a matrix that collapses the plane', () => {
    expect(invertMatrix({ a: 1, b: 0, c: 0, d: 0, e: 0, f: 0 })).toBeNull();
  });
});

describe('isometricLift', () => {
  it('raises a point straight up the screen', () => {
    const m = createIsometricMatrix({}, 400, 300);
    const lift = isometricLift({});
    const floor = applyMatrix(m, { x: 120, y: 80 });
    const raised = applyMatrix(m, { x: 120 + lift.x * 50, y: 80 + lift.y * 50 });
    expect(raised.x).toBeCloseTo(floor.x);
    expect(raised.y).toBeLessThan(floor.y);
  });

  it('foreshortens a height as much as the floor in true isometric', () => {
    const m = createIsometricMatrix({}, 400, 300);
    const lift = isometricLift({});
    const o = applyMatrix(m, { x: 0, y: 0 });
    const along = applyMatrix(m, { x: 100, y: 0 });
    const up = applyMatrix(m, { x: lift.x * 100, y: lift.y * 100 });
    expect(Math.hypot(up.x - o.x, up.y - o.y)).toBeCloseTo(
      Math.hypot(along.x - o.x, along.y - o.y)
    );
  });

  it('is nothing seen from directly above', () => {
    const lift = isometricLift({ rotate: 0, tilt: 0 });
    expect(lift.x).toBeCloseTo(0);
    expect(lift.y).toBeCloseTo(0);
  });
});

describe('createIsometricMatrix depth', () => {
  it('leaves room above the floor for the tallest height', () => {
    const [width, height, depth] = [400, 300, 150];
    const m = createIsometricMatrix({}, width, height, depth);
    const lift = isometricLift({});
    const raised = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ].map(([x, y]) => applyMatrix(m, { x: x + lift.x * depth, y: y + lift.y * depth }));
    for (const p of raised) {
      expect(p.y).toBeGreaterThanOrEqual(-1e-9);
      expect(p.x).toBeGreaterThanOrEqual(-1e-9);
      expect(p.x).toBeLessThanOrEqual(width + 1e-9);
    }
  });
});

describe('boxFaces', () => {
  const m = createIsometricMatrix({}, 400, 400);
  const lift = isometricLift({});
  const box = { x: 100, y: 100, width: 50, height: 40, z0: 0, z1: 30 };

  it('returns the two sides facing the viewer, then the top', () => {
    const faces = boxFaces(box, lift, m);
    expect(faces.map((f) => f.kind)).toEqual(['side', 'side', 'top']);
  });

  it('shows the front edges — the bottom and left of the flat footprint', () => {
    const [first, second] = boxFaces(box, lift, m);
    // Each side's first two points are its edge on the floor
    const edges = [first, second].map((f) => f.points.slice(0, 2));
    expect(edges).toContainEqual([
      { x: 150, y: 140 },
      { x: 100, y: 140 },
    ]);
    expect(edges).toContainEqual([
      { x: 100, y: 140 },
      { x: 100, y: 100 },
    ]);
  });

  it('shades the side turned right more than the one turned left', () => {
    const sides = boxFaces(box, lift, m).filter((f) => f.kind === 'side');
    const shadeOf = (f: (typeof sides)[number]) => {
      const [a, b] = f.points.map((p) => applyMatrix(m, p));
      // The edge's midpoint is right of the footprint's centre on screen for a right-facing side
      return { shade: f.shade, x: (a.x + b.x) / 2 };
    };
    const [left, right] = sides.map(shadeOf).sort((a, b) => a.x - b.x);
    expect(right.shade).toBeGreaterThan(left.shade);
  });

  it('raises the top to the box height', () => {
    const top = boxFaces(box, lift, m).at(-1)!;
    expect(top.points[0]).toEqual({ x: 100 + lift.x * 30, y: 100 + lift.y * 30 });
  });
});
