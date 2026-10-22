import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Circle from './Circle.svelte';
import { isometric } from '$lib/views/isometric.js';

/** Where a pixel-mode circle lands on screen */
async function renderCircle(
  circleProps: Record<string, any>,
  chartProps: Record<string, any> = {}
) {
  document.body.innerHTML = '';
  render(TestHarness, {
    chartProps: { data: [], width: 400, height: 300, view: isometric, ...chartProps },
    layerProps: { center: false },
    component: Circle,
    componentProps: { cx: 100, cy: 100, r: 5, ...circleProps },
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  const circle = (chart.element() as HTMLElement).querySelector('circle')!;
  return { cx: Number(circle.getAttribute('cx')), top: circle.getBoundingClientRect().top };
}

describe('Circle in pixel mode on an isometric floor', () => {
  it('floats by a numeric `z`', async () => {
    const flat = await renderCircle({});
    const raised = await renderCircle({ z: 40 });
    expect(raised.top).toBeLessThan(flat.top - 20);
  });

  it('stays put on a flat chart', async () => {
    expect(await renderCircle({ z: 40 }, { view: null })).toMatchObject({ cx: 100 });
  });
});
