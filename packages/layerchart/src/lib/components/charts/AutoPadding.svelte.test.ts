import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ChartBindings from './__fixtures__/ChartBindings.svelte';
import BarChart from './BarChart/BarChart.svelte';
import LineChart from './LineChart/LineChart.svelte';
import PieChart from './PieChart/PieChart.svelte';

const size = { width: 400, height: 300 };

function setup(component: any, props: Record<string, any>) {
  let bound: { ref: any; context: any } = { ref: undefined, context: undefined };
  // Under `props`, as a chart's own `props` would otherwise be read as a `render()` option
  const result = render(ChartBindings, {
    props: { component, ...size, ...props, onbind: (b: typeof bound) => (bound = b) },
  });
  return { ...result, context: () => bound.context };
}

/** How far any axis text pokes outside the chart's container, per side (0 when it all fits) */
function textOverflow(container: HTMLElement, selector = '.lc-axis-tick-label, .lc-axis-label') {
  const root = container.querySelector<HTMLElement>('.lc-root-container')!.getBoundingClientRect();
  const overflow = { top: 0, right: 0, bottom: 0, left: 0 };
  for (const el of container.querySelectorAll(selector)) {
    const rect = el.getBoundingClientRect();
    if (!rect.width) continue;
    overflow.left = Math.max(overflow.left, root.left - rect.left);
    overflow.top = Math.max(overflow.top, root.top - rect.top);
    overflow.right = Math.max(overflow.right, rect.right - root.right);
    overflow.bottom = Math.max(overflow.bottom, rect.bottom - root.bottom);
  }
  return overflow;
}

/** The leftmost axis text and the plot's left edge, in page pixels */
function leftmostText(container: HTMLElement) {
  let left = Infinity;
  for (const el of container.querySelectorAll('.lc-axis-tick-label')) {
    const rect = el.getBoundingClientRect();
    if (rect.width) left = Math.min(left, rect.left);
  }
  return left;
}

const values = (max: number) => [
  { x: 'a', y: max },
  { x: 'b', y: max / 2 },
];

