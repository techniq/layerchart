import { describe, expect, it } from 'vitest';

import { occlude, rotateRect } from './occlusion.js';

describe('rotateRect', () => {
  const rect = { x: 0, y: 0, width: 100, height: 10 };

  it('returns the rect unchanged at 0 degrees', () => {
    expect(rotateRect(rect, 0, 0, 0)).toBe(rect);
  });

  it('swaps width and height at 90 degrees', () => {
    const rotated = rotateRect(rect, 90, 0, 0);
    expect(rotated.width).toBeCloseTo(10);
    expect(rotated.height).toBeCloseTo(100);
  });

  it('narrows a wide box when angled, which is why rotated labels fit', () => {
    const rotated = rotateRect(rect, -45, 0, 0);
    expect(rotated.width).toBeLessThan(rect.width);
    expect(rotated.height).toBeGreaterThan(rect.height);
  });

  it('rotates about the given origin', () => {
    // A 180° turn about the rect's own far corner puts it on the opposite side of that point
    const rotated = rotateRect(rect, 180, 100, 10);
    expect(rotated.x).toBeCloseTo(100);
    expect(rotated.y).toBeCloseTo(10);
  });

  it('is symmetric for equal opposite angles', () => {
    const a = rotateRect(rect, 30, 50, 5);
    const b = rotateRect(rect, -30, 50, 5);
    expect(a.width).toBeCloseTo(b.width);
    expect(a.height).toBeCloseTo(b.height);
  });
});

describe('occlude', () => {
  const box = (x: number) => ({ x, y: 0, width: 10, height: 10 });

  it('keeps non-overlapping items', () => {
    const items = [box(0), box(20), box(40)];
    expect(occlude(items, (d) => d)).toHaveLength(3);
  });

  it('drops overlapping items', () => {
    const items = [box(0), box(5), box(20)];
    expect(occlude(items, (d) => d)).toEqual([box(0), box(20)]);
  });

  it('requires `padding` between kept boxes', () => {
    const items = [box(0), box(12), box(30)];
    expect(occlude(items, (d) => d)).toHaveLength(3);
    expect(occlude(items, (d) => d, { padding: 5 })).toEqual([box(0), box(30)]);
  });

  it('places higher priority first', () => {
    const items = [box(0), box(5)];
    expect(occlude(items, (d) => d, { priority: (d) => d.x })).toEqual([box(5)]);
  });
});
