import { describe, expect, it } from 'vitest';

import { getTextRect } from './string.js';

/**
 * Runs under the `server` (node) project, where `getStringWidth` finds no DOM and falls back to
 * its `length * fontSize * 0.6` estimate — so widths here are exact and the geometry (anchoring,
 * stacking, rotation) is what is actually under test.  At `fontSize: 10` a character is 6px.
 */
describe('getTextRect', () => {
  const fontSize = 10;

  it('anchors a single line at the point', () => {
    expect(getTextRect('abcde', 0, 0, { fontSize })).toEqual({
      x: 0,
      y: -5,
      width: 30,
      height: 10,
    });
  });

  it('honors textAnchor and verticalAnchor', () => {
    expect(getTextRect('abcde', 100, 50, { fontSize, textAnchor: 'end' })).toMatchObject({ x: 70 });
    expect(getTextRect('abcde', 100, 50, { fontSize, textAnchor: 'middle' })).toMatchObject({
      x: 85,
    });
    expect(getTextRect('abcde', 100, 50, { fontSize, verticalAnchor: 'start' })).toMatchObject({
      y: 50,
    });
    expect(getTextRect('abcde', 100, 50, { fontSize, verticalAnchor: 'end' })).toMatchObject({
      y: 40,
    });
  });

  it('offsets by dx/dy', () => {
    expect(getTextRect('abcde', 0, 0, { fontSize, dx: 4, dy: -3 })).toMatchObject({ x: 4, y: -8 });
  });

  describe('multiline', () => {
    it('is as wide as the widest line and as tall as the stack', () => {
      expect(getTextRect(['ab', 'cdef'], 0, 0, { fontSize })).toEqual({
        x: 0,
        y: -10,
        width: 24,
        height: 20,
      });
    });

    it('stacks by lineHeight when given', () => {
      expect(getTextRect(['ab', 'cdef'], 0, 0, { fontSize, lineHeight: 11 })).toMatchObject({
        height: 22,
      });
    });

    it('matches the string form for a single line', () => {
      expect(getTextRect(['abcde'], 0, 0, { fontSize })).toEqual(
        getTextRect('abcde', 0, 0, { fontSize })
      );
    });
  });

  describe('rotate', () => {
    it('is a no-op at 0 degrees', () => {
      expect(getTextRect('abcde', 7, 3, { fontSize, rotate: 0 })).toEqual(
        getTextRect('abcde', 7, 3, { fontSize })
      );
    });

    it('swaps width and height at 90 degrees', () => {
      // 30x10 anchored at (0,0) spans x 0..30, y -5..5; rotating a quarter turn about the origin
      // maps that to x -5..5, y 0..30.
      const rotated = getTextRect('abcde', 0, 0, { fontSize, rotate: 90 });
      expect(rotated.x).toBeCloseTo(-5);
      expect(rotated.y).toBeCloseTo(0);
      expect(rotated.width).toBeCloseTo(10);
      expect(rotated.height).toBeCloseTo(30);
    });

    it('narrows a long label when angled, which is the point of rotating ticks', () => {
      const flat = getTextRect('Wednesday', 0, 0, { fontSize, textAnchor: 'end' });
      const angled = getTextRect('Wednesday', 0, 0, { fontSize, textAnchor: 'end', rotate: -45 });
      expect(angled.width).toBeLessThan(flat.width);
      expect(angled.height).toBeGreaterThan(flat.height);
    });

    it('is symmetric for equal opposite angles', () => {
      const a = getTextRect('abcde', 0, 0, { fontSize, rotate: 30 });
      const b = getTextRect('abcde', 0, 0, { fontSize, rotate: -30 });
      expect(a.width).toBeCloseTo(b.width);
      expect(a.height).toBeCloseTo(b.height);
    });

    it('pivots about (x, y) rather than the dx/dy-offset anchor, matching `<Text>`', () => {
      // `<Text>` emits `rotate(deg, x, y)`, so dx/dy shift the text *before* it swings around the
      // unoffset point — a half turn therefore reflects the offset back across it.
      expect(getTextRect('abcde', 0, 0, { fontSize, dx: 10, rotate: 180 })).toMatchObject({
        x: -40,
      });
    });
  });
});
