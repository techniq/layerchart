import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import StackedCategoryChart from './__fixtures__/StackedCategoryChart.svelte';

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
