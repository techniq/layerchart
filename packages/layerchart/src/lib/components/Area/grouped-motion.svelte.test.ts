import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';

import TestHarness from '$lib/tests/TestHarness.svelte';
import Area from './Area.svelte';
import Spline from '../Spline/Spline.svelte';

/**
 * A mark grouped by `z` draws one path per group, and those paths used to be built straight from
 * the data on every change — `Spline` renders `seg.d` and `Area` renders `area.d`, neither of
 * which consulted the mark's single `tweenedPath`.  So `motion` animated an ungrouped mark and
 * did nothing at all once `z` (or the chart's `c`) split it.
 *
 * A tween caught between two shapes is the observable: sampling `d` every frame during a data
 * change gives one value if the path snapped, and a spread of them if it animated.
 */

const data = [
  { date: new Date('2024-01-01'), value: 10, group: 'a' },
  { date: new Date('2024-02-01'), value: 30, group: 'a' },
  { date: new Date('2024-03-01'), value: 20, group: 'a' },
  { date: new Date('2024-01-01'), value: 50, group: 'b' },
  { date: new Date('2024-02-01'), value: 40, group: 'b' },
  { date: new Date('2024-03-01'), value: 60, group: 'b' },
];

/** Same rows and groups, different values — enough movement to be visible mid-flight */
const movedData = data.map((d) => ({ ...d, value: 100 - d.value }));

const motion = { type: 'tween' as const, duration: 400 };

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
const settle = () => new Promise((r) => setTimeout(r, 700));

/**
 * Render, let the mount animation finish, then swap the data and watch one path for 12 frames.
 * `selector` picks which of a grouped mark's paths to follow.
 */
async function sampleDuringDataChange(options: {
  component: any;
  componentProps?: Record<string, any>;
  chartExtra?: Record<string, any>;
  selector: string;
}) {
  const { component, componentProps = {}, chartExtra = {}, selector } = options;
  const chart = { x: 'date', y: 'value', yDomain: [0, 100], ...chartExtra };

  const props = {
    chartProps: { data, ...chart },
    component,
    componentProps: { motion, ...componentProps },
  };

  const { rerender } = render(TestHarness, props);
  await expect.poll(() => document.querySelector(selector)).toBeTruthy();
  await settle();

  const d = () => document.querySelector(selector)?.getAttribute('d') ?? '';
  const before = d();

  await rerender({ ...props, chartProps: { data: movedData, ...chart } });

  const frames: string[] = [];
  for (let i = 0; i < 12; i++) {
    frames.push(d());
    await frame();
  }
  await settle();

  return {
    /** A tween starts where the old path was; a snap is already at the destination */
    startedFromPreviousPath: frames[0] === before,
    distinctFrames: new Set(frames).size,
    reachedNewPath: d() !== before,
  };
}

describe('marks grouped by `z` animate their paths', () => {
  beforeEach(cleanup);

  it('tweens each line of a grouped `Spline`', async () => {
    const result = await sampleDuringDataChange({
      component: Spline,
      chartExtra: { z: 'group' },
      selector: 'path',
    });

    expect(result.startedFromPreviousPath).toBe(true);
    expect(result.distinctFrames).toBeGreaterThan(1);
    expect(result.reachedNewPath).toBe(true);
  });

  it("tweens each group's fill in a grouped `Area`", async () => {
    const result = await sampleDuringDataChange({
      component: Area,
      chartExtra: { z: 'group' },
      selector: '.lc-area-path',
    });

    expect(result.startedFromPreviousPath).toBe(true);
    expect(result.distinctFrames).toBeGreaterThan(1);
    expect(result.reachedNewPath).toBe(true);
  });

  it("tweens each group's line in a grouped `Area`", async () => {
    const result = await sampleDuringDataChange({
      component: Area,
      componentProps: { line: true },
      chartExtra: { z: 'group' },
      selector: '.lc-area-line',
    });

    expect(result.startedFromPreviousPath).toBe(true);
    expect(result.distinctFrames).toBeGreaterThan(1);
    expect(result.reachedNewPath).toBe(true);
  });

  it('still tweens when ungrouped, the case that already worked', async () => {
    const result = await sampleDuringDataChange({
      component: Area,
      componentProps: { line: true },
      selector: '.lc-area-path',
    });

    expect(result.startedFromPreviousPath).toBe(true);
    expect(result.distinctFrames).toBeGreaterThan(1);
  });

  it('leaves grouped paths alone without `motion`', async () => {
    const result = await sampleDuringDataChange({
      component: Area,
      componentProps: { motion: undefined },
      chartExtra: { z: 'group' },
      selector: '.lc-area-path',
    });

    expect(result.distinctFrames).toBe(1);
    expect(result.startedFromPreviousPath).toBe(false);
    expect(result.reachedNewPath).toBe(true);
  });
});
