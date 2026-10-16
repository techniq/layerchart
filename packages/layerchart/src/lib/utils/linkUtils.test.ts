import { describe, expect, it } from 'vitest';
import { curveBumpY } from 'd3-shape';

import { getLinkD3Path } from './linkUtils.js';

describe('getLinkD3Path', () => {
  it('draws a link whose ends line up — a child straight below its parent', () => {
    const d = getLinkD3Path({
      source: { x: 50, y: 0 },
      target: { x: 50, y: 100 },
      sweep: 'none',
      curve: curveBumpY,
      orientation: 'vertical',
    });
    expect(d).not.toBe('M0,0L0,0');
    expect(d).toMatch(/^M50,0/);
  });

  it('draws nothing for a link with no length', () => {
    const d = getLinkD3Path({
      source: { x: 50, y: 50 },
      target: { x: 50, y: 50 },
      sweep: 'none',
      curve: curveBumpY,
    });
    expect(d).toBe('M0,0L0,0');
  });
});
