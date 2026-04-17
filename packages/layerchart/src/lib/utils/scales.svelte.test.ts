import { describe, it, expect } from 'vitest';
import { scaleBand } from 'd3-scale';

import { scaleBandInvert, scaleInvert } from './scales.svelte.js';

describe('scaleBandInvert', () => {
  const domain = ['A', 'B', 'C', 'D', 'E'];

  it('should return correct category for standard range [0, width]', () => {
    const scale = scaleBand().domain(domain).range([0, 500]).padding(0.1);
    const invert = scaleBandInvert(scale);

    // Each category should map back from its center
    for (const category of domain) {
      const x = scale(category)! + scale.bandwidth() / 2;
      expect(invert(x)).toBe(category);
    }
  });

  it('should clamp to first category for values before range', () => {
    const scale = scaleBand().domain(domain).range([0, 500]).padding(0.1);
    const invert = scaleBandInvert(scale);

    expect(invert(-50)).toBe('A');
  });

  it('should clamp to last category for values after range', () => {
    const scale = scaleBand().domain(domain).range([0, 500]).padding(0.1);
    const invert = scaleBandInvert(scale);

    expect(invert(600)).toBe('E');
  });

  it('should handle offset range (non-zero start)', () => {
    // Simulates a zoomed band scale where the range is shifted
    const scale = scaleBand().domain(domain).range([-200, 800]).padding(0.1);
    const invert = scaleBandInvert(scale);

    // Each category should still map correctly
    for (const category of domain) {
      const x = scale(category)! + scale.bandwidth() / 2;
      expect(invert(x)).toBe(category);
    }
  });

  it('should return correct category at viewport edges with offset range', () => {
    // Range [-400, 600] means categories span 1000px but viewport is [0, ~500]
    const scale = scaleBand().domain(domain).range([-400, 600]).padding(0.4);
    const invert = scaleBandInvert(scale);

    // At x=0, we should get whichever category is nearest that pixel position
    const categoryAtZero = invert(0);
    expect(domain).toContain(categoryAtZero);

    // The returned category should be close to x=0 (within one step)
    const pos = scale(categoryAtZero)!;
    expect(Math.abs(pos)).toBeLessThan(scale.step());
  });

  it('should work with no padding', () => {
    const scale = scaleBand().domain(domain).range([0, 500]);
    const invert = scaleBandInvert(scale);

    // bandwidth = 100, each category is 100px wide
    expect(invert(50)).toBe('A');
    expect(invert(150)).toBe('B');
    expect(invert(450)).toBe('E');
  });

  it('should work with single-element domain', () => {
    const scale = scaleBand().domain(['X']).range([0, 500]).padding(0.1);
    const invert = scaleBandInvert(scale);

    expect(invert(250)).toBe('X');
    expect(invert(0)).toBe('X');
  });
});

describe('scaleInvert', () => {
  it('should use scaleBandInvert for band scales', () => {
    const scale = scaleBand().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1);
    const center = scale('B')! + scale.bandwidth() / 2;
    expect(scaleInvert(scale, center)).toBe('B');
  });
});
