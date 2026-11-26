import { describe, expect, it } from 'vitest';
import { dashPattern } from './merged.svelte.js';

describe('dashPattern', () => {
  it('reads a dashArray as the core marks take it: a length, an array, or a string', () => {
    expect(dashPattern(4)).toEqual([4, 4]);
    expect(dashPattern([6, 2])).toEqual([6, 2]);
    expect(dashPattern([6, 2, 1, 2])).toEqual([6, 2]);
    expect(dashPattern('3 1')).toEqual([3, 1]);
    expect(dashPattern('3,1')).toEqual([3, 1]);
  });

  it('is solid without one', () => {
    for (const none of [undefined, null, '', 'none', 0, [0, 2]]) {
      expect(dashPattern(none as any)).toBeNull();
    }
  });
});
