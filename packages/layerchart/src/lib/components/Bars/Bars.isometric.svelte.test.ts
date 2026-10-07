import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { scaleBand, scaleOrdinal } from 'd3-scale';

import MarkHarness from '$lib/tests/MarkHarness.svelte';
import { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import Bars from './Bars.svelte';

// Two stacks of two, in rows `p` and `q`
const data = [
  { x: 'a', row: 'p', fruit: 'apples', value: 2 },
  { x: 'a', row: 'p', fruit: 'pears', value: 3 },
  { x: 'b', row: 'q', fruit: 'apples', value: 4 },
  { x: 'b', row: 'q', fruit: 'pears', value: 1 },
];

async function renderBars() {
  let ctx: ChartState<any, any, any> = null!;
  render(MarkHarness, {
    chartProps: {
      data,
      x: 'x',
      xScale: scaleBand(),
      y: 'row',
      yScale: scaleBand(),
      z: 'value',
      valueAxis: 'z',
      zRange: [0, 100],
      c: 'fruit',
      cScale: scaleOrdinal(),
      cRange: ['red', 'blue'],
      width: 400,
      height: 300,
      isometric: true,
    },
    layerProps: { center: false },
    component: Bars,
    oncontext: (c: any) => (ctx = c),
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
  const el = page.getByTestId(chartTestId).element() as HTMLElement;
  await vi.waitFor(() => expect(el.querySelectorAll('.lc-rect-box')).toHaveLength(4));
  return { ctx, el };
}

describe('Bars with values along `z`', () => {
  it('stacks heights per `x` and `y` row, the domain reaching the tallest stack', async () => {
    const { ctx } = await renderBars();
    expect(ctx.valueAxis).toBe('z');
    expect(ctx.zScale.domain()).toEqual([0, 5]);
  });

  it('stands each bar on its band cell, each stack drawn bottom up', async () => {
    const { el } = await renderBars();
    const boxes = [...el.querySelectorAll('.lc-rect-box')];
    const tops = boxes.map((box) => box.querySelector('.lc-rect-top')!.getBoundingClientRect());
    // Two per stack, in order: the lower one first, its top lower on screen
    for (const i of [0, 2]) {
      expect(Math.round(tops[i].left)).toBe(Math.round(tops[i + 1].left));
      expect(tops[i].top).toBeGreaterThan(tops[i + 1].top);
    }
  });

  it("gives every mark a row's height in its stack", async () => {
    const { ctx } = await renderBars();
    // Pears stand on apples (2 of 5, then 3 more) — on a 0..100 range
    const pears = data[1];
    const [base, top] = ctx.heightOf(pears);
    expect(base).toBeCloseTo(40);
    expect(top).toBeCloseTo(100);
    // A mark's own `z` overrides it: a number in pixels
    expect(ctx.heightOf(pears, 10)).toEqual([0, 10]);
  });
});
