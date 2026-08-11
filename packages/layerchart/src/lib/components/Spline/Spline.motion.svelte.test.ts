import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';

// Count interpolator construction and invocation while keeping real behaviour.
const calls = { built: 0, invoked: 0 };
vi.mock('d3-interpolate-path', async (importOriginal) => {
  const actual = await importOriginal<typeof import('d3-interpolate-path')>();
  return {
    ...actual,
    interpolatePath: (a: any, b: any) => {
      calls.built++;
      const fn = actual.interpolatePath(a, b);
      return (t: number) => {
        calls.invoked++;
        return fn(t);
      };
    },
  };
});

import LineChart from '../charts/LineChart/LineChart.svelte';

function data(offset: number, n = 300) {
  return Array.from({ length: n }, (_, i) => ({
    date: new Date(Date.UTC(2024, 0, 1 + offset + i)),
    value: (i * 37 + offset) % 100,
  }));
}

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

/**
 * `Spline.base` renders `c.d` unless `isTweened` (which requires `motion`), so
 * building a path tween without `motion` does full `interpolatePath` work and
 * discards it. That was the dominant allocation in streaming charts — see the
 * `motion` gate in `Spline.shared.svelte.ts`.
 */
describe('Spline path tween is only built when `motion` is set', () => {
  beforeEach(() => {
    cleanup();
    calls.built = 0;
    calls.invoked = 0;
  });

  it('does not interpolate while streaming a chart with no motion', async () => {
    const props = { data: data(0), x: 'date', y: 'value', height: 300 };
    const { rerender } = render(LineChart, props);
    await frame();

    for (let i = 1; i <= 20; i++) {
      await rerender({ ...props, data: data(i) });
      await frame();
    }

    expect(calls.built).toBe(0);
    expect(calls.invoked).toBe(0);
  });
});
