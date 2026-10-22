import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Ellipse from './Ellipse.svelte';
import { isometric } from '$lib/views/isometric.js';

const data = [
  { x: 0, y: 0, value: 10 },
  { x: 10, y: 10, value: 40 },
  { x: 10, y: 0, value: 20 },
];

/** Where each ellipse lands on screen */
async function renderEllipses(props: Record<string, any>, chartProps: Record<string, any> = {}) {
  document.body.innerHTML = '';
  render(TestHarness, {
    chartProps: { data, x: 'x', y: 'y', width: 400, height: 300, view: isometric, ...chartProps },
    layerProps: { center: false },
    component: Ellipse,
    componentProps: { rx: 6, ry: 4, ...props },
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  return [...(chart.element() as HTMLElement).querySelectorAll('ellipse')].map((ellipse) => ({
    cx: Number(ellipse.getAttribute('cx')),
    top: ellipse.getBoundingClientRect().top,
  }));
}

describe('Ellipse on an isometric floor', () => {
  it('floats by a numeric `z` in pixel mode', async () => {
    const [flat] = await renderEllipses({ cx: 100, cy: 100 });
    const [raised] = await renderEllipses({ cx: 100, cy: 100, z: 40 });
    expect(raised.top).toBeLessThan(flat.top - 20);
  });

  it('stays put on a flat chart', async () => {
    const [ellipse] = await renderEllipses({ cx: 100, cy: 100, z: 40 }, { view: null });
    expect(ellipse.cx).toBe(100);
  });

  it("floats each by the chart's `z` in data mode, back to front", async () => {
    const flat = await renderEllipses({ cx: 'x', cy: 'y', z: 0 }, { z: 'value' });
    const raised = await renderEllipses({ cx: 'x', cy: 'y' }, { z: 'value' });
    expect(raised).toHaveLength(3);
    const tops = flat.map((ellipse) => ellipse.top);
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
    const rises = flat.map((ellipse, i) => ellipse.top - raised[i].top);
    expect(Math.min(...rises)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...rises)).toBeGreaterThan(20);
  });
});
