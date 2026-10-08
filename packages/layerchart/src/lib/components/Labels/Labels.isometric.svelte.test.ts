import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import MarkHarness from '$lib/tests/MarkHarness.svelte';
import { chartTestId } from '$lib/tests/TestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import Labels from './Labels.svelte';
import { isometric } from '$lib/views/isometric.js';

const data = [{ x: 3, y: 4, z: 5 }];

describe('Labels on an isometric floor', () => {
  it("floats each label with its point, at the chart's `z`", async () => {
    let ctx: ChartState<any, any, any> = null!;
    const labelAt = async (chartProps: Record<string, any>) => {
      const screen = render(MarkHarness, {
        chartProps: {
          data,
          x: 'x',
          y: 'y',
          xDomain: [0, 10],
          yDomain: [0, 10],
          zDomain: [0, 10],
          zRange: [0, 100],
          width: 400,
          height: 300,
          view: isometric,
          ...chartProps,
        },
        layerProps: { center: false },
        component: Labels,
        componentProps: { placement: 'center', value: 'z' },
        oncontext: (c: any) => (ctx = c),
      });
      const el = page.getByTestId(chartTestId);
      await expect.element(el).toBeInTheDocument();
      await vi.waitFor(() =>
        expect((el.element() as HTMLElement).querySelector('text')).toBeTruthy()
      );
      const text = (el.element() as HTMLElement).querySelector('text')!;
      const point = { x: +text.getAttribute('x')!, y: +text.getAttribute('y')! };
      screen.unmount();
      return point;
    };
    const floor = await labelAt({});
    const raised = await labelAt({ z: 'z' });
    const lift = ctx.isometricLift!;
    // Raised by zScale(5) = 50
    expect(raised.x - floor.x).toBeCloseTo(lift.x * 50);
    expect(raised.y - floor.y).toBeCloseTo(lift.y * 50);
  });
});
