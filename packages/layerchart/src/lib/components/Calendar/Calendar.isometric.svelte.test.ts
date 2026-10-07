import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import MarkHarness from '$lib/tests/MarkHarness.svelte';
import Calendar from './Calendar.svelte';
import { chartTestId } from '$lib/tests/TestHarness.svelte';

const start = new Date(2024, 0, 1);
const end = new Date(2024, 0, 29);
// Every other day has a count
const data = Array.from({ length: 28 }, (_, i) => ({
  date: new Date(2024, 0, 1 + i),
  value: i % 2 ? 0 : 1 + (i % 5),
}));

async function renderCalendar(chartProps: Record<string, any> = {}) {
  render(MarkHarness, {
    chartProps: {
      data,
      x: 'date',
      z: 'value',
      zDomain: [0, 5],
      zRange: [0, 30],
      width: 400,
      height: 200,
      isometric: true,
      ...chartProps,
    },
    layerProps: { center: false },
    component: Calendar,
    componentProps: { start, end, monthLabel: false },
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  return page.getByTestId(chartTestId).element() as HTMLElement;
}

describe('Calendar on an isometric floor', () => {
  it('stands each day up to its count — days without one stay flat', async () => {
    const el = await renderCalendar();
    expect(el.querySelectorAll('.lc-rect-box')).toHaveLength(14);
  });

  it('draws the days back to front', async () => {
    const el = await renderCalendar();
    // A box's lowest point on screen is its nearest corner, so lower must be painted later
    const bottoms = [...el.querySelectorAll('.lc-rect-box')].map(
      (b) => b.getBoundingClientRect().bottom
    );
    const sorted = [...bottoms].sort((a, b) => a - b);
    expect(bottoms.map(Math.round)).toEqual(sorted.map(Math.round));
  });

  it('keeps each day its own box as the view turns, so `motion` has nothing to ease', async () => {
    const props = (rotate: number) => ({
      chartProps: {
        data,
        x: 'date',
        z: 'value',
        zDomain: [0, 5],
        zRange: [0, 30],
        width: 400,
        height: 200,
        isometric: { rotate, tilt: 60 },
      },
      layerProps: { center: false },
      component: Calendar,
      componentProps: { start, end, monthLabel: false, motion: { type: 'tween', duration: 1000 } },
    });
    const screen = render(MarkHarness, props(45));
    await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
    const el = page.getByTestId(chartTestId).element() as HTMLElement;
    const tops = () => [...el.querySelectorAll('.lc-rect-top')].map((t) => t.getAttribute('d'));

    // Far enough round that the days paint in another order
    await screen.rerender(props(135));
    await new Promise((resolve) => setTimeout(resolve, 100));
    const turned = tops();
    // A box handed another day would still be easing to its place and height
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(tops()).toEqual(turned);
  });

  it('lies flat on a flat chart', async () => {
    const el = await renderCalendar({ isometric: false });
    expect(el.querySelectorAll('.lc-rect-box')).toHaveLength(0);
  });
});
