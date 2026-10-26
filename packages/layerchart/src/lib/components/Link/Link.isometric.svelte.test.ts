import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Link from './Link.svelte';
import { isometric } from '$lib/views/isometric.js';

/** The link's path, and where its start lands on screen */
async function renderLink(linkProps: Record<string, any>, chartProps: Record<string, any> = {}) {
  document.body.innerHTML = '';
  render(TestHarness, {
    chartProps: { data: [], width: 400, height: 300, view: isometric, ...chartProps },
    layerProps: { center: false },
    component: Link,
    componentProps: { x1: 50, y1: 50, x2: 150, y2: 150, type: 'straight', ...linkProps },
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  const path = (chart.element() as HTMLElement).querySelector<SVGPathElement>('path.lc-link')!;
  const start = path.getPointAtLength(0);
  const end = path.getPointAtLength(path.getTotalLength());
  return { d: path.getAttribute('d'), start, end };
}

describe('Link on an isometric floor', () => {
  it('raises each end by `z1` / `z2`', async () => {
    const flat = await renderLink({});
    const raised = await renderLink({ z1: 40 });
    // The start moves, the end stays on the floor
    expect(
      Math.hypot(raised.start.x - flat.start.x, raised.start.y - flat.start.y)
    ).toBeGreaterThan(10);
    expect(raised.end.x).toBeCloseTo(flat.end.x, 3);
    expect(raised.end.y).toBeCloseTo(flat.end.y, 3);
  });

  it('resolves `z1` / `z2` per row through zScale', async () => {
    const data = [{ a: 10, b: 20, c: 60, d: 80, from: 0, to: 100 }];
    const chart = { data, x: 'a', y: 'b', zDomain: [0, 100], zRange: [0, 100] };
    const props = { data, x1: 'a', y1: 'b', x2: 'c', y2: 'd' };
    const flat = await renderLink(props, chart);
    const raised = await renderLink({ ...props, z1: 'from', z2: 'to' }, chart);
    expect(raised.start.x).toBeCloseTo(flat.start.x, 3);
    expect(Math.hypot(raised.end.x - flat.end.x, raised.end.y - flat.end.y)).toBeGreaterThan(10);
  });

  it('stays flat on a flat chart', async () => {
    const flat = await renderLink({}, { view: null });
    expect((await renderLink({ z1: 40, z2: 40 }, { view: null })).d).toBe(flat.d);
  });
});
