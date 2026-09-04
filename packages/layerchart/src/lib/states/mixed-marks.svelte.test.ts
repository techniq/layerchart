import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import MixedMarksHarness from '$lib/tests/MixedMarksHarness.svelte';
import type { ChartState } from './chart.svelte.js';

/** Long rows — `c` names the layers, so a bare `Bars` stacks them */
const data = [
  { month: 'Jan', fruit: 'apples', value: 320 },
  { month: 'Jan', fruit: 'bananas', value: 180 },
  { month: 'Feb', fruit: 'apples', value: 280 },
  { month: 'Feb', fruit: 'bananas', value: 220 },
];

/** Belongs to the month rather than any fruit, so it's the line's own data */
const targets = [
  { month: 'Jan', target: 800 },
  { month: 'Feb', target: 1250 },
];

async function renderMixed(splineProps: Record<string, any>) {
  let ctx: ChartState<any, any, any> | undefined;
  render(MixedMarksHarness, {
    chartProps: { data, x: 'month', y: 'value', c: 'fruit', bandPadding: 0.3, width: 400, height: 300 },
    splineProps,
    oncontext: (c: any) => (ctx = c),
  } as any);
  await vi.waitFor(() => expect(ctx).toBeDefined());
  await vi.waitFor(() => expect(document.querySelectorAll('.lc-bar').length).toBe(4));
  return ctx!;
}

describe('mixed marks over a stack', () => {
  it('should register a bare `Bars`, which names nothing but the stack it draws', async () => {
    const ctx = await renderMixed({ data: targets, y: 'target' });

    // Reading the chart's own data and colour leaves every other `MarkInfo` field empty, and a
    // mark whose info looks empty is dropped — the domain would then miss the stack entirely
    const marks = (ctx as any)._markInfos.map((m: any) => m.info.stacks);
    expect(marks).toContain(true);
  });

  it('should cover both the stack and a line drawn beside it', async () => {
    const ctx = await renderMixed({ data: targets, y: 'target' });

    // The stack tops out at 500, the target line at 1250 — the scale has to hold both
    expect(ctx.yDomain).toEqual([0, 1250]);
  });
});
