import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { scaleBand } from 'd3-scale';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { pathRings } from '$lib/utils/path.js';
import Area from './Area.svelte';
import Spline from '../Spline/Spline.svelte';
import { isometric } from '$lib/views/isometric.js';

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
      view: isometric,
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
    const { ctx, points } = await renderRaised(Spline, { view: null });
    expect(points[0][1]).toBeCloseTo(ctx.yScale('a') + ctx.yScale.bandwidth!() / 2);
  });

  for (const [name, component] of [
    ['Area', Area],
    ['Spline', Spline],
  ] as const) {
    it(`follows the view as it turns at once with \`motion\` (${name})`, async () => {
      const props = (rotate: number) => ({
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
          view: isometric({ rotate, tilt: 60 }),
        },
        layerProps: { center: false },
        component,
        componentProps: { motion: { type: 'tween', duration: 1000 } },
      });
      const screen = render(TestHarness, props(-45));
      await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
      const el = page.getByTestId(chartTestId).element() as HTMLElement;
      const d = () => el.querySelector('path.lc-path')!.getAttribute('d');
      await new Promise((resolve) => setTimeout(resolve, 1200));

      await screen.rerender(props(30));
      await new Promise((resolve) => setTimeout(resolve, 100));
      const turned = d();
      // Easing would still be on its way there
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(d()).toEqual(turned);
    });
  }
});