describe("padding 'auto'", () => {
  it('sizes the left padding to the y-axis tick labels', async () => {
    const small = setup(BarChart, { data: values(120), x: 'x', y: 'y', padding: { left: 'auto' } });
    await expect.poll(() => small.context()?.padding.left).toBeGreaterThan(0);
    const smallLeft = small.context().padding.left;
    small.unmount();

    const large = setup(BarChart, {
      data: values(12_000_000),
      x: 'x',
      y: 'y',
      padding: { left: 'auto' },
    });
    await expect.poll(() => large.context()?.padding.left).toBeGreaterThan(smallLeft + 20);
    expect(textOverflow(large.container).left).toBeLessThanOrEqual(1);
    // Fitted, not just generous: the widest label reaches (close to) the container's edge
    const root = large.container.querySelector('.lc-root-container')!.getBoundingClientRect();
    expect(leftmostText(large.container) - root.left).toBeLessThan(4);
  });

  it("fits every side with padding='auto'", async () => {
    const { container, context } = setup(LineChart, {
      data: [
        { x: 0, y: 1_000_000 },
        { x: 100_000, y: 3_000_000 },
      ],
      x: 'x',
      y: 'y',
      padding: 'auto',
    });
    await expect.poll(() => context()?.padding.left).toBeGreaterThan(20);
    const overflow = textOverflow(container);
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      expect(overflow[side], side).toBeLessThanOrEqual(1);
    }
  });

  it('fits long category names on a horizontal bar chart', async () => {
    const { container, context } = setup(BarChart, {
      data: [
        { name: 'A rather long category name', value: 10 },
        { name: 'Short', value: 20 },
      ],
      x: 'value',
      y: 'name',
      orientation: 'horizontal',
      padding: { left: 'auto' },
    });
    await expect.poll(() => context()?.padding.left).toBeGreaterThan(80);
    expect(textOverflow(container).left).toBeLessThanOrEqual(1);
  });

  it('leaves room for the axis title beside the tick labels', async () => {
    const { container, context } = setup(BarChart, {
      data: values(12_000),
      x: 'x',
      y: 'y',
      padding: { left: 'auto' },
      props: { yAxis: { label: 'Revenue' } },
    });
    await expect.poll(() => context()?.padding.left).toBeGreaterThan(20);
    await expect.poll(() => container.querySelector('.lc-axis-label')).toBeTruthy();

    const title = container.querySelector('.lc-axis-label')!.getBoundingClientRect();
    // Tick labels only: the title is anchored at its cap height, so its line box pokes a few
    // pixels past the edge with any padding
    expect(textOverflow(container, '.lc-axis-tick-label').left).toBeLessThanOrEqual(1);
    // The title doesn't run into the tick labels
    expect(title.right).toBeLessThanOrEqual(leftmostText(container) + 1);
  });

  it('shrinks again when the labels get shorter', async () => {
    const { context, rerender } = setup(BarChart, {
      data: values(12_000_000),
      x: 'x',
      y: 'y',
      padding: { left: 'auto' },
    });
    await expect.poll(() => context()?.padding.left).toBeGreaterThan(40);
    const wide = context().padding.left;

    await rerender({ data: values(12) });
    await expect.poll(() => context().padding.left).toBeLessThan(wide - 20);
  });

  it('keeps room for the legend below a fitted bottom axis', async () => {
    const { container, context } = setup(BarChart, {
      data: [
        { x: 'a', y: 10, z: 'one' },
        { x: 'b', y: 20, z: 'two' },
      ],
      x: 'x',
      y: 'y',
      series: [
        { key: 'one', data: [{ x: 'a', y: 10 }] },
        { key: 'two', data: [{ x: 'b', y: 20 }] },
      ],
      legend: true,
      padding: { bottom: 'auto' },
    });
    await expect.poll(() => container.querySelector('.lc-legend-container')).toBeTruthy();
    await expect.poll(() => context()?.padding.bottom).toBeGreaterThan(32);

    const legend = container.querySelector('.lc-legend-container')!.getBoundingClientRect();
    let labelsBottom = -Infinity;
    for (const el of container.querySelectorAll('.lc-axis-tick-label')) {
      labelsBottom = Math.max(labelsBottom, el.getBoundingClientRect().bottom);
    }
    expect(legend.top).toBeGreaterThanOrEqual(labelsBottom - 1);
  });

  it('falls back to no padding on a radial chart', async () => {
    const { context } = setup(PieChart, {
      data: [
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
      ],
      key: 'key',
      value: 'value',
      padding: 'auto',
    });
    await expect.poll(() => context()?.padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('keeps explicit sides and leaves charts without auto alone', async () => {
    const mixed = setup(BarChart, {
      data: values(120),
      x: 'x',
      y: 'y',
      padding: { left: 'auto', top: 30 },
    });
    await expect.poll(() => mixed.context()?.padding.top).toBe(30);
    mixed.unmount();

    const fixed = setup(BarChart, { data: values(12_000_000), x: 'x', y: 'y' });
    await expect.poll(() => fixed.context()?.padding.left).toBe(20);
  });

  it('adjusts what fits with a function', async () => {
    const auto = setup(BarChart, { data: values(12_000), x: 'x', y: 'y', padding: 'auto' });
    await expect.poll(() => auto.context()?.padding.left).toBeGreaterThan(20);
    const fitted = { ...auto.context().padding };
    auto.unmount();

    const extra = setup(BarChart, {
      data: values(12_000),
      x: 'x',
      y: 'y',
      padding: { left: (fit: number) => fit + 10, top: (fit: number) => Math.max(fit, 30) },
    });
    await expect.poll(() => extra.context()?.padding.left).toBe(fitted.left + 10);
    expect(extra.context().padding.top).toBe(30);
    extra.unmount();

    const all = setup(BarChart, {
      data: values(12_000),
      x: 'x',
      y: 'y',
      padding: (fit: number) => fit + 5,
    });
    await expect.poll(() => all.context()?.padding.left).toBe(fitted.left + 5);
    expect(all.context().padding.bottom).toBe(fitted.bottom + 5);
  });
});
