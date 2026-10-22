import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Circle from '../Circle/Circle.svelte';
import Group from './Group.svelte';
import { isometric } from '$lib/views/isometric.js';

/** Where a circle drawn in the group lands on screen */
async function renderGroup(groupProps: Record<string, any>, chartProps: Record<string, any> = {}) {
  document.body.innerHTML = '';
  render(TestHarness, {
    chartProps: {
      data: [{ value: 40 }],
      z: 'value',
      width: 400,
      height: 300,
      view: isometric,
      ...chartProps,
    },
    layerProps: { center: false },
    component: Group,
    componentProps: groupProps,
    childComponents: [{ component: Circle, props: { cx: 0, cy: 0, r: 5 } }],
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  return (chart.element() as HTMLElement).querySelector('circle')!.getBoundingClientRect().top;
}

describe('Group on an isometric floor', () => {
  it('raises everything in it by a numeric `z`', async () => {
    const flat = await renderGroup({ x: 100, y: 100 });
    const raised = await renderGroup({ x: 100, y: 100, z: 40 });
    expect(raised).toBeLessThan(flat - 20);
  });

  it('raises by `z` alone, without `x` or `y`', async () => {
    const flat = await renderGroup({});
    const raised = await renderGroup({ z: 40 });
    expect(raised).toBeLessThan(flat - 20);
  });

  it("isn't raised by the chart's `z` in data mode", async () => {
    const chart = { data: [{ x: 5, y: 5, value: 40 }], x: 'x', y: 'y' };
    const floor = await renderGroup({ x: 'x', y: 'y', z: 0 }, chart);
    expect(await renderGroup({ x: 'x', y: 'y' }, chart)).toBeCloseTo(floor, 3);
  });

  it('stays put on a flat chart', async () => {
    const flat = await renderGroup({ x: 100, y: 100 }, { view: null });
    expect(await renderGroup({ x: 100, y: 100, z: 40 }, { view: null })).toBeCloseTo(flat, 3);
  });
});
