import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleUtc } from 'd3-scale';
import { utcDay, utcMonth } from 'd3-time';

import TestHarness from '$lib/tests/TestHarness.svelte';
import Axis from './Axis.svelte';

function labels() {
  return Array.from(document.querySelectorAll('.lc-axis-tick-label')).map(
    (el) => el.textContent?.trim() ?? ''
  );
}

/** A row per UTC day from `start`, `count` days long */
function days(start: string, count: number) {
  const first = new Date(start);
  return Array.from({ length: count }, (_, i) => ({ date: utcDay.offset(first, i), value: i }));
}

describe('Axis with an interval', () => {
  it('should keep a coarser last tick that is inside the domain', async () => {
    // Jan 1 – Mar 10, ticked by month: Mar 1 still has bars after it
    render(TestHarness, {
      chartProps: {
        data: days('2024-01-01T00:00:00Z', 70),
        x: 'date',
        xScale: scaleUtc(),
        xInterval: utcDay,
        y: 'value',
        width: 600,
        height: 100,
      },
      component: Axis,
      componentProps: {
        placement: 'bottom',
        ticks: { interval: utcMonth },
        format: { type: 'month', options: { variant: 'short' } },
      },
    });

    await expect.poll(() => labels()).toContain('Feb');
    expect(labels()).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('should drop a tick on the domain end, past the last bar', async () => {
    render(TestHarness, {
      chartProps: {
        data: days('2024-01-01T00:00:00Z', 5),
        x: 'date',
        xScale: scaleUtc(),
        xInterval: utcDay,
        y: 'value',
        width: 600,
        height: 100,
      },
      component: Axis,
      componentProps: { placement: 'bottom', ticks: { interval: utcDay } },
    });

    // One tick per bar — not a sixth for the day after the last
    await expect.poll(() => labels().length).toBe(5);
  });
});
