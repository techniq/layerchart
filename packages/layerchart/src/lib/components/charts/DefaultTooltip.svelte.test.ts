import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AreaChart from './AreaChart.svelte';
import LineChart from './LineChart.svelte';
import ScatterChart from './ScatterChart.svelte';

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
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        // Should have a header
        const header = container.querySelector('.lc-tooltip-header');
        expect(header).not.toBeNull();

        // Should have 4 tooltip items (3 series + 1 total)
        const items = container.querySelectorAll('.lc-tooltip-item-root');
        expect(items.length).toBe(4);

        // Labels should match series keys + total
        const labels = container.querySelectorAll('.lc-tooltip-item-label');
        expect(labels.length).toBe(4);
        const labelTexts = Array.from(labels).map((l) => l.textContent?.trim());
        expect(labelTexts).toEqual(['apples', 'bananas', 'oranges', 'total']);
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
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const colorDots = container.querySelectorAll('.lc-tooltip-item-color');
        expect(colorDots.length).toBe(3);
        const colors = Array.from(colorDots).map((dot) =>
          (dot as HTMLElement).style.getPropertyValue('--color')
        );
        expect(colors).toEqual(['rgb(255, 0, 0)', 'rgb(0, 128, 0)', 'rgb(255, 165, 0)']);
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
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const items = container.querySelectorAll('.lc-tooltip-item-root');
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
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const header = container.querySelector('.lc-tooltip-header');
        expect(header).not.toBeNull();

        // 3 series + 1 total = 4 items
        const items = container.querySelectorAll('.lc-tooltip-item-root');
        expect(items.length).toBe(4);

        const labels = container.querySelectorAll('.lc-tooltip-item-label');
        const labelTexts = Array.from(labels).map((l) => l.textContent?.trim());
        expect(labelTexts).toEqual(['apples', 'bananas', 'oranges', 'total']);
      });
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
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const items = container.querySelectorAll('.lc-tooltip-item-root');
        // Should show x and y items
        expect(items.length).toBe(2);

        const labels = Array.from(container.querySelectorAll('.lc-tooltip-item-label')).map((l) =>
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
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const items = container.querySelectorAll('.lc-tooltip-item-root');
        // Should show x, y, and r items
        expect(items.length).toBe(3);

        const labels = Array.from(container.querySelectorAll('.lc-tooltip-item-label')).map((l) =>
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
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        // Should show a header with the series name
        const header = container.querySelector('.lc-tooltip-header');
        expect(header).not.toBeNull();
        expect(header!.textContent).not.toBe('');

        // Should show x and y items
        const items = container.querySelectorAll('.lc-tooltip-item-root');
        expect(items.length).toBe(2);
      });
    });
  });
});
