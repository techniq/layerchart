import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import type { ChartState } from './chart.svelte.js';
import ManyMarksHarness from './__fixtures__/ManyMarksHarness.svelte';

/** Mount `count` marks, each with its own two points, once the domain covers all of them */
async function mountMarks(count: number) {
  let ctx: ChartState<any, any, any> | undefined;
  render(ManyMarksHarness, {
    count,
    x: (d: { x: number }) => d.x,
    oncontext: (c: ChartState<any, any, any>) => (ctx = c),
  });
  await expect.poll(() => ctx?.xDomain?.[1]).toBe(count);
  return ctx!;
}

/** How often the registered marks have changed, as the chart's deriveds see it */
const markInfosVersion = (ctx: ChartState<any, any, any>) =>
  (ctx as unknown as { _markInfosVersion: number })._markInfosVersion;

describe('mark registration', () => {
  it('invalidates the domains once for marks that mount together, not once per mark', async () => {
    // Each bump marks every mounted mark's scale reads dirty, so one per mark is O(N²)
    const ctx = await mountMarks(200);
    expect(markInfosVersion(ctx)).toBeLessThan(5);
  });

  it('still includes every mark in the domain, and drops them on unmount', async () => {
    const ctx = await mountMarks(50);
    expect(ctx.xDomain).toEqual([0, 50]);
    const before = markInfosVersion(ctx);

    await page.getByTestId('toggle-marks').click();

    await expect.poll(() => ctx.xDomain?.[1]).not.toBe(50);
    expect(markInfosVersion(ctx) - before).toBeLessThan(5);
  });

  it('has every mark in the domain as soon as a synchronous mount returns', () => {
    // Nothing between the mount and the next microtask may see a chart missing its marks — code
    // that measures or exports a chart right after `mount()`/`flushSync()` reads it there
    let ctx: ChartState<any, any, any> | undefined;
    render(ManyMarksHarness, {
      count: 2,
      x: (d: { x: number }) => d.x,
      oncontext: (c: ChartState<any, any, any>) => (ctx = c),
    });
    expect(ctx!.xDomain).toEqual([0, 2]);
  });

  it('starts domain motion at the domain the marks give, when only the marks carry data', async () => {
    // Domain motion takes its first domain without animating.  Seen before the marks register it
    // is `[null, null]`, which the spring can't ease out of
    let ctx: ChartState<any, any, any> | undefined;
    render(ManyMarksHarness, {
      count: 10,
      x: (d: { x: number }) => d.x,
      motion: { type: 'spring' },
      oncontext: (c: ChartState<any, any, any>) => (ctx = c),
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(ctx!.xDomain).toEqual([0, 10]);
  });
});
