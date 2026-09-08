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
import TestHarness from '$lib/tests/TestHarness.svelte';
import Spline from './Spline.svelte';

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

/**
 * A style function splits a line into one path per run of matching style. Those runs move with
 * the data, but "the nth run of this style" is identity enough to tween across — without it a
 * line drawn with a `class` function animated not at all, while the same line drawn with a
 * static class animated normally.
 */
describe('Spline tweens style-split runs', () => {
  /** One line, dashed across the middle, at a height the `offset` shifts */
  const bridged = (offset: number) =>
    Array.from({ length: 6 }, (_, i) => ({
      date: new Date(Date.UTC(2024, i, 1)),
      value: 10 + i * 10 + offset,
      gap: i === 2 || i === 3,
    }));

  const harness = (motion?: any) => ({
    component: Spline,
    chartProps: { data: bridged(0), x: 'date', y: 'value', yDomain: [0, 200], height: 300 },
    componentProps: {
      motion,
      class: (d: { gap: boolean }) => (d.gap ? 'gap-run' : 'solid-run'),
    },
  });

  const dashed = () => document.querySelector('svg path.gap-run')?.getAttribute('d') ?? null;

  /** The dashed run's `d` on each of the next `n` frames */
  async function sample(n: number) {
    const seen: (string | null)[] = [];
    for (let i = 0; i < n; i++) {
      await frame();
      seen.push(dashed());
    }
    return seen;
  }

  beforeEach(() => cleanup());

  it('animates a style-split run across a data change', async () => {
    const props = harness({ type: 'tween', duration: 400 });
    const { rerender } = render(TestHarness, props as any);

    await expect.poll(dashed).not.toBeNull();
    // Let the initial grow-in finish, so what follows is only the data change
    await new Promise((r) => setTimeout(r, 500));
    const before = dashed();

    await rerender({
      ...props,
      chartProps: { ...props.chartProps, data: bridged(60) },
    } as any);

    const seen = await sample(8);
    // Interpolated, so the run passes through intermediate paths rather than snapping
    expect(new Set(seen).size).toBeGreaterThan(2);
    expect(seen[0]).not.toBe(before);

    // ...and lands on the target, which is where an unanimated run would have gone immediately
    await new Promise((r) => setTimeout(r, 600));
    const after = dashed();
    expect(after).not.toBe(before);
    await frame();
    expect(dashed()).toBe(after);
  });

  it('snaps without `motion`, as before', async () => {
    const props = harness();
    const { rerender } = render(TestHarness, props as any);

    await expect.poll(dashed).not.toBeNull();
    await rerender({
      ...props,
      chartProps: { ...props.chartProps, data: bridged(60) },
    } as any);

    expect(new Set(await sample(6)).size).toBe(1);
  });
});
