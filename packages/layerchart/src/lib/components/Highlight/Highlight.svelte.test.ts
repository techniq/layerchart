import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import StackedCategoryChart from './__fixtures__/StackedCategoryChart.svelte';
import PanZoomChart from './__fixtures__/PanZoomChart.svelte';

const keys = ['apples', 'bananas'];
const data = [
  { date: 0, apples: 10, bananas: 20 },
  { date: 1, apples: 30, bananas: 40 },
  { date: 2, apples: 20, bananas: 50 },
];

describe('Highlight points, `c`-grouped', () => {
  /** Hover the middle of the plot area and hand back the highlight points drawn there */
  async function hoverForPoints(container: HTMLElement) {
    const tooltipRect = container.querySelector('.lc-tooltip-context') as HTMLElement | null;
    await expect.element(tooltipRect).toBeInTheDocument();

    const rect = tooltipRect!.getBoundingClientRect();
    const eventInit = {
      bubbles: true,
      clientX: rect.x + rect.width / 2,
      clientY: rect.y + rect.height / 2,
    };

    let points: Element[] = [];
    await vi.waitFor(() => {
      tooltipRect!.dispatchEvent(new PointerEvent('pointerenter', eventInit));
      tooltipRect!.dispatchEvent(new PointerEvent('pointermove', eventInit));

      points = Array.from(document.querySelectorAll('.lc-highlight-point'));
      expect(points.length).toBeGreaterThan(0);
    });
    return points;
  }

  it('resolves against the rows when the chart data is nested', async () => {
    // `data` is a `stack()` — an array per key — so iterating it hands the chart's `x` accessor a
    // series rather than a row, and the accessor throws on the row fields it isn't given.
    // Rendering at all is the assertion: there is no boundary here, so the throw fails the test.
    const { container } = render(StackedCategoryChart, {
      data,
      keys,
      height: 300,
      width: 400,
    } as any);

    const points = await hoverForPoints(container as HTMLElement);
    expect(points.length).toBe(keys.length);
  });

  it('places a point on each band rather than at NaN', async () => {
    // `y={[0, 1]}` gives a category a span, and scaling the pair as though it were a single value
    // puts the point at NaN — which the browser drops on the floor with a console error
    const { container } = render(StackedCategoryChart, {
      data,
      keys,
      height: 300,
      width: 400,
    } as any);

    const points = await hoverForPoints(container as HTMLElement);
    for (const point of points) {
      expect(Number(point.getAttribute('cx'))).toBeTypeOf('number');
      expect(Number.isFinite(Number(point.getAttribute('cx')))).toBe(true);
      expect(Number.isFinite(Number(point.getAttribute('cy')))).toBe(true);
    }
  });
});

describe('Highlight on a `domain` transform', () => {
  it('moves with the chart as it pans, rather than springing after it, and glides between points', async () => {
    let ctx: any;
    const { container } = render(PanZoomChart, { oncontext: (c: any) => (ctx = c) });
    await vi.waitFor(() => expect(ctx?.transformState).toBeTruthy());

    // Hover the middle point
    const show = (x: number, y: number) => {
      const rect = ctx.containerRef.getBoundingClientRect();
      const e = new PointerEvent('pointermove', {
        bubbles: true,
        clientX: rect.x + ctx.padding.left + x,
        clientY: rect.y + ctx.padding.top + y,
      });
      Object.defineProperty(e, 'target', { value: ctx.containerRef });
      ctx.tooltip.show(e);
    };
    const at = { x: ctx.xScale(50), y: ctx.yScale(60) };
    await vi.waitFor(() => {
      show(at.x, at.y);
      expect(ctx.tooltip.data).toEqual({ x: 50, y: 60 });
      expect(container.querySelector('.lc-highlight-point')).not.toBeNull();
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Panned: at once where the point now is
    ctx.transformState.setTranslate({ x: 60, y: 0 }, { instant: true });
    await vi.waitFor(() => expect(ctx.xScale(50)).not.toBeCloseTo(at.x, 0));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const cx = () => Number(container.querySelector('.lc-highlight-point')!.getAttribute('cx'));
    expect(cx()).toBeCloseTo(ctx.xScale(50), 0);

    // Another point: glides there, as on any chart
    const from = cx();
    const to = ctx.xScale(80);
    show(to, ctx.yScale(40));
    await vi.waitFor(() => expect(ctx.tooltip.data).toEqual({ x: 80, y: 40 }));
    await vi.waitFor(() => {
      expect(cx()).toBeGreaterThan(from + 1);
      expect(cx()).toBeLessThan(to - 1);
    });
    await vi.waitFor(() => expect(cx()).toBeCloseTo(to, 0), { timeout: 3000 });
  });
});
