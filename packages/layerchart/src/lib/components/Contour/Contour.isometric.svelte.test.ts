import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import Contour from './Contour.svelte';

// A hill: highest in the middle of a 20 × 20 grid
const size = 20;
const values = Array.from({ length: size * size }, (_, i) => {
  const x = (i % size) - size / 2;
  const y = Math.floor(i / size) - size / 2;
  return 100 - Math.hypot(x, y) * 5;
});

/** Render the hill's contours and report what they drew */
async function renderHill(contourProps: Record<string, any> = {}, chartProps = {}) {
  let ctx: ChartState<any, any, any> = null!;
  render(TestHarness, {
    chartProps: {
      width: 400,
      height: 400,
      zDomain: [0, 100],
      zRange: [0, 80],
      isometric: true,
      ...chartProps,
    },
    layerProps: { center: false },
    component: Contour,
    componentProps: {
      data: values,
      width: size,
      height: size,
      thresholds: [20, 40, 60, 80],
      z: 'value',
      ...contourProps,
    },
    oncontext: (c: any) => (ctx = c),
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
  const el = page.getByTestId(chartTestId).element() as HTMLElement;
  await vi.waitFor(() =>
    expect(el.querySelectorAll('.lc-contour-band:not(.lc-path-side)').length).toBeGreaterThan(0)
  );
  return { ctx, el };
}

/** The `translate` a band's top is drawn at */
function shift(band: Element) {
  const match = band.getAttribute('transform')?.match(/translate\(([^,]+),([^)]+)\)/);
  return match ? { x: +match[1], y: +match[2] } : { x: 0, y: 0 };
}

describe('Contour on an isometric floor', () => {
  it('raises each band to its height, standing on the one below', async () => {
    const { ctx, el } = await renderHill();
    const bands = [...el.querySelectorAll('.lc-contour-band:not(.lc-path-side)')];
    expect(bands).toHaveLength(4);
    const lift = ctx.isometricLift!;
    for (const [i, threshold] of [20, 40, 60, 80].entries()) {
      const height = ctx.zScale(threshold);
      expect(shift(bands[i]).x).toBeCloseTo(lift.x * height);
      expect(shift(bands[i]).y).toBeCloseTo(lift.y * height);
    }
    // Every band shows sides, shaded by which way they face
    expect(el.querySelectorAll('.lc-path-side')).toHaveLength(4);
    expect(el.querySelectorAll('.lc-path-side-shade').length).toBeGreaterThan(4);
  });

  it('floats unfilled bands as lines in the bands’ colours, without sides', async () => {
    const { el } = await renderHill({ fill: 'none' });
    expect(el.querySelectorAll('.lc-path-side')).toHaveLength(0);
    const strokes = [...el.querySelectorAll('.lc-contour-band:not(.lc-path-side)')].map((b) =>
      b.getAttribute('stroke')
    );
    expect(new Set(strokes).size).toBe(4);
    expect(shift(el.querySelector('.lc-contour-band:not(.lc-path-side)')!).y).not.toBe(0);
  });

  it('lies flat on a flat chart', async () => {
    const { el } = await renderHill({}, { isometric: false });
    expect(el.querySelectorAll('.lc-path-side')).toHaveLength(0);
    for (const band of el.querySelectorAll('.lc-contour-band:not(.lc-path-side)'))
      expect(shift(band)).toEqual({ x: 0, y: 0 });
  });
});
