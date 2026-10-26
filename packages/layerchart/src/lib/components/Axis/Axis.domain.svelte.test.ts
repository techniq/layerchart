import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '$lib/tests/TestHarness.svelte';
import Axis from './Axis.svelte';

const chartProps = {
  data: [{ x: 0, y: 0 }],
  x: 'x',
  y: 'y',
  xDomain: [0, 1],
  yDomain: [0, 100],
  width: 400,
  height: 200,
  padding: { left: 24, right: 24 },
};

/** The center `y` of each tick label, by its text */
function labelYs() {
  return Object.fromEntries(
    Array.from(document.querySelectorAll('.lc-axis-tick-label')).map((el) => {
      const r = el.getBoundingClientRect();
      return [el.textContent?.trim() ?? '', r.y + r.height / 2];
    })
  );
}

describe('Axis domain', () => {
  it('should tick the given domain across the chart scale’s range', async () => {
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'right', domain: [0, 20] },
    });

    await expect.poll(() => Object.keys(labelYs())).toContain('20');
    const ys = labelYs();
    expect(Object.keys(ys)).not.toContain('100');
    // Same span as the chart's own `[0, 100]`: bottom to top
    expect(ys['0']).toBeGreaterThan(ys['20']);
    expect(ys['0'] - ys['20']).toBeCloseTo(200, -1);
  });

  it('should follow an inverted chart range', async () => {
    render(TestHarness, {
      chartProps: { ...chartProps, yRange: ({ height }: { height: number }) => [0, height] },
      component: Axis,
      componentProps: { placement: 'right', domain: [0, 20] },
    });

    await expect.poll(() => Object.keys(labelYs())).toContain('20');
    const ys = labelYs();
    expect(Object.keys(ys)).not.toContain('100');
    expect(ys['0']).toBeLessThan(ys['20']);
  });
});
