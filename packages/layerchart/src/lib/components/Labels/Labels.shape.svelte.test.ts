import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import MarkHarness from '$lib/tests/MarkHarness.svelte';
import Labels from './Labels.svelte';

/** Three layers of constant height (10, 20, 30) over 0–10: bands 0–10, 10–30 and 30–60 when stacked */
const wide = Array.from({ length: 11 }, (_, x) => ({ x, a: 10, b: 20, c: 30 }));
const long = wide.flatMap(({ x, ...values }) =>
  Object.entries(values).map(([key, value]) => ({ x, key, value }))
);

const chart = { x: 'x', xDomain: [0, 10], yDomain: [0, 60], width: 400, height: 300 };

/** Render, and wait for the labels (`layout="shape"` loads its code on demand) */
async function labelsOf(chartProps: Record<string, any>, labelsProps: Record<string, any> = {}) {
  const { container } = render(MarkHarness, {
    chartProps: { ...chart, ...chartProps },
    component: Labels,
    componentProps: { layout: 'shape', ...labelsProps },
  });
  await vi.waitFor(() =>
    expect(container.querySelectorAll('[data-layout=shape]').length).toBeGreaterThan(0)
  );
  return Object.fromEntries(
    [...container.querySelectorAll('[data-layout=shape]')].map((text) => [
      text.textContent,
      { x: Number(text.getAttribute('x')), y: Number(text.getAttribute('y')) },
    ])
  );
}

/** A value's position on the 300px tall y axis (0–60) */
const yAt = (value: number) => 300 - (value / 60) * 300;

describe('Labels layout="shape" on areas', () => {
  it("labels each series' band, within it", async () => {
    const labels = await labelsOf({
      data: wide,
      series: [{ key: 'a' }, { key: 'b' }, { key: 'c' }],
      seriesLayout: 'stack',
    });
    expect(Object.keys(labels)).toEqual(['a', 'b', 'c']);
    expect(labels.a.y).toBeCloseTo(yAt(5), 0);
    expect(labels.b.y).toBeCloseTo(yAt(20), 0);
    expect(labels.c.y).toBeCloseTo(yAt(45), 0);
  });

  it("labels each `c` category's band, when the rows name their layers", async () => {
    const labels = await labelsOf({ data: long, y: 'value', c: 'key', seriesLayout: 'stack' });
    expect(Object.keys(labels)).toEqual(['a', 'b', 'c']);
    expect(labels.a.y).toBeCloseTo(yAt(5), 0);
    expect(labels.b.y).toBeCloseTo(yAt(20), 0);
    expect(labels.c.y).toBeCloseTo(yAt(45), 0);
  });

  it("labels each overlapping category's area, from the baseline", async () => {
    const labels = await labelsOf({ data: long, y: 'value', c: 'key', seriesLayout: 'overlap' });
    // Each area reaches down to 0 (so the labels center in 0–10, 0–20 and 0–30)
    expect(labels.a.y).toBeCloseTo(yAt(5), 0);
    expect(labels.b.y).toBeCloseTo(yAt(10), 0);
    expect(labels.c.y).toBeCloseTo(yAt(15), 0);
  });
});
