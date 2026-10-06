import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { scaleBand } from 'd3-scale';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { multiplyMatrix } from '$lib/utils/isometric.js';
import Cell from '../Cell/Cell.svelte';

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
      isometric: false,
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

    chartProps.isometric = true;
    await tick();
    await vi.waitFor(() =>
      expect(
        chart().querySelector('.lc-layout-svg-g-transform')?.getAttribute('transform')
      ).toMatch(/^matrix\(/)
    );
    expect(before.isConnected).toBe(true);

    chartProps.isometric = false;
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
        isometric: true,
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
        isometric: true,
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
