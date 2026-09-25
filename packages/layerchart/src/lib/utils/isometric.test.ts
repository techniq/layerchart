import { describe, it, expect } from 'vitest';

import { applyMatrix, createIsometricMatrix, invertMatrix } from './isometric.js';

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
