import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Group from '../Group/Group.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { isometric } from '$lib/views/isometric.js';

async function chartState(chartProps: Record<string, any>) {
  document.body.innerHTML = '';
  let state = null as ChartState<any, any, any> | null;
  render(TestHarness, {
    chartProps: { data: [], width: 400, height: 300, ...chartProps },
    component: Group,
    oncontext: (ctx) => (state = ctx),
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  return state!;
}

describe('ChartState.backToFront', () => {
  const points = [
    { name: 'near', at: [0, 300] as [number, number] },
    { name: 'far', at: [400, 0] as [number, number] },
    { name: 'middle', at: [200, 150] as [number, number] },
  ];

  it('puts nearer items last on an isometric floor', async () => {
    const ctx = await chartState({ view: isometric({ rotate: -45 }) });
    const m = ctx.isometricMatrix!;
    const depth = ([x, y]: [number, number]) => m.b * x + m.d * y;
    const ordered = ctx.backToFront(points, (p) => p.at);
    const depths = ordered.map((p) => depth(p.at));
    expect(depths).toEqual([...depths].sort((a, b) => a - b));
    // A copy, leaving the items as given
    expect(points.map((p) => p.name)).toEqual(['near', 'far', 'middle']);
  });

  it('keeps the given order on a flat chart', async () => {
    const ctx = await chartState({});
    expect(ctx.backToFront(points, (p) => p.at).map((p) => p.name)).toEqual([
      'near',
      'far',
      'middle',
    ]);
  });
});
