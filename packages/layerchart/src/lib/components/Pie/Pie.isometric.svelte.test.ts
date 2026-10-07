import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import MarkHarness from '$lib/tests/MarkHarness.svelte';
import { chartTestId } from '$lib/tests/TestHarness.svelte';
import Pie from './Pie.svelte';

const data = [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }];

describe('Pie on an isometric floor', () => {
  it('stands every slice up, drawn back to front', async () => {
    render(MarkHarness, {
      chartProps: {
        data,
        x: 'value',
        zRange: [0, 30],
        width: 400,
        height: 300,
        isometric: { rotate: 0, tilt: 60 },
      },
      layerProps: { center: true },
      component: Pie,
      componentProps: { z: 30 },
    });
    await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
    const el = page.getByTestId(chartTestId).element() as HTMLElement;
    const tops = [...el.querySelectorAll<SVGPathElement>('path.lc-arc-line:not(.lc-path-side)')];
    expect(tops).toHaveLength(4);
    // Every slice raised, and some sides showing
    for (const top of tops) expect(top.getAttribute('transform')).toMatch(/^translate\(/);
    expect(el.querySelectorAll('.lc-path-side').length).toBeGreaterThan(0);
    // Back to front: each slice's middle lower on screen (nearer) than the one before
    const middles = tops.map((t) => {
      const r = t.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    expect(middles).toEqual([...middles].sort((a, b) => a - b));
  });
});
