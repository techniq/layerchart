import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { scaleBand } from 'd3-scale';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Cell from '../Cell/Cell.svelte';

const data = [
  { x: 'a', y: 'p', value: 10 },
  { x: 'b', y: 'p', value: 40 },
  { x: 'a', y: 'q', value: 20 },
  { x: 'b', y: 'q', value: 30 },
];

/** Render a `Cell` per row and report what it drew */
async function renderCells(chartProps: Record<string, any> = {}, layerProps = {}) {
  render(TestHarness, {
    chartProps: {
      data,
      x: 'x',
      y: 'y',
      xScale: scaleBand(),
      yScale: scaleBand(),
      z: 'value',
      width: 400,
      height: 300,
      isometric: true,
      ...chartProps,
    },
    layerProps: { center: false, ...layerProps },
    component: Cell,
    componentProps: { x: 'x', y: 'y' },
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  const el = chart.element() as HTMLElement;
  return {
    boxes: el.querySelectorAll('.lc-rect-box').length,
    tops: [...el.querySelectorAll<SVGPathElement>('.lc-rect-top')],
    sides: el.querySelectorAll('.lc-rect-side').length,
    rects: el.querySelectorAll('rect.lc-rect').length,
  };
}

describe('Rect on an isometric floor', () => {
  it('stands each rect up into a box of its `z` height', async () => {
    const drawn = await renderCells();
    expect(drawn.boxes).toBe(4);
    expect(drawn.tops).toHaveLength(4);
    // Two sides face the viewer in the default view
    expect(drawn.sides).toBe(8);
    expect(drawn.rects).toBe(0);
  });

  it('stays flat on a flat chart', async () => {
    const drawn = await renderCells({ isometric: false });
    expect(drawn.boxes).toBe(0);
    expect(drawn.rects).toBe(4);
  });

  it('stays flat without a `z`', async () => {
    const drawn = await renderCells({ z: undefined });
    expect(drawn.boxes).toBe(0);
    expect(drawn.rects).toBe(4);
  });

  it('stays flat in a layer that ignores the view', async () => {
    const drawn = await renderCells({}, { ignoreTransform: true });
    expect(drawn.boxes).toBe(0);
    expect(drawn.rects).toBe(4);
  });

  it('draws nearer boxes after farther ones', async () => {
    const { tops } = await renderCells();
    // A box's lowest point on screen is its nearest corner on the floor, whatever its height —
    // lower is nearer, and must be painted later
    const nearest = tops.map((top) => top.closest('.lc-rect-box')!.getBoundingClientRect().bottom);
    expect(nearest).toEqual([...nearest].sort((a, b) => a - b));
  });

  it('raises each box by its own value', async () => {
    const { tops } = await renderCells();
    // Every footprint is the same size, so how far a top sits above the bottom of its box is its
    // height — and the four values differ
    const heights = tops.map((top) => {
      const group = top.closest('.lc-rect-box')!.getBoundingClientRect();
      return Math.round(group.bottom - top.getBoundingClientRect().bottom);
    });
    expect(new Set(heights).size).toBe(4);
  });
});
