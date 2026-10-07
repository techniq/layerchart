import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import Line from './Line.svelte';

const data = [{ x: 3, y: 4, z: 5 }];

describe('Line on an isometric floor', () => {
  it('raises each end by its height — a stem from the floor up to a point', async () => {
    let ctx: ChartState<any, any, any> = null!;
    render(TestHarness, {
      chartProps: {
        data,
        x: 'x',
        y: 'y',
        z: 'z',
        xDomain: [0, 10],
        yDomain: [0, 10],
        zDomain: [0, 10],
        zRange: [0, 100],
        width: 400,
        height: 300,
        isometric: true,
      },
      layerProps: { center: false },
      component: Line,
      componentProps: { x1: 'x', y1: 'y', x2: 'x', y2: 'y', z2: 'z' },
      oncontext: (c: any) => (ctx = c),
    });
    await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
    await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
    const line = (page.getByTestId(chartTestId).element() as HTMLElement).querySelector('line')!;
    const lift = ctx.isometricLift!;
    const [fx, fy] = [ctx.xScale(3), ctx.yScale(4)];
    // The start on the floor, the end raised by zScale(5) = 50
    expect(+line.getAttribute('x1')!).toBeCloseTo(fx);
    expect(+line.getAttribute('y1')!).toBeCloseTo(fy);
    expect(+line.getAttribute('x2')!).toBeCloseTo(fx + lift.x * 50);
    expect(+line.getAttribute('y2')!).toBeCloseTo(fy + lift.y * 50);
  });
});
