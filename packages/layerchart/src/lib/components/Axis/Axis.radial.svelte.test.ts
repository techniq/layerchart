import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '$lib/tests/TestHarness.svelte';
import Axis from './Axis.svelte';

/** Tick labels an `angle` axis draws on a radial chart of the given size */
async function angleLabels(width: number, height: number) {
  const screen = render(TestHarness, {
    chartProps: { xDomain: [0, 200], yDomain: [0, 10], radial: true, width, height },
    component: Axis,
    componentProps: { placement: 'angle' },
  });
  await expect
    .poll(() => document.querySelectorAll('.lc-axis-tick-label').length)
    .toBeGreaterThan(0);
  const labels = Array.from(document.querySelectorAll('.lc-axis-tick-label')).map(
    (el) => el.textContent?.trim() ?? ''
  );
  screen.unmount();
  return labels;
}

describe('Axis angle placement', () => {
  it('keeps its ticks as the chart widens — the circle is sized by its radius', async () => {
    const narrow = await angleLabels(400, 300);
    const wide = await angleLabels(1200, 300);
    expect(wide).toEqual(narrow);
  });

  it('adds ticks as the circle grows', async () => {
    const small = await angleLabels(800, 200);
    const large = await angleLabels(800, 800);
    expect(large.length).toBeGreaterThan(small.length);
  });
});
