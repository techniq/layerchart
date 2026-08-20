import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AreaChart from './AreaChart/AreaChart.svelte';
import BarChart from './BarChart/BarChart.svelte';
import LineChart from './LineChart/LineChart.svelte';
import ScatterChart from './ScatterChart/ScatterChart.svelte';

// Shared test data
const timeSeriesData = [
  { date: 0, apples: 10, bananas: 20, oranges: 15 },
  { date: 1, apples: 30, bananas: 15, oranges: 25 },
  { date: 2, apples: 20, bananas: 40, oranges: 35 },
  { date: 3, apples: 50, bananas: 25, oranges: 45 },
  { date: 4, apples: 40, bananas: 30, oranges: 20 },
];

const series = [
  { key: 'apples', color: 'rgb(255, 0, 0)' },
  { key: 'bananas', color: 'rgb(0, 128, 0)' },
  { key: 'oranges', color: 'rgb(255, 165, 0)' },
];

const scatterData = [
  { x: 10, y: 20, size: 5 },
  { x: 30, y: 40, size: 10 },
  { x: 50, y: 60, size: 15 },
  { x: 70, y: 80, size: 20 },
];

/** Dispatch pointer events to trigger the tooltip on a given element */
function triggerTooltip(el: Element) {
  const rect = el.getBoundingClientRect();
  const eventInit = {
    bubbles: true,
    clientX: rect.x + rect.width / 2,
    clientY: rect.y + rect.height / 2,
  };
  el.dispatchEvent(new PointerEvent('pointerenter', eventInit));
  el.dispatchEvent(new PointerEvent('pointermove', eventInit));
}

/**
 * Trigger the tooltip and wait for it to render. Retries the dispatch until
 * the lazy DefaultTooltip + (when in quadtree mode) d3-quadtree chunks have
 * resolved — both happen in the background after mount.
 */
async function dispatchAndWaitForTooltip(el: Element) {
  await vi.waitFor(() => {
    triggerTooltip(el);
    expect(document.querySelector('.lc-tooltip-item-root')).not.toBeNull();
  });
}

function triggerPointerEvent(el: Element, type: 'pointerenter' | 'pointerleave') {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true }));
}

