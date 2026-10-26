import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Image from './Image.svelte';
import { isometric } from '$lib/views/isometric.js';

const href =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E';

const data = [
  { x: 0, y: 0, value: 10 },
  { x: 10, y: 10, value: 40 },
  { x: 10, y: 0, value: 20 },
];

/** Render `Image` on a floor and report each `<image>`'s position and where it lands on screen */
async function renderImages(imageProps: Record<string, any>, chartProps: Record<string, any> = {}) {
  render(TestHarness, {
    chartProps: {
      data,
      x: 'x',
      y: 'y',
      z: 'value',
      width: 400,
      height: 300,
      view: isometric,
      ...chartProps,
    },
    layerProps: { center: false },
    component: Image,
    componentProps: { href, width: 10, height: 10, ...imageProps },
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  return [...(chart.element() as HTMLElement).querySelectorAll('image')].map((image) => ({
    x: Number(image.getAttribute('x')),
    y: Number(image.getAttribute('y')),
    top: image.getBoundingClientRect().top,
  }));
}

describe('Image on an isometric floor', () => {
  it('raises a pixel-mode image by a numeric `z`', async () => {
    const [flat] = await renderImages({ x: 100, y: 100 });
    document.body.innerHTML = '';
    const [raised] = await renderImages({ x: 100, y: 100, z: 40 });
    expect(raised.top).toBeLessThan(flat.top - 20);
  });

  it('stays put on a flat chart', async () => {
    const [image] = await renderImages({ x: 100, y: 100, z: 40 }, { view: null });
    expect(image).toMatchObject({ x: 95, y: 95 });
  });

  it("raises each image in data mode by the chart's `z`, drawn back to front", async () => {
    // `z={0}` stands each on the floor, in the same order
    const flat = await renderImages({ x: 'x', y: 'y', z: 0 });
    document.body.innerHTML = '';
    const raised = await renderImages({ x: 'x', y: 'y' });
    expect(raised).toHaveLength(3);
    // Farther is higher on screen, so back to front is top to bottom on the floor
    const tops = flat.map((image) => image.top);
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
    const rises = flat.map((image, i) => image.top - raised[i].top);
    expect(Math.min(...rises)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...rises)).toBeGreaterThan(20);
  });
});
