import { describe, it, expect } from 'vitest';
import { scaleBand, scaleLinear, scaleTime } from 'd3-scale';

import {
  applyMatrix,
  autoIsometricAspect,
  boxFaces,
  createIsometricMatrix,
  fitIsometricFloor,
  invertMatrix,
  isometricLift,
} from './isometric.js';

/** Screen angle of a direction, in degrees above the horizontal */
function elevation(v: { x: number; y: number }) {
  return (Math.atan2(-v.y, Math.abs(v.x)) * 180) / Math.PI;
}

/** The floor fitted to a box, and the matrix drawing it there */
function view(
  options: Parameters<typeof fitIsometricFloor>[0],
  box: { width: number; height: number },
  fit: Parameters<typeof fitIsometricFloor>[3] = {}
) {
  const floor = fitIsometricFloor(options, box.width, box.height, fit);
  return { floor, m: createIsometricMatrix(options, floor, box, { footprint: fit.footprint }) };
}

/** Where a floor's corners land on screen */
function corners(
  m: ReturnType<typeof createIsometricMatrix>,
  floor: { width: number; height: number }
) {
  return [
    [0, 0],
    [floor.width, 0],
    [floor.width, floor.height],
    [0, floor.height],
  ].map(([x, y]) => applyMatrix(m, { x, y }));
}

describe('createIsometricMatrix', () => {
  it('is the identity when neither turned nor tipped', () => {
    const box = { width: 400, height: 300 };
    const m = createIsometricMatrix({ rotate: 0, tilt: 0 }, box, box);
    expect([m.a, m.b, m.c, m.d, m.e, m.f].map((v) => Math.round(v * 1e9) / 1e9 + 0)).toEqual([
      1, 0, 0, 1, 0, 0,
    ]);
  });

  it('runs both axes up from the origin at 30° by default', () => {
    const floor = { width: 400, height: 400 };
    const m = createIsometricMatrix({}, floor, { width: 800, height: 500 });
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
    const floor = { width: 400, height: 400 };
    const m = createIsometricMatrix({ tilt: 60 }, floor, floor);
    const origin = applyMatrix(m, { x: 0, y: 400 });
    const xEnd = applyMatrix(m, { x: 400, y: 400 });
    expect((origin.y - xEnd.y) / (xEnd.x - origin.x)).toBeCloseTo(0.5);
  });

  it('draws the floor at its natural size', () => {
    const { m } = view({}, { width: 800, height: 300 });
    // Turned, not scaled: a step along the floor's x is the same length on screen as off it,
    // before the tilt foreshortens the depth
    expect(Math.hypot(m.a, m.c)).toBeCloseTo(1);
  });
});

