import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '../components/tests/TestHarness.svelte';
import Circle from '../components/Circle/Circle.svelte';
import type { ChartState } from './chart.svelte.js';

const data = [
  { g: 'a', h: 'x', v: 1, w: 10 },
  { g: 'a', h: 'y', v: 2, w: 20 },
  { g: 'b', h: 'x', v: 3, w: 30 },
  { g: 'b', h: 'x', v: 4, w: 40 },
];

function renderChart(extra: Record<string, any>, componentProps: Record<string, any> = {}) {
  let ctx: ChartState<any, any, any> = null!;
  render(TestHarness, {
    component: Circle,
    chartProps: {
      data,
      x: 'v',
      y: 'w',
      xDomain: [0, 5],
      yDomain: [0, 50],
      width: 400,
      height: 300,
      padding: 0,
      ...extra,
    },
    componentProps: { cx: 'v', cy: 'w', r: 2, ...componentProps },
    oncontext: (c: any) => (ctx = c),
  });
  return () => ctx;
}

describe('facets', () => {
  describe('layout', () => {
    it('is a single full-size panel when not faceting', async () => {
      const ctx = renderChart({});
      await expect.poll(() => ctx()?.width).toBeGreaterThan(0);

      expect(ctx().facet.enabled).toBe(false);
      expect(ctx().facet.panels).toHaveLength(1);
      expect(ctx().width).toBe(ctx().box.width);
      expect(ctx().height).toBe(ctx().box.height);
      expect(ctx().facet.panels[0].data).toHaveLength(data.length);
    });

    it('splits into a panel per `fx` value, narrowing `width` to one panel', async () => {
      const ctx = renderChart({ fx: 'g' });
      await expect.poll(() => ctx()?.facet.enabled).toBe(true);

      expect(ctx().facet.panels.map((f) => f.fx)).toEqual(['a', 'b']);
      expect(ctx().width).toBeLessThan(ctx().box.width / 2 + 1);
      // `height` is untouched — only `fy` divides vertically
      expect(ctx().height).toBe(ctx().box.height);
      expect(ctx().facet.panels[0].x).toBe(0);
      expect(ctx().facet.panels[1].x).toBeGreaterThan(0);
    });

    it('partitions the rows across panels', async () => {
      const ctx = renderChart({ fx: 'g' });
      await expect.poll(() => ctx()?.facet.enabled).toBe(true);

      expect(ctx().facet.panels.map((f) => f.data.length)).toEqual([2, 2]);
      expect(ctx().facet.panels[0].data.every((d: any) => d.g === 'a')).toBe(true);
    });

    it('crosses `fx` and `fy` into a grid, marking combinations with no rows empty', async () => {
      const ctx = renderChart({ fx: 'g', fy: 'h' });
      await expect.poll(() => ctx()?.facet.enabled).toBe(true);

      expect(ctx().facet.panels).toHaveLength(4);
      const byKey = Object.fromEntries(ctx().facet.panels.map((f) => [`${f.fx}/${f.fy}`, f]));
      expect(byKey['a/x'].data).toHaveLength(1);
      expect(byKey['b/x'].data).toHaveLength(2);
      // no `b` rows on `y` — a crossed grid is usually sparse
      expect(byKey['b/y'].empty).toBe(true);
      expect(byKey['b/y'].data).toHaveLength(0);
    });

    it('flags the grid`s outer edges', async () => {
      const ctx = renderChart({ fx: 'g', fy: 'h' });
      await expect.poll(() => ctx()?.facet.enabled).toBe(true);

      const byKey = Object.fromEntries(ctx().facet.panels.map((f) => [`${f.fx}/${f.fy}`, f]));
      expect(byKey['a/x']).toMatchObject({ left: true, top: true, right: false, bottom: false });
      expect(byKey['b/y']).toMatchObject({ left: false, top: false, right: true, bottom: true });
    });

    it('takes an explicit `fxDomain` for panel order', async () => {
      const ctx = renderChart({ fx: 'g', fxDomain: ['b', 'a'] });
      await expect.poll(() => ctx()?.facet.enabled).toBe(true);
      expect(ctx().facet.panels.map((f) => f.fx)).toEqual(['b', 'a']);
    });
  });

  describe('rendering', () => {
    it('repeats the marks once per panel', async () => {
      renderChart({ fx: 'g' });
      // every row still drawn, just distributed across the panels
      await expect.poll(() => document.querySelectorAll('circle').length).toBe(data.length);
      // ...inside one translated group per panel
      await expect
        .poll(() => document.querySelectorAll('svg g.lc-group, svg g[transform]').length)
        .toBeGreaterThanOrEqual(2);
    });

    it('keeps the scales shared, so equal values land at the same panel offset', async () => {
      // the same `v` in each panel — with shared scales both must resolve to the same
      // panel-relative `cx`, which is the whole point of faceting over separate charts
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data: [
            { g: 'a', v: 2, w: 10 },
            { g: 'b', v: 2, w: 10 },
          ],
          x: 'v',
          y: 'w',
          xDomain: [0, 5],
          yDomain: [0, 50],
          width: 400,
          height: 300,
          padding: 0,
          fx: 'g',
        },
        componentProps: { cx: 'v', cy: 'w', r: 2 },
        oncontext: (c: any) => (ctx = c),
      });

      await expect.poll(() => document.querySelectorAll('circle').length).toBe(2);
      const [first, second] = Array.from(document.querySelectorAll('circle'));
      expect(first.getAttribute('cx')).toBe(second.getAttribute('cx'));
      // and the panels themselves are offset from each other
      expect(ctx.facet.panels[1].x).toBeGreaterThan(0);
    });
  });

  describe('mark data', () => {
    it('draws the rows of the panel it renders into', async () => {
      // `h` splits 3 rows / 1 row, so the counts alone show the rows were partitioned rather
      // than every panel drawing the whole chart's data
      renderChart({ fx: 'h' });
      await expect.poll(() => document.querySelectorAll('circle').length).toBe(data.length);

      const perPanel = new Map<Element, number>();
      for (const circle of document.querySelectorAll('circle')) {
        const panel = circle.closest('g')!;
        perPanel.set(panel, (perPanel.get(panel) ?? 0) + 1);
      }
      expect([...perPanel.values()].sort()).toEqual([1, 3]);
    });

    it('lets a mark override the panel with its own `data`', async () => {
      renderChart({ fx: 'g' }, { data: [{ v: 1, w: 10 }] });
      // the one given row, drawn into each of the two panels
      await expect.poll(() => document.querySelectorAll('circle').length).toBe(2);
    });
  });
});
