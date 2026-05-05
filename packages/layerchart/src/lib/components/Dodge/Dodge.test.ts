import { describe, it, expect } from 'vitest';
import { dodge } from './Dodge.shared.svelte.js';

type T = { id: string };

/** Build inputs for the circular case (`rx === ry === r`). */
function input(arr: { id: string; x: number; r: number }[]) {
  return arr.map((d, index) => ({
    x: d.x,
    rx: d.r,
    ry: d.r,
    data: { id: d.id },
    index,
  }));
}

/** Build inputs for rectangular cases (per-axis half-extents). */
function rectInput(arr: { id: string; x: number; rx: number; ry: number }[]) {
  return arr.map((d, index) => ({
    x: d.x,
    rx: d.rx,
    ry: d.ry,
    data: { id: d.id },
    index,
  }));
}

describe('dodge() — circular packing', () => {
  it('places a single item at the natural anchor position', () => {
    const out = dodge<T>(input([{ id: 'a', x: 50, r: 10 }]), {
      axis: 'y',
      anchor: 'bottom',
      padding: 0,
      baseline: 100,
    });
    expect(out).toHaveLength(1);
    expect(out[0].x).toBe(50);
    expect(out[0].y).toBe(90); // baseline - r
  });

  it('places non-overlapping items both at the anchor', () => {
    // Two items 100px apart, r=10 each — no horizontal overlap, both can sit at the bottom
    const out = dodge<T>(
      input([
        { id: 'a', x: 0, r: 10 },
        { id: 'b', x: 100, r: 10 },
      ]),
      { axis: 'y', anchor: 'bottom', padding: 0, baseline: 100 }
    );
    expect(out[0].y).toBe(90);
    expect(out[1].y).toBe(90);
  });

  it('stacks overlapping items vertically', () => {
    // Two items at the same x — must stack with a gap ≥ r1 + r2 + padding = 21.
    // padding is also applied to the chart edge, so the first item sits 1px
    // above the bottom (y=89, not 90).
    const out = dodge<T>(
      input([
        { id: 'a', x: 50, r: 10 },
        { id: 'b', x: 50, r: 10 },
      ]),
      { axis: 'y', anchor: 'bottom', padding: 1, baseline: 100 }
    );
    expect(out[0].y).toBe(89);
    expect(out[1].y).toBeCloseTo(89 - 21, 5); // gap of sumR+padding
  });

  it('returns items in original input order', () => {
    const out = dodge<T>(
      input([
        { id: 'small', x: 50, r: 5 },
        { id: 'large', x: 50, r: 20 },
      ]),
      { axis: 'y', anchor: 'bottom', padding: 0, baseline: 100 }
    );
    expect(out[0].data.id).toBe('small');
    expect(out[1].data.id).toBe('large');
    // Algorithm processes input order: small placed first at bottom (y=95),
    // then large stacks above.
    expect(out[0].y).toBe(95);
    expect(out[1].y).toBeLessThan(95);
  });

  it('respects anchor=top (stacks downward)', () => {
    const out = dodge<T>(
      input([
        { id: 'a', x: 50, r: 10 },
        { id: 'b', x: 50, r: 10 },
      ]),
      { axis: 'y', anchor: 'top', padding: 0, baseline: 0 }
    );
    expect(out[0].y).toBe(10); // first at top
    expect(out[1].y).toBeCloseTo(30, 5); // second below, gap = r1+r2 = 20
  });

  it('swaps axes for axis=x', () => {
    const out = dodge<T>(input([{ id: 'a', x: 30, r: 5 }]), {
      axis: 'x',
      anchor: 'left',
      padding: 0,
      baseline: 0,
    });
    expect(out[0].x).toBe(5); // dodged: at left edge
    expect(out[0].y).toBe(30); // anchor y preserved
  });
});

describe('dodge() — rectangular packing (rx + ry)', () => {
  // ry = 8 ⇒ row spacing = 2 * ry = 16 (matches the old `rowHeight: 16` cases).
  it('places non-overlapping items in row 0', () => {
    const out = dodge<T>(
      rectInput([
        { id: 'a', x: 0, rx: 20, ry: 8 }, // spans -20 to 20
        { id: 'b', x: 100, rx: 20, ry: 8 }, // spans 80 to 120
      ]),
      { axis: 'y', anchor: 'bottom', padding: 0, baseline: 200, rectangular: true }
    );
    // Row 0 center from bottom = baseline - ry = 192
    expect(out[0].y).toBe(192);
    expect(out[1].y).toBe(192);
  });

  it('stacks horizontally-overlapping items into separate rows', () => {
    const out = dodge<T>(
      rectInput([
        { id: 'a', x: 50, rx: 30, ry: 8 },
        { id: 'b', x: 60, rx: 30, ry: 8 },
        { id: 'c', x: 70, rx: 30, ry: 8 },
      ]),
      { axis: 'y', anchor: 'bottom', padding: 0, baseline: 200, rectangular: true }
    );
    // Input order: a → row 0, b overlaps a → row 1, c overlaps both → row 2
    // Row centers from bottom: 192, 176, 160.
    expect(out[0].y).toBe(192);
    expect(out[1].y).toBe(176);
    expect(out[2].y).toBe(160);
  });

  it("reuses row 0 when later items don't overlap earlier ones in that row", () => {
    const out = dodge<T>(
      rectInput([
        { id: 'a', x: 0, rx: 10, ry: 8 },
        { id: 'b', x: 5, rx: 10, ry: 8 }, // overlaps a → row 1
        { id: 'c', x: 100, rx: 10, ry: 8 }, // far from both → row 0
      ]),
      { axis: 'y', anchor: 'bottom', padding: 0, baseline: 200, rectangular: true }
    );
    expect(out[0].y).toBe(192);
    expect(out[1].y).toBe(176);
    expect(out[2].y).toBe(192);
  });

  it('respects anchor=top for rectangular mode', () => {
    const out = dodge<T>(
      rectInput([
        { id: 'a', x: 50, rx: 30, ry: 8 },
        { id: 'b', x: 60, rx: 30, ry: 8 },
      ]),
      { axis: 'y', anchor: 'top', padding: 0, baseline: 0, rectangular: true }
    );
    // Row 0 from top: 0 + ry = 8. Row 1: 24.
    expect(out[0].y).toBe(8);
    expect(out[1].y).toBe(24);
  });
});
