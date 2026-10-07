import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { scaleBand } from 'd3-scale';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Cell from '../Cell/Cell.svelte';
import Rect from './Rect.svelte';

const data = [
  { x: 'a', y: 'p', value: 10 },
  { x: 'b', y: 'p', value: 40 },
  { x: 'a', y: 'q', value: 20 },
  { x: 'b', y: 'q', value: 30 },
];

const cellChart = {
  data,
  x: 'x',
  y: 'y',
  xScale: scaleBand(),
  yScale: scaleBand(),
  z: 'value',
  width: 400,
  height: 300,
};

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
    // A box's lowest point on screen is its nearest corner, so lower must be painted later
    const nearest = tops.map((top) => top.closest('.lc-rect-box')!.getBoundingClientRect().bottom);
    expect(nearest).toEqual([...nearest].sort((a, b) => a - b));
  });

  it('raises each box by its own value', async () => {
    const { tops } = await renderCells();
    // Equal footprints, so a top's distance above its box's bottom is its height
    const heights = tops.map((top) => {
      const group = top.closest('.lc-rect-box')!.getBoundingClientRect();
      return Math.round(group.bottom - top.getBoundingClientRect().bottom);
    });
    expect(new Set(heights).size).toBe(4);
  });

  it('shades the sides facing the viewer, not the top', async () => {
    render(TestHarness, {
      chartProps: { ...cellChart, isometric: true },
      layerProps: { center: false },
      component: Cell,
      componentProps: { x: 'x', y: 'y', fill: 'red' },
    });
    const el = page.getByTestId(chartTestId).element() as HTMLElement;
    await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
    // An overlay per side, which every browser draws, unlike a filter
    const sides = el.querySelectorAll('.lc-rect-side').length;
    expect(sides).toBeGreaterThan(0);
    expect(el.querySelectorAll('.lc-rect-shade')).toHaveLength(sides);
  });

  it('leaves the sides flat with `shade={false}`', async () => {
    render(TestHarness, {
      chartProps: { ...cellChart, isometric: true },
      layerProps: { center: false },
      component: Cell,
      componentProps: { x: 'x', y: 'y', shade: false },
    });
    const el = page.getByTestId(chartTestId).element() as HTMLElement;
    await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
    expect(el.querySelectorAll('.lc-rect-side').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('.lc-rect-shade')).toHaveLength(0);
  });
});

describe('Rect in pixel mode on an isometric floor', () => {
  async function renderRect(rectProps: Record<string, any>, chartProps: Record<string, any> = {}) {
    render(TestHarness, {
      chartProps: { ...cellChart, isometric: true, ...chartProps },
      layerProps: { center: false },
      component: Rect,
      componentProps: { x: 20, y: 30, width: 100, height: 60, ...rectProps },
    });
    const chart = page.getByTestId(chartTestId);
    await expect.element(chart).toBeInTheDocument();
    return chart.element() as HTMLElement;
  }

  it('stands up into a box by a numeric `z`', async () => {
    const el = await renderRect({ z: 40 });
    expect(el.querySelectorAll('.lc-rect-box')).toHaveLength(1);
    expect(el.querySelectorAll('.lc-rect-top')).toHaveLength(1);
    expect(el.querySelectorAll('rect.lc-rect')).toHaveLength(0);
  });

  it('stays flat without one, and ignores the chart `z`', async () => {
    const el = await renderRect({});
    expect(el.querySelectorAll('.lc-rect-box')).toHaveLength(0);
    expect(el.querySelectorAll('rect.lc-rect')).toHaveLength(1);
  });

  it('stays flat on a flat chart', async () => {
    const el = await renderRect({ z: 40 }, { isometric: false });
    expect(el.querySelectorAll('.lc-rect-box')).toHaveLength(0);
    expect(el.querySelectorAll('rect.lc-rect')).toHaveLength(1);
  });

  it('stands a rect with no depth up into a single wall', async () => {
    // Along the floor's far edge: one side faces the viewer, the other away, and there's no top
    const el = await renderRect({ x: 0, y: 0, width: 200, height: 0, z: 40 });
    expect(el.querySelectorAll('.lc-rect-side')).toHaveLength(1);
    expect(el.querySelectorAll('.lc-rect-top')).toHaveLength(0);
  });

  it('floats between `[start, end]`', async () => {
    const measure = async (z: any) => {
      const screen = render(TestHarness, {
        chartProps: { ...cellChart, isometric: true },
        layerProps: { center: false },
        component: Rect,
        componentProps: { x: 20, y: 30, width: 100, height: 60, z },
      });
      await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
      const el = page.getByTestId(chartTestId).element() as HTMLElement;
      const box = el.querySelector('.lc-rect-box')!.getBoundingClientRect();
      const top = el.querySelector('.lc-rect-top')!.getBoundingClientRect();
      screen.unmount();
      return { height: box.bottom - top.bottom, top: top.top };
    };
    const standing = await measure(40);
    const floating = await measure([20, 40]);
    // The same top, on a box half as tall
    expect(floating.top).toBeCloseTo(standing.top, 0);
    expect(floating.height).toBeCloseTo(standing.height / 2, 0);
  });

  it('stacks boxes on the same footprint bottom up', async () => {
    const stacked = [
      { x: 'a', y: 'p', range: [20, 40] },
      { x: 'a', y: 'p', range: [0, 20] },
    ];
    render(TestHarness, {
      chartProps: {
        ...cellChart,
        data: stacked,
        z: (d: any) => d.range,
        zDomain: [0, 40],
        zRange: [0, 80],
        isometric: true,
      },
      layerProps: { center: false },
      component: Cell,
      componentProps: { x: 'x', y: 'y' },
    });
    await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
    const el = page.getByTestId(chartTestId).element() as HTMLElement;
    const tops = [...el.querySelectorAll('.lc-rect-top')].map((t) => t.getBoundingClientRect().top);
    // The lower box first, the upper one (higher on screen) over it
    expect(tops[0]).toBeGreaterThan(tops[1]);
  });

  it('eases to a new height with `motion`, like its other dimensions', async () => {
    const props = (z: number) => ({
      chartProps: { ...cellChart, isometric: true },
      layerProps: { center: false },
      component: Rect,
      componentProps: {
        x: 20,
        y: 30,
        width: 100,
        height: 60,
        z,
        motion: { type: 'tween', duration: 300 },
      },
    });
    const screen = render(TestHarness, props(20));
    await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
    const el = page.getByTestId(chartTestId).element() as HTMLElement;
    const top = () => el.querySelector('.lc-rect-top')!.getBoundingClientRect().top;
    const before = top();
    await screen.rerender(props(80));
    // Partway up, then there
    await vi.waitFor(() => {
      expect(top()).toBeLessThan(before - 1);
    });
    const partway = top();
    await vi.waitFor(() => expect(top()).toBeLessThan(partway - 1));
  });
});