describe('DefaultTooltip', () => {
  describe('AreaChart (multi-series, quadtree-x mode)', () => {
    it('should show header and all series items', async () => {
      const { container } = render(AreaChart, {
        data: timeSeriesData,
        x: 'date',
        series,
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        // Should have a header (portaled to body)
        const header = document.querySelector('.lc-tooltip-header');
        expect(header).not.toBeNull();

        // Should have 4 tooltip items (3 series + 1 total)
        const items = document.querySelectorAll('.lc-tooltip-item-root');
        expect(items.length).toBe(4);

        // Labels should match series keys + total
        const labels = document.querySelectorAll('.lc-tooltip-item-label');
        expect(labels.length).toBe(4);
        const labelTexts = Array.from(labels).map((l) => l.textContent?.trim());
        // Multi-series areas stack under the `auto` default, and a stacked tooltip lists its
        // items top-down to match the layers on screen — so the series read in reverse
        expect(labelTexts).toEqual(['oranges', 'bananas', 'apples', 'total']);
      });
    });

    it('should show series colors in tooltip items', async () => {
      const { container } = render(AreaChart, {
        data: timeSeriesData,
        x: 'date',
        series,
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const colorDots = document.querySelectorAll('.lc-tooltip-item-color');
        expect(colorDots.length).toBe(3);
        const colors = Array.from(colorDots).map((dot) =>
          (dot as HTMLElement).style.getPropertyValue('--color')
        );
        // Reversed with the stack, as above
        expect(colors).toEqual(['rgb(255, 165, 0)', 'rgb(0, 128, 0)', 'rgb(255, 0, 0)']);
      });
    });

    it('should fade non-highlighted tooltip series items on hover', async () => {
      const { container } = render(AreaChart, {
        data: timeSeriesData,
        x: 'date',
        series,
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const items = document.querySelectorAll('.lc-tooltip-item-root');
        expect(items.length).toBe(4);
      });

      const items = Array.from(document.querySelectorAll('.lc-tooltip-item-root')) as HTMLElement[];
      const labels = Array.from(
        document.querySelectorAll('.lc-tooltip-item-label')
      ) as HTMLElement[];

      triggerPointerEvent(items[0], 'pointerenter');

      await vi.waitFor(() => {
        expect(items[0].dataset.highlighted).toBe('true');
        expect(items[1].dataset.highlighted).toBe('false');
        expect(items[2].dataset.highlighted).toBe('false');
        expect(items[3].dataset.highlighted).toBeUndefined();
        expect(getComputedStyle(labels[0]).opacity).not.toBe('0.1');
        expect(getComputedStyle(labels[1]).opacity).toBe('0.1');
        expect(getComputedStyle(labels[2]).opacity).toBe('0.1');
        expect(getComputedStyle(labels[3]).opacity).not.toBe('0.1');
      });

      triggerPointerEvent(items[0], 'pointerleave');

      await vi.waitFor(() => {
        expect(items[0].dataset.highlighted).toBe('true');
        expect(items[1].dataset.highlighted).toBe('true');
        expect(items[2].dataset.highlighted).toBe('true');
        expect(items[3].dataset.highlighted).toBeUndefined();
        expect(getComputedStyle(labels[0]).opacity).not.toBe('0.1');
        expect(getComputedStyle(labels[1]).opacity).not.toBe('0.1');
        expect(getComputedStyle(labels[2]).opacity).not.toBe('0.1');
        expect(getComputedStyle(labels[3]).opacity).not.toBe('0.1');
      });
    });

    it('should show single series without total', async () => {
      const { container } = render(AreaChart, {
        data: timeSeriesData,
        x: 'date',
        y: 'apples',
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const items = document.querySelectorAll('.lc-tooltip-item-root');
        // 1 series item, no total
        expect(items.length).toBe(1);
      });
    });
  });

  describe('LineChart (multi-series, quadtree-x mode)', () => {
    it('should show header and all series items', async () => {
      const { container } = render(LineChart, {
        data: timeSeriesData,
        x: 'date',
        series,
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const header = document.querySelector('.lc-tooltip-header');
        expect(header).not.toBeNull();

        // 3 series + 1 total = 4 items
        const items = document.querySelectorAll('.lc-tooltip-item-root');
        expect(items.length).toBe(4);

        const labels = document.querySelectorAll('.lc-tooltip-item-label');
        const labelTexts = Array.from(labels).map((l) => l.textContent?.trim());
        expect(labelTexts).toEqual(['apples', 'bananas', 'oranges', 'total']);
      });
    });

    it('should keep the declared order when a resolved stack is drawn by nothing', async () => {
      // Several configured series resolve the layout to a stack, but lines decline an inferred
      // one — so nothing is stacked, and there's no visual bottom-to-top order to match
      const { container } = render(LineChart, {
        data: timeSeriesData,
        x: 'date',
        y: 'apples',
        series,
        height: 300,
        width: 400,
      } as any);

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const labels = Array.from(document.querySelectorAll('.lc-tooltip-item-label')).map((l) =>
          l.textContent?.trim()
        );
        expect(labels.slice(0, 3)).toEqual(['apples', 'bananas', 'oranges']);
      });
    });
  });

  describe('long data grouped and stacked', () => {
    // `x1` sub-bands the baskets, `c` stacks the fruit within each — so a band holds several rows
    // that the sub-band alone doesn't tell apart
    const longData = [
      { year: 2019, basket: 1, fruit: 'apples', value: 3840 },
      { year: 2019, basket: 1, fruit: 'bananas', value: 1920 },
      { year: 2019, basket: 2, fruit: 'cherries', value: 960 },
      { year: 2019, basket: 2, fruit: 'grapes', value: 400 },
      { year: 2018, basket: 1, fruit: 'apples', value: 1600 },
      { year: 2018, basket: 1, fruit: 'bananas', value: 1440 },
      { year: 2018, basket: 2, fruit: 'cherries', value: 960 },
      { year: 2018, basket: 2, fruit: 'grapes', value: 400 },
    ];

    it('labels the rows by their `c` category, not the sub-band they share', async () => {
      const { container } = render(BarChart, {
        data: longData,
        x: 'year',
        x1: 'basket',
        y: 'value',
        c: 'fruit',
        width: 400,
        height: 300,
      } as any);

      const rect = container.querySelector('.lc-tooltip-rect');
      await vi.waitFor(() => expect(rect).not.toBeNull());
      await dispatchAndWaitForTooltip(rect!);

      // Keyed by the sub-band alone, the two rows per basket collide — Svelte throws
      // `each_key_duplicate` and the labels read `1, 1, 2, 2`
      const labels = Array.from(document.querySelectorAll('.lc-tooltip-item-label')).map((el) =>
        el.textContent?.trim()
      );
      expect(labels).toEqual(['apples', 'bananas', 'cherries', 'grapes', 'total']);
    });

    it('lists only the hovered panel’s rows when faceting', async () => {
      const { container } = render(BarChart, {
        data: longData,
        fx: 'year',
        x: 'basket',
        y: 'value',
        c: 'fruit',
        width: 600,
        height: 300,
      } as any);

      const rect = container.querySelector('.lc-tooltip-rect');
      await vi.waitFor(() => expect(rect).not.toBeNull());
      await dispatchAndWaitForTooltip(rect!);

      // The same band exists in every panel, so an unscoped filter would list — and total —
      // the other years' rows here too
      const labels = Array.from(document.querySelectorAll('.lc-tooltip-item-label')).map((el) =>
        el.textContent?.trim()
      );
      expect(labels.filter((l) => l !== 'total')).toHaveLength(2);
    });
  });

  describe('ScatterChart (single-point, quadtree mode)', () => {
    it('should show x and y items in tooltip', async () => {
      const { container } = render(ScatterChart, {
        data: scatterData,
        x: 'x',
        y: 'y',
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const items = document.querySelectorAll('.lc-tooltip-item-root');
        // Should show x and y items
        expect(items.length).toBe(2);

        const labels = Array.from(document.querySelectorAll('.lc-tooltip-item-label')).map((l) =>
          l.textContent?.trim()
        );
        expect(labels).toEqual(['x', 'y']);
      });
    });

    it('should show x, y, and r items when r is configured', async () => {
      const { container } = render(ScatterChart, {
        data: scatterData,
        x: 'x',
        y: 'y',
        r: 'size',
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const items = document.querySelectorAll('.lc-tooltip-item-root');
        // Should show x, y, and r items
        expect(items.length).toBe(3);

        const labels = Array.from(document.querySelectorAll('.lc-tooltip-item-label')).map((l) =>
          l.textContent?.trim()
        );
        expect(labels).toEqual(['x', 'y', 'size']);
      });
    });

    it('should show series header for multi-series', async () => {
      const { container } = render(ScatterChart, {
        x: 'x',
        y: 'y',
        series: [
          { key: 'group1', data: scatterData.slice(0, 2), color: 'rgb(255, 0, 0)' },
          { key: 'group2', data: scatterData.slice(2), color: 'rgb(0, 0, 255)' },
        ],
        height: 300,
        width: 400,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      await dispatchAndWaitForTooltip(tooltipCtx);

      await vi.waitFor(() => {
        // Should show a header with the series name
        const header = document.querySelector('.lc-tooltip-header');
        expect(header).not.toBeNull();
        expect(header!.textContent).not.toBe('');

        // Should show x and y items
        const items = document.querySelectorAll('.lc-tooltip-item-root');
        expect(items.length).toBe(2);
      });
    });
  });
});
