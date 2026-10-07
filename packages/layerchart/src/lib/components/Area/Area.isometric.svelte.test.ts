import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { scaleBand } from 'd3-scale';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { pathRings } from '$lib/utils/path.js';
import Area from './Area.svelte';
import Spline from '../Spline/Spline.svelte';

const data = [
  { x: 0, row: 'a', value: 2 },
  { x: 5, row: 'a', value: 8 },
  { x: 10, row: 'a', value: 4 },
];

/** Render `component` on an isometric chart whose `z` is each point's value */
async function renderRaised(component: any, chartProps: Record<string, any> = {}) {
  let ctx: ChartState<any, any, any> = null!;
  render(TestHarness, {
    chartProps: {
      data,
      x: 'x',
      y: 'row',
      yScale: scaleBand(),
      z: 'value',
      zDomain: [0, 10],
      zRange: [0, 50],
      width: 400,
      height: 300,
      isometric: true,
      ...chartProps,
    },
    layerProps: { center: false },
    component,
    oncontext: (c: any) => (ctx = c),
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
  const path = (page.getByTestId(chartTestId).element() as HTMLElement).querySelector(
    'path.lc-path'
  )!;
  return { ctx, points: pathRings(path.getAttribute('d')!).flat() };
}

/** Where `d` is drawn on the flat plot — on the floor, then raised by its height */
function at(ctx: ChartState<any, any, any>, d: (typeof data)[number], raised = true) {
  const x = ctx.xScale(d.x);
  const y = ctx.yScale(d.row) + ctx.yScale.bandwidth!() / 2;
  const h = raised ? ctx.zScale(d.value) : 0;
  return [x + ctx.isometricLift!.x * h, y + ctx.isometricLift!.y * h];
}

const near = (points: number[][], [x, y]: number[]) =>
  points.some(([px, py]) => Math.abs(px - x) < 0.01 && Math.abs(py - y) < 0.01);

describe('Area and Spline with heights on an isometric floor', () => {
  it("stands an area up as a curtain, from the floor to each point's height", async () => {
    const { ctx, points } = await renderRaised(Area);
    for (const d of data) {
      expect(near(points, at(ctx, d, false))).toBe(true);
      expect(near(points, at(ctx, d))).toBe(true);
    }
  });

  it('runs a line through each point at its height', async () => {
    const { ctx, points } = await renderRaised(Spline);
    for (const d of data) expect(near(points, at(ctx, d))).toBe(true);
  });

  it('lies flat on a flat chart', async () => {
    const { ctx, points } = await renderRaised(Spline, { isometric: false });
    expect(points[0][1]).toBeCloseTo(ctx.yScale('a') + ctx.yScale.bandwidth!() / 2);
  });
});
