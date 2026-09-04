import { describe, expect, it, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TooltipTestHarness from '$lib/tests/TooltipTestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';

const data = [
  { date: new Date('2024-01-01'), value: 10 },
  { date: new Date('2024-01-02'), value: 30 },
  { date: new Date('2024-01-03'), value: 20 },
  { date: new Date('2024-01-04'), value: 50 },
];

const defaultChartProps = {
  data,
  x: 'date',
  y: 'value',
  padding: { top: 0, right: 0, bottom: 0, left: 20 },
};

/** Render a chart and resolve once its context (and scales) are ready */
async function renderChart(chartProps: Record<string, any> = {}) {
  let ctx: ChartState<any, any, any> = null!;

  render(TooltipTestHarness, {
    chartProps: { ...defaultChartProps, ...chartProps },
    oncontext: (c: any) => (ctx = c),
  });

  await vi.waitFor(() => {
    expect(ctx?.width).toBeGreaterThan(0);
  });

  return ctx;
}

describe('TooltipState', () => {
  describe('show({ value })', () => {
    it('resolves the nearest data point from a domain value', async () => {
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      ctx.tooltip.show({ value: { x: new Date('2024-01-02T20:00:00') } });

      expect(ctx.tooltip.data).toEqual(data[2]);
    });

    it('resolves an exact domain value', async () => {
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      ctx.tooltip.show({ value: { x: new Date('2024-01-04') } });

      expect(ctx.tooltip.data).toEqual(data[3]);
    });

    it('positions the tooltip from the chart scales, not a pointer', async () => {
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      ctx.tooltip.show({ value: { x: new Date('2024-01-04') } });

      // last point sits at the end of the x range, offset by the left padding
      expect(ctx.tooltip.x).toBeCloseTo(ctx.xScale(data[3].date) + ctx.padding.left, 5);
      expect(ctx.tooltip.y).toBeCloseTo(ctx.yScale(data[3].value) + ctx.padding.top, 5);
    });

    it('works on charts using a pixel-based mode', async () => {
      // `quadtree-x` has no value-based equivalent, so it falls back to bisecting `x`
      const ctx = await renderChart({ tooltipContext: { mode: 'quadtree-x' } });

      ctx.tooltip.show({ value: { x: new Date('2024-01-02') } });

      expect(ctx.tooltip.data).toEqual(data[1]);
    });

    it('populates series values', async () => {
      const ctx = await renderChart({
        series: [{ key: 'value', label: 'Value', value: 'value' }],
        tooltipContext: { mode: 'bisect-x' },
      });

      ctx.tooltip.show({ value: { x: new Date('2024-01-02') } });

      expect(ctx.tooltip.series).toHaveLength(1);
      expect(ctx.tooltip.series[0]).toMatchObject({ key: 'value', label: 'Value', value: 30 });
    });

    it('hides when no data can be resolved', async () => {
      const ctx = await renderChart({ data: [], tooltipContext: { mode: 'bisect-x' } });

      ctx.tooltip.show({ value: { x: new Date('2024-01-02') } });

      await vi.waitFor(() => {
        expect(ctx.tooltip.data).toBeNull();
      });
    });
  });

  describe('show({ data })', () => {
    it('shows a known data point positioned from the chart scales', async () => {
      const ctx = await renderChart();

      ctx.tooltip.show({ data: data[1] });

      expect(ctx.tooltip.data).toEqual(data[1]);
      expect(ctx.tooltip.x).toBeCloseTo(ctx.xScale(data[1].date) + ctx.padding.left, 5);
      expect(ctx.tooltip.y).toBeCloseTo(ctx.yScale(data[1].value) + ctx.padding.top, 5);
    });
  });

  describe('show({ point })', () => {
    it('resolves data from a container-relative pixel coordinate', async () => {
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      const point = {
        x: ctx.xScale(data[2].date) + ctx.padding.left,
        y: ctx.yScale(data[2].value) + ctx.padding.top,
      };
      ctx.tooltip.show({ point });

      expect(ctx.tooltip.data).toEqual(data[2]);
      // unlike `show({ value })`, the supplied point is kept as-is
      expect(ctx.tooltip.x).toBe(point.x);
      expect(ctx.tooltip.y).toBe(point.y);
    });
  });

  describe('show({ point, data })', () => {
    it('shows an explicit data point at an explicit position', async () => {
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      // `data` skips resolution, `point` overrides the position derived from it
      ctx.tooltip.show({ point: { x: 5, y: 7 }, data: data[3] });

      expect(ctx.tooltip.data).toEqual(data[3]);
      expect(ctx.tooltip.x).toBe(5);
      expect(ctx.tooltip.y).toBe(7);
    });
  });

  describe('show(event, data)', () => {
    /** A pointer event positioned at container-relative `{ x, y }`, targeting the chart root */
    function pointerEventAt(ctx: ChartState<any, any, any>, x: number, y: number) {
      const rect = ctx.containerRef!.getBoundingClientRect();
      const e = new PointerEvent('pointermove', {
        bubbles: true,
        clientX: rect.x + x,
        clientY: rect.y + y,
      });
      // `showTooltip` reads `e.target.closest('.lc-root-container')`, which an undispatched
      // event does not have
      Object.defineProperty(e, 'target', { value: ctx.containerRef });
      return e;
    }

    it('still resolves data from a pointer event', async () => {
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      const e = pointerEventAt(
        ctx,
        ctx.padding.left + ctx.xScale(data[2].date),
        ctx.padding.top + ctx.yScale(data[2].value)
      );
      ctx.tooltip.show(e);

      expect(ctx.tooltip.data).toEqual(data[2]);
    });

    it('still shows explicit data at the pointer position', async () => {
      const ctx = await renderChart();

      ctx.tooltip.show(pointerEventAt(ctx, 40, 60), data[0]);

      expect(ctx.tooltip.data).toEqual(data[0]);
      expect(ctx.tooltip.x).toBeCloseTo(40, 5);
      expect(ctx.tooltip.y).toBeCloseTo(60, 5);
    });
  });

  describe('hide', () => {
    it('clears data shown by `show({ value })`', async () => {
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      ctx.tooltip.show({ value: { x: new Date('2024-01-02') } });
      expect(ctx.tooltip.data).toEqual(data[1]);

      ctx.tooltip.hide();

      await vi.waitFor(() => {
        expect(ctx.tooltip.data).toBeNull();
      });
    });

    it('is shielded from a chart mounting under a parked cursor by the harness', async () => {
      // Covers `TooltipTestHarness`'s `pointer-events: none`, rather than anything `hide()` does.
      //
      // Vitest's browser mode tiles every test file's iframe into one page sharing a single
      // cursor, so a `hover()` elsewhere can leave it wherever this chart later mounts.  Park it
      // first, then mount underneath it: the browser fires a boundary event at the element that
      // appears under a stationary cursor, which would otherwise show data never asked for.
      //
      // `TooltipState` does not ignore that event — disabled pointer input is what keeps it away.
      // Drop the guard from the harness and this fails, which is the point of keeping it: the
      // other files on the page render charts directly and depend on the same behaviour.
      const parked = await renderChart({ tooltipContext: { mode: 'bisect-x' } });
      const rect = parked.containerRef!.getBoundingClientRect();
      await page
        .elementLocator(document.body)
        .hover({ position: { x: rect.x + 25, y: rect.y + 50 } });

      cleanup();
      const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

      ctx.tooltip.show({ value: { x: new Date('2024-01-02') } });
      expect(ctx.tooltip.data).toEqual(data[1]);

      ctx.tooltip.hide();

      await vi.waitFor(() => {
        expect(ctx.tooltip.data).toBeNull();
      });

      // give a boundary event from the parked cursor a chance to land
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(ctx.tooltip.data).toBeNull();
    });
  });
});
