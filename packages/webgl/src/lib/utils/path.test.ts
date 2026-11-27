import { describe, expect, it } from 'vitest';
import { flattenPath, parsePath, pointAlong } from './path.js';

describe('parsePath', () => {
  it('reads lines, absolute and relative, with `H` and `V`', () => {
    expect(parsePath('M0,0L10,0l0,10H0V5')).toEqual([
      {
        points: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 5],
        ],
        closed: false,
      },
    ]);
  });

  it('closes a subpath back to its start, and starts another at each move', () => {
    const [a, b] = parsePath('M0 0 10 0 10 10Z m20 0 h5 v5 z');
    expect(a.closed).toBe(true);
    expect(a.points.at(-1)).toEqual([0, 0]);
    // A move after a close is from the closed subpath's start; pairs after it are lines
    expect(b.points).toEqual([
      [20, 0],
      [25, 0],
      [25, 5],
      [20, 0],
    ]);
  });

  it('takes curves in pieces, ending on their ends', () => {
    const [cubic] = parsePath('M0,0C0,10,10,10,10,0', 4);
    expect(cubic.points).toHaveLength(5);
    expect(cubic.points.at(-1)).toEqual([10, 0]);
    // Its middle, between the control points' height
    expect(cubic.points[2][1]).toBeCloseTo(7.5);
    const [smooth] = parsePath('M0,0Q5,10,10,0T20,0', 2);
    expect(smooth.points.at(-1)).toEqual([20, 0]);
    // Reflected below for the second half
    expect(smooth.points[3][1]).toBeCloseTo(-5);
  });

  it('takes an arc around its center, flags run together or not', () => {
    for (const d of ['M0,0A10,10,0,0,1,20,0', 'M0 0a10 10 0 0120 0']) {
      const [arc] = parsePath(d);
      expect(arc.points.at(-1)).toEqual([20, 0]);
      // A half turn through the top of the circle around (10, 0) (y down: `sweep` goes up)
      const top = arc.points.reduce((a, b) => (b[1] < a[1] ? b : a));
      expect(top[0]).toBeCloseTo(10, 0);
      expect(top[1]).toBeCloseTo(-10, 0);
    }
  });

  it('keeps the points of every subpath, one after another, flattened', () => {
    expect(flattenPath('M0,0L1,1M2,2L3,3')).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });
});

describe('pointAlong', () => {
  it('is the point a length or percentage along, and the way the path runs there', () => {
    expect(pointAlong('M0,0L10,0L10,10', '50%')).toEqual({ x: 10, y: 0, angle: 0 });
    expect(pointAlong('M0,0L10,0L10,10', 15)).toEqual({ x: 10, y: 5, angle: 90 });
    expect(pointAlong('M0,0', '50%')).toBeNull();
  });
});
