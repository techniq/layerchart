import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleBand } from 'd3-scale';

import TestHarness from '../tests/TestHarness.svelte';
import Axis from './Axis.svelte';

/** Long category names, so the labels collide well before the ticks do */
const data = [
  'Wednesday the 1st',
  'Wednesday the 2nd',
  'Wednesday the 3rd',
  'Wednesday the 4th',
  'Wednesday the 5th',
  'Wednesday the 6th',
].map((day, i) => ({ day, value: i + 1 }));

const chartProps = {
  data,
  x: 'day',
  xScale: scaleBand(),
  y: 'value',
  width: 400,
  height: 200,
  padding: { bottom: 24, left: 24 },
};

function labels() {
  return Array.from(document.querySelectorAll('.lc-axis-tick-label')).map(
    (el) => el.textContent?.trim() ?? ''
  );
}

describe('Axis tickOcclusion', () => {
  it('draws every colliding label when not enabled', async () => {
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom' },
    });
    await expect.poll(() => labels().length).toBe(data.length);
  });

  it('drops labels that would overlap one already kept', async () => {
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: true },
    });
    await expect.poll(() => labels().length).toBeLessThan(data.length);
    expect(labels().length).toBeGreaterThan(0);
  });

  it('keeps the last tick with the default `end` priority', async () => {
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: true },
    });
    await expect.poll(() => labels().length).toBeLessThan(data.length);
    expect(labels().at(-1)).toBe(data.at(-1)!.day);
  });

  it('keeps the first tick with `start` priority', async () => {
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: { priority: 'start' } },
    });
    await expect.poll(() => labels().length).toBeLessThan(data.length);
    expect(labels()[0]).toBe(data[0].day);
  });

  it('drops more labels as `padding` grows', async () => {
    const { unmount } = render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: { padding: 0 } },
    });
    await expect.poll(() => labels().length).toBeGreaterThan(0);
    const tight = labels().length;
    unmount();

    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: { padding: 80 } },
    });
    await expect.poll(() => labels().length).toBeGreaterThan(0);
    expect(labels().length).toBeLessThan(tight);
  });

  it('returns the kept labels in axis order', async () => {
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: true },
    });
    await expect.poll(() => labels().length).toBeLessThan(data.length);
    const kept = labels();
    const order = kept.map((label) => data.findIndex((d) => d.day === label));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('keeps both ends with `start-end` priority', async () => {
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: { priority: 'start-end' } },
    });
    await expect.poll(() => labels().length).toBeLessThan(data.length);
    expect(labels()[0]).toBe(data[0].day);
    expect(labels().at(-1)).toBe(data.at(-1)!.day);
  });

  it('drops the first tick under the default `end` priority', async () => {
    // The contrast `start-end` exists for: greedy packing from the end runs out of room before
    // it reaches the leading tick, so the axis loses the value it starts at.
    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: { padding: 40 } },
    });
    await expect.poll(() => labels().length).toBeLessThan(data.length);
    expect(labels()[0]).not.toBe(data[0].day);
  });

  it('measures rotated labels at their rotated size', async () => {
    // Angled labels need far less horizontal room, so more of them survive than when flat.
    const { unmount } = render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement: 'bottom', tickOcclusion: true },
    });
    await expect.poll(() => labels().length).toBeGreaterThan(0);
    const flat = labels().length;
    unmount();

    render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: {
        placement: 'bottom',
        tickOcclusion: true,
        tickLabelProps: { rotate: -60, textAnchor: 'end' },
      },
    });
    await expect.poll(() => labels().length).toBeGreaterThan(flat);
  });
});
