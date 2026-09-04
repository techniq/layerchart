import { describe, expect, it } from 'vitest';

import { occlude } from './occlusion.js';

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
