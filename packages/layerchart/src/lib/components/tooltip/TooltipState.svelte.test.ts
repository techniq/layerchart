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
    /**
     * A chart can leave an axis unconfigured — `<Chart x="distance">` with no `y` — which makes
     * `ctx.y` null.  `dataCoords` guards `ctx.y?.(data)` but still reads `ctx.yGet(data)` to place
     * the tooltip, and `createGetter` called the accessor before checking anything, so showing a
     * tooltip on such a chart threw `accessor is not a function`.
     */
    it('places the tooltip on a chart with no `y` configured', async () => {
      const ctx = await renderChart({ y: undefined, tooltipContext: { mode: 'bisect-x' } });

      expect(() => ctx.tooltip.show({ value: { x: new Date('2024-01-02') } })).not.toThrow();
      expect(ctx.tooltip.data).toEqual(data[1]);
    });

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

  describe('quadtree on a `domain` transform', () => {
    // Closer together than the pans, so a stale tree would find a neighbor
    const points = [40, 45, 50, 55, 60].map((x) => ({ x, y: 50 }));

    /** A pointer event positioned at container-relative `{ x, y }`, targeting the chart root */
    function pointerEventAt(ctx: ChartState<any, any, any>, x: number, y: number) {
      const rect = ctx.containerRef!.getBoundingClientRect();
      const e = new PointerEvent('pointermove', {
        bubbles: true,
        clientX: rect.x + x,
        clientY: rect.y + y,
      });
      Object.defineProperty(e, 'target', { value: ctx.containerRef });
      return e;
    }
    const at = (ctx: ChartState<any, any, any>, d: { x: number; y: number }) =>
      [ctx.xScale(d.x) + ctx.padding.left, ctx.yScale(d.y) + ctx.padding.top] as const;

    it('finds new rows at once, however often the data changes', async () => {
      let ctx: ChartState<any, any, any> = null!;
      const props = (data: { x: number; y: number }[]) => ({
        chartProps: {
          ...defaultChartProps,
          data,
          x: 'x',
          y: 'y',
          xDomain: [0, 100],
          yDomain: [0, 100],
          transform: { mode: 'domain' },
          tooltipContext: { mode: 'quadtree' },
        },
        oncontext: (c: any) => (ctx = c),
      });
      const { rerender } = render(TooltipTestHarness, props([{ x: 10, y: 10 }]));
      await vi.waitFor(() => expect(ctx?.transformState).toBeTruthy());
      await vi.waitFor(() => {
        ctx.tooltip.show(pointerEventAt(ctx, ...at(ctx, { x: 10, y: 10 })));
        expect(ctx.tooltip.data).toEqual({ x: 10, y: 10 });
      });

      // New data faster than a pan rests: each found as soon as it lands
      for (const x of [30, 50, 70]) {
        const row = { x, y: 60 };
        await rerender(props([row]));
        await new Promise((resolve) => setTimeout(resolve, 20));
        ctx.tooltip.show(pointerEventAt(ctx, ...at(ctx, row)));
        expect(ctx.tooltip.data).toEqual(row);
      }
    });

    it('finds the nearest point at once after zooming one axis', async () => {
      let ctx: ChartState<any, any, any> = null!;
      const props = (data: { x: number; y: number }[]) => ({
        chartProps: {
          ...defaultChartProps,
          data,
          x: 'x',
          y: 'y',
          xDomain: [0, 100],
          yDomain: [0, 100],
          transform: { mode: 'domain', axis: 'x' },
          tooltipContext: { mode: 'quadtree' },
        },
        oncontext: (c: any) => (ctx = c),
      });
      const { rerender } = render(TooltipTestHarness, props([{ x: 0, y: 0 }]));
      await vi.waitFor(() => expect(ctx?.transformState).toBeTruthy());

      // 10px across from the pointer once zoomed 4x across, and 5px down: the nearer.  Squashed
      // across in a tree built before the zoom, the first would look nearer.
      const pxPerX = (4 * ctx.width) / 100;
      const pxPerY = ctx.height / 100;
      const across = { x: 50 + 10 / pxPerX, y: 50 };
      const down = { x: 50, y: 50 - 5 / pxPerY };
      await rerender(props([across, down]));
      await vi.waitFor(() => {
        ctx.tooltip.show(pointerEventAt(ctx, ...at(ctx, across)));
        expect(ctx.tooltip.data).toEqual(across);
      });

      // Zoomed across only, about x = 50
      ctx.transformState!.setScale(4, { instant: true });
      ctx.transformState!.setTranslate({ x: -1.5 * ctx.width, y: 0 }, { instant: true });
      await new Promise((resolve) => setTimeout(resolve, 20));
      ctx.tooltip.show(pointerEventAt(ctx, ...at(ctx, { x: 50, y: 50 })));
      expect(ctx.tooltip.data).toEqual(down);
    });

    it('finds the point under the pointer as the domain pans and zooms, before it rebuilds', async () => {
      const ctx = await renderChart({
        data: points,
        x: 'x',
        y: 'y',
        xDomain: [0, 100],
        yDomain: [0, 100],
        transform: { mode: 'domain' },
        tooltipContext: { mode: 'quadtree' },
      });
      await vi.waitFor(() => {
        ctx.tooltip.show(pointerEventAt(ctx, ...at(ctx, points[0])));
        expect(ctx.tooltip.data).toEqual(points[0]);
      });

      for (const [scale, translate] of [
        [1, { x: 45, y: 0 }],
        [1.5, { x: -80, y: -20 }],
      ] as const) {
        ctx.transformState!.setScale(scale, { instant: true });
        ctx.transformState!.setTranslate(translate, { instant: true });
        // At once, not once the tree has caught up (for the points still in the plot)
        const shown = points.filter((d) => {
          const [x, y] = [ctx.xScale(d.x), ctx.yScale(d.y)];
          return x >= 0 && x <= ctx.width && y >= 0 && y <= ctx.height;
        });
        expect(shown.length).toBeGreaterThan(1);
        for (const d of shown) {
          ctx.tooltip.show(pointerEventAt(ctx, ...at(ctx, d)));
          expect(ctx.tooltip.data).toEqual(d);
        }
      }
    });
  });
});
