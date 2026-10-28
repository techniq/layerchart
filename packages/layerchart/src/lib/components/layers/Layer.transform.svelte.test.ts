import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { scaleBand } from 'd3-scale';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { multiplyMatrix } from '$lib/utils/isometric.js';
import Cell from '../Cell/Cell.svelte';
import Rect from '../Rect/Rect.svelte';
import { isometric } from '$lib/views/isometric.js';

const data = [
  { x: 'a', y: 'p' },
  { x: 'b', y: 'q' },
];

describe('Layer transform', () => {
  it("doesn't remount its marks when `isometric` turns on and off", async () => {
    const chartProps = $state<Record<string, any>>({
      data,
      x: 'x',
      y: 'y',
      xScale: scaleBand(),
      yScale: scaleBand(),
      width: 400,
      height: 300,
      view: null,
    });
    render(TestHarness, {
      chartProps,
      layerProps: { center: false },
      component: Cell,
      componentProps: { x: 'x', y: 'y' },
    });

    const chart = () => document.querySelector(`[data-testid="${chartTestId}"]`)!;
    await vi.waitFor(() => expect(chart().querySelector('rect.lc-rect')).not.toBeNull());
    const before = chart().querySelector('rect.lc-rect')!;

    chartProps.view = isometric;
    await tick();
    await vi.waitFor(() =>
      expect(
        chart().querySelector('.lc-layout-svg-g-transform')?.getAttribute('transform')
      ).toMatch(/^matrix\(/)
    );
    expect(before.isConnected).toBe(true);

    chartProps.view = null;
    await tick();
    await vi.waitFor(() =>
      expect(
        chart().querySelector('.lc-layout-svg-g-transform')?.getAttribute('transform')
      ).toBeNull()
    );
    expect(before.isConnected).toBe(true);
  });

  it('centres on the floor — `center` composes with the view rather than replacing it', async () => {
    let ctx: ChartState<any, any, any> = null!;
    render(TestHarness, {
      chartProps: {
        data,
        x: 'x',
        y: 'y',
        xScale: scaleBand(),
        yScale: scaleBand(),
        width: 400,
        height: 300,
        view: isometric,
      },
      layerProps: { center: true },
      component: Cell,
      componentProps: { x: 'x', y: 'y' },
      oncontext: (c: any) => (ctx = c),
    });
    await vi.waitFor(() => expect(ctx?.layerMatrix()).not.toBeNull());

    const centred = ctx.layerMatrix({ center: true })!;
    const expected = multiplyMatrix(ctx.layerMatrix()!, {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: ctx.width / 2,
      f: ctx.height / 2,
    });
    for (const key of ['a', 'b', 'c', 'd', 'e', 'f'] as const) {
      expect(centred[key]).toBeCloseTo(expected[key]);
    }

    // And the layer draws exactly that
    const g = document.querySelector(`[data-testid="${chartTestId}"] .lc-layout-svg-g-transform`)!;
    const drawn = (g as SVGGElement).transform.baseVal.consolidate()!.matrix;
    for (const key of ['a', 'b', 'c', 'd', 'e', 'f'] as const) {
      expect(drawn[key]).toBeCloseTo(expected[key], 3);
    }
  });

  it('draws untransformed when the layer ignores the view', async () => {
    let ctx: ChartState<any, any, any> = null!;
    render(TestHarness, {
      chartProps: {
        data,
        x: 'x',
        y: 'y',
        xScale: scaleBand(),
        yScale: scaleBand(),
        width: 400,
        height: 300,
        view: isometric,
      },
      layerProps: { center: false },
      component: Cell,
      componentProps: { x: 'x', y: 'y' },
      oncontext: (c: any) => (ctx = c),
    });
    await vi.waitFor(() => expect(ctx?.layerMatrix()).not.toBeNull());
    expect(ctx.layerMatrix({ ignoreTransform: true })).toBeNull();
  });
});

describe('Html layer clip', () => {
  // A 200x150 chart whose plot area starts 40px in
  const padding = { top: 10, right: 10, bottom: 10, left: 40 };

  /** The element drawn at `x`, `y` from the chart's top-left */
  function hitAt(x: number, y: number) {
    const rect = document.querySelector(`[data-testid="${chartTestId}"]`)!.getBoundingClientRect();
    return document.elementFromPoint(rect.left + x, rect.top + y);
  }

  async function renderRect(transform: Record<string, any>, rectProps: Record<string, any>) {
    render(TestHarness, {
      chartProps: { width: 200, height: 150, padding, transform },
      layer: 'html',
      layerProps: { center: false },
      component: Rect,
      componentProps: { ...rectProps, class: 'clip-target' },
    });
    await vi.waitFor(() => expect(document.querySelector('.clip-target')).not.toBeNull());
  }

  // Queried each time, as the mark can remount while the transform settles
  const target = () => document.querySelector('.clip-target');

  it('draws what is laid out in the padding', async () => {
    await renderRect({ mode: 'canvas' }, { x: -40, y: 0, width: 40, height: 20 });
    expect(hitAt(20, 20)).toBe(target());
  });

  it("clips at the chart's edge when zoomed in, not at the scaled plot area", async () => {
    // Covers the plot area, so at 2x it reaches well past the chart's bottom and right
    await renderRect({ mode: 'canvas', initialScale: 2 }, { x: 0, y: 0, width: 150, height: 130 });
    await vi.waitFor(() =>
      expect((document.querySelector('.lc-layout-html') as HTMLElement).style.transform).toMatch(
        /^matrix\(2/
      )
    );

    expect(hitAt(100, 140)).toBe(target()); // in the bottom padding
    expect(hitAt(100, 160)).not.toBe(target()); // below the chart
  });
});
