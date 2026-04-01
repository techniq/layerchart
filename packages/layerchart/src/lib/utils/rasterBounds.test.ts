import { describe, expect, it } from 'vitest';

import {
  blurGridIgnoringNaN,
  gridCellCenterToBounds,
  gridPointToBounds,
  resolveRasterBounds,
  sampleGridAtBounds,
} from './rasterBounds.js';

describe('resolveRasterBounds', () => {
  it('defaults to grid dimensions', () => {
    expect(resolveRasterBounds(360, 180)).toEqual({
      x1: 0,
      y1: 0,
      x2: 360,
      y2: 180,
    });
  });

  it('uses explicit geographic bounds', () => {
    expect(resolveRasterBounds(360, 180, -180, 90, 180, -90)).toEqual({
      x1: -180,
      y1: 90,
      x2: 180,
      y2: -90,
    });
  });
});

describe('gridPointToBounds', () => {
  it('maps contour-space coordinates back into bound coordinates', () => {
    expect(
      gridPointToBounds(180, 90, 360, 180, resolveRasterBounds(360, 180, -180, 90, 180, -90))
    ).toEqual({
      x: 0,
      y: 0,
    });
  });
});

describe('gridCellCenterToBounds', () => {
  it('maps grid cell centers into bound coordinates', () => {
    expect(
      gridCellCenterToBounds(0, 0, 360, 180, resolveRasterBounds(360, 180, -180, 90, 180, -90))
    ).toEqual({
      x: -179.5,
      y: 89.5,
    });
  });
});

describe('sampleGridAtBounds', () => {
  const grid = [0, 1, 2, 3];
  const bounds = resolveRasterBounds(2, 2, -1, 1, 1, -1);

  it('samples the nearest grid cell center', () => {
    expect(sampleGridAtBounds(grid, 2, 2, bounds, -0.5, 0.5, 'nearest')).toBe(0);
    expect(sampleGridAtBounds(grid, 2, 2, bounds, 0.5, -0.5, 'nearest')).toBe(3);
  });

  it('interpolates between adjacent cells', () => {
    expect(sampleGridAtBounds(grid, 2, 2, bounds, 0, 0, 'barycentric')).toBe(1.5);
  });

  it('returns NaN outside the raster bounds', () => {
    expect(sampleGridAtBounds(grid, 2, 2, bounds, 4, 4, 'barycentric')).toBeNaN();
  });
});

describe('blurGridIgnoringNaN', () => {
  it('preserves nearby finite values when blurring through NaN gaps', () => {
    const blurred = blurGridIgnoringNaN([1, NaN, 3], 3, 1, 1);

    expect(blurred[0]).toBeGreaterThan(0);
    expect(blurred[1]).toBeGreaterThan(1);
    expect(blurred[1]).toBeLessThan(3);
    expect(blurred[2]).toBeGreaterThan(0);
  });

  it('keeps fully empty regions as NaN', () => {
    const blurred = blurGridIgnoringNaN([NaN, NaN, NaN], 3, 1, 1);

    expect(Array.from(blurred).every((value) => Number.isNaN(value))).toBe(true);
  });
});