describe('fitIsometricFloor', () => {
  it('is square by default, whatever the box', () => {
    for (const box of [
      { width: 400, height: 400 },
      { width: 900, height: 300 },
      { width: 300, height: 900 },
    ]) {
      const { floor } = view({}, box);
      expect(floor.width).toBeCloseTo(floor.height);
    }
  });

  it('keeps the given `aspect`', () => {
    const { floor } = view({ aspect: 20 / 7 }, { width: 900, height: 400 });
    expect(floor.width / floor.height).toBeCloseTo(20 / 7);
  });

  it('fits the turned floor inside the box, centred, touching it along one side', () => {
    for (const box of [
      { width: 400, height: 400 },
      { width: 800, height: 300 },
      { width: 300, height: 800 },
    ]) {
      const { floor, m } = view({ aspect: 1.5 }, box);
      const xs = corners(m, floor).map((p) => p.x);
      const ys = corners(m, floor).map((p) => p.y);

      expect(Math.min(...xs)).toBeGreaterThanOrEqual(-1e-6);
      expect(Math.max(...xs)).toBeLessThanOrEqual(box.width + 1e-6);
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(-1e-6);
      expect(Math.max(...ys)).toBeLessThanOrEqual(box.height + 1e-6);
      expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(box.width / 2);
      expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(box.height / 2);

      const fillsX = (Math.max(...xs) - Math.min(...xs)) / box.width;
      const fillsY = (Math.max(...ys) - Math.min(...ys)) / box.height;
      expect(Math.max(fillsX, fillsY)).toBeCloseTo(1);
    }
  });

  it('keeps its size as a box limited by its height widens', () => {
    const narrow = view({}, { width: 900, height: 300 }).floor;
    const wide = view({}, { width: 1400, height: 300 }).floor;
    expect(wide).toEqual(narrow);
  });

  it('leaves room above the floor for heights that grow with it', () => {
    const box = { width: 600, height: 400 };
    const depthAt = (floor: { width: number; height: number }) => floor.height / 2;
    const floor = fitIsometricFloor({}, box.width, box.height, { depthAt });
    const m = createIsometricMatrix({}, floor, box, { depth: depthAt(floor) });
    const lift = isometricLift({});
    const depth = depthAt(floor);
    const raised = [
      [0, 0],
      [floor.width, 0],
      [floor.width, floor.height],
      [0, floor.height],
    ].map(([x, y]) => applyMatrix(m, { x: x + lift.x * depth, y: y + lift.y * depth }));
    for (const p of [...raised, ...corners(m, floor)]) {
      expect(p.y).toBeGreaterThanOrEqual(-1e-6);
      expect(p.y).toBeLessThanOrEqual(box.height + 1e-6);
    }
  });

  it('keeps a radial floor the size of its circle flat', () => {
    // A circle keeps its width however it turns and is only foreshortened top to bottom, so it
    // fits as it is — and isn't enlarged into the room the tilt frees
    const box = { width: 900, height: 400 };
    const { floor } = view({}, box, { footprint: 'disc' });
    expect(floor.width).toBeCloseTo(box.height);
    expect(floor.height).toBeCloseTo(box.height);
  });

  it('never makes the floor larger than the plot area', () => {
    for (const box of [
      { width: 900, height: 300 },
      { width: 300, height: 900 },
    ]) {
      const { floor } = view({ aspect: 2, tilt: 30 }, box);
      expect(floor.width).toBeLessThanOrEqual(box.width + 1e-6);
      expect(floor.height).toBeLessThanOrEqual(box.height + 1e-6);
    }
  });
});

describe('invertMatrix', () => {
  it('maps a point back to where it came from', () => {
    const m = createIsometricMatrix(
      { rotate: -30, tilt: 50 },
      { width: 500, height: 320 },
      { width: 600, height: 400 }
    );
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
    const m = createIsometricMatrix({}, { width: 400, height: 300 }, { width: 600, height: 400 });
    const lift = isometricLift({});
    const floor = applyMatrix(m, { x: 120, y: 80 });
    const raised = applyMatrix(m, { x: 120 + lift.x * 50, y: 80 + lift.y * 50 });
    expect(raised.x).toBeCloseTo(floor.x);
    expect(raised.y).toBeLessThan(floor.y);
  });

  it('foreshortens a height as much as the floor in true isometric', () => {
    const m = createIsometricMatrix({}, { width: 400, height: 300 }, { width: 600, height: 400 });
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

describe('boxFaces', () => {
  const m = createIsometricMatrix({}, { width: 400, height: 400 }, { width: 600, height: 400 });
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

describe('autoIsometricAspect', () => {
  const band = (n: number) => ({
    scale: scaleBand(),
    domain: Array.from({ length: n }, (_, i) => i),
  });
  const linear = (d0: number, d1: number) => ({ scale: scaleLinear(), domain: [d0, d1] });

  it('makes the cells of a band grid square', () => {
    expect(autoIsometricAspect(band(20), band(7))).toBeCloseTo(20 / 7);
  });

  it('keeps a long band grid long — the four-times limit is for continuous scales', () => {
    expect(autoIsometricAspect(band(52), band(7))).toBeCloseTo(52 / 7);
  });

  it('gives continuous scales equal units', () => {
    expect(autoIsometricAspect(linear(0, 300), linear(0, 100))).toBeCloseTo(3);
    expect(autoIsometricAspect(linear(0, 500), linear(0, 500))).toBeCloseTo(1);
  });

  it('falls back to square when one continuous span is more than four times the other', () => {
    expect(autoIsometricAspect(linear(0, 1000), linear(0, 10))).toBe(1);
    expect(autoIsometricAspect(linear(0, 10), linear(0, 1000))).toBe(1);
  });

  it('is square when the units do not compare', () => {
    // A band against values, and dates against counts
    expect(autoIsometricAspect(band(5), linear(0, 100))).toBe(1);
    const dates = { scale: scaleTime(), domain: [new Date(2024, 0, 1), new Date(2024, 11, 31)] };
    expect(autoIsometricAspect(dates, linear(0, 100))).toBe(1);
  });
});
