import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleBand } from 'd3-scale';

import TestHarness from '../components/tests/TestHarness.svelte';
import Circle from '../components/Circle/Circle.svelte';
import Highlight from '../components/Highlight/Highlight.svelte';
import ScatterChart from '../components/charts/ScatterChart/ScatterChart.svelte';
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

  describe('interaction', () => {
    // Both panels hold the same values, so a lookup that isn't panel-scoped resolves to whichever
    // row it happens to reach first — the failure this guards against.
    const paired = [
      { g: 'a', v: 1, w: 10, id: 'a1' },
      { g: 'a', v: 4, w: 40, id: 'a4' },
      { g: 'b', v: 1, w: 10, id: 'b1' },
      { g: 'b', v: 4, w: 40, id: 'b4' },
    ];

    function renderPaired(chartProps: Record<string, any> = {}, componentProps = {}) {
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data: paired,
          x: 'v',
          y: 'w',
          xDomain: [0, 5],
          yDomain: [0, 50],
          width: 400,
          height: 300,
          padding: 0,
          fx: 'g',
          tooltipContext: { mode: 'quadtree' },
          ...chartProps,
        },
        componentProps: { cx: 'v', cy: 'w', r: 3, ...componentProps },
        oncontext: (c: any) => (ctx = c),
      });
      return () => ctx;
    }

    /** Hover the point `(v, w)` within a panel, in the coordinates the pointer actually reports */
    async function hoverPoint(
      ctx: ChartState<any, any, any>,
      panelIndex: number,
      v: number,
      w: number
    ) {
      const hitArea = document.querySelector('.lc-tooltip-context') as HTMLElement;
      const rect = hitArea.getBoundingClientRect();
      const panel = ctx.facet.panels[panelIndex];
      const eventInit = {
        bubbles: true,
        clientX: rect.x + panel.x + (ctx.xScale(v) as number),
        clientY: rect.y + panel.y + (ctx.yScale(w) as number),
      };
      hitArea.dispatchEvent(new PointerEvent('pointerenter', eventInit));
      hitArea.dispatchEvent(new PointerEvent('pointermove', eventInit));
    }

    it('covers the whole plot area, not just the first panel', async () => {
      const ctx = renderPaired();
      await expect.poll(() => ctx()?.facet.panels.length).toBe(2);

      const hitArea = document.querySelector('.lc-tooltip-context') as HTMLElement;
      // one panel is ~190px of the 400px plot — the pointer has to reach both
      expect(hitArea.getBoundingClientRect().width).toBeCloseTo(ctx().box.width, 0);
      expect(ctx().facet.width).toBeLessThan(ctx().box.width);
    });

    it('resolves the hovered panel`s row, not an equal one from another panel', async () => {
      const ctx = renderPaired();
      await expect.poll(() => ctx()?.facet.panels.length).toBe(2);

      // retried — `quadtree` modes build their trees behind a dynamic import
      await vi.waitFor(async () => {
        await hoverPoint(ctx(), 1, 1, 10);
        expect(ctx().tooltip.data?.id).toBe('b1');
      });

      await hoverPoint(ctx(), 0, 1, 10);
      await expect.poll(() => ctx().tooltip.data?.id).toBe('a1');
    });

    it('resolves per panel in bisect modes too', async () => {
      const ctx = renderPaired({ tooltipContext: { mode: 'bisect-x' } });
      await expect.poll(() => ctx()?.facet.panels.length).toBe(2);

      await hoverPoint(ctx(), 1, 4, 40);
      await expect.poll(() => ctx().tooltip.data?.id).toBe('b4');

      await hoverPoint(ctx(), 0, 4, 40);
      await expect.poll(() => ctx().tooltip.data?.id).toBe('a4');
    });

    it('positions a tooltip shown by data in that row`s panel', async () => {
      // the path a `ChartGroup`'s shared pointer takes — the row is resolved, not the point
      const ctx = renderPaired();
      await expect.poll(() => ctx()?.facet.panels.length).toBe(2);

      const second = ctx().facet.panels[1];
      ctx().tooltip.show({ data: paired[2] });
      await expect.poll(() => ctx().tooltip.data?.id).toBe('b1');

      expect(ctx().tooltip.x).toBeGreaterThanOrEqual(second.x);
      expect(ctx().tooltip.x).toBeLessThanOrEqual(second.x + second.width);
    });

    it('draws the highlight point only in the panel owning the row', async () => {
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Highlight,
        chartProps: {
          data: paired,
          x: 'v',
          y: 'w',
          xDomain: [0, 5],
          yDomain: [0, 50],
          width: 400,
          height: 300,
          padding: 0,
          fx: 'g',
        },
        componentProps: { points: true, lines: true },
        oncontext: (c: any) => (ctx = c),
      });
      await expect.poll(() => ctx?.facet.panels.length).toBe(2);

      ctx.tooltip.show({ data: paired[2] });

      // the crosshair is shared across panels, the point belongs to one
      await expect.poll(() => document.querySelectorAll('.lc-highlight-point').length).toBe(1);
      expect(document.querySelectorAll('.lc-highlight-line').length).toBeGreaterThan(1);
    });
  });

  describe('series', () => {
    // Both panels hold a `cat: 'x'` row, so a stack keyed only by the category collides and every
    // panel draws whichever row was stacked last
    const stacked = [
      { g: 'a', cat: 'x', v1: 1, v2: 2 },
      { g: 'b', cat: 'x', v1: 10, v2: 20 },
    ];

    it('stacks each panel`s rows among themselves', async () => {
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data: stacked,
          x: 'cat',
          xScale: scaleBand(),
          fx: 'g',
          series: [{ key: 'v1' }, { key: 'v2' }],
          seriesLayout: 'stack',
          width: 400,
          height: 300,
          padding: 0,
        },
        componentProps: { cx: 'cat', cy: 'v1', r: 2 },
        oncontext: (c: any) => (ctx = c),
      });

      await expect.poll(() => ctx?.facet.panels.length).toBe(2);

      // d3 attaches `data` to each stacked pair, so compare the values themselves
      const pair = (key: string, d: any) => {
        const value = ctx.series.getStackValue(key, d);
        return value && [value[0], value[1]];
      };

      expect(pair('v1', stacked[0])).toEqual([0, 1]);
      expect(pair('v2', stacked[0])).toEqual([1, 3]);
      expect(pair('v1', stacked[1])).toEqual([0, 10]);
      expect(pair('v2', stacked[1])).toEqual([10, 30]);
    });

    // Not a facet, but the same collision: `x1` subdivides each band, so both groups share a
    // `keyBy` value and their stacks would otherwise merge into one
    const grouped = [
      { year: 2019, basket: 1, apples: 10, bananas: 20 },
      { year: 2019, basket: 2, cherries: 5, grapes: 7 },
    ];

    it('stacks within each `x1` group', async () => {
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data: grouped,
          x: 'year',
          xScale: scaleBand(),
          x1: 'basket',
          x1Scale: scaleBand(),
          series: [{ key: 'apples' }, { key: 'bananas' }, { key: 'cherries' }, { key: 'grapes' }],
          seriesLayout: 'stack',
          width: 400,
          height: 300,
        },
        componentProps: { cx: 'year', cy: 'apples', r: 2 },
        oncontext: (c: any) => (ctx = c),
      });
      await expect.poll(() => ctx?.width).toBeGreaterThan(0);

      const pair = (key: string, d: any) => {
        const value = ctx.series.getStackValue(key, d);
        return value && [value[0], value[1]];
      };

      // each basket stacks from zero, rather than continuing the other's total
      expect(pair('apples', grouped[0])).toEqual([0, 10]);
      expect(pair('bananas', grouped[0])).toEqual([10, 30]);
      expect(pair('cherries', grouped[1])).toEqual([0, 5]);
      expect(pair('grapes', grouped[1])).toEqual([5, 12]);
    });
  });

  describe('clipping', () => {
    it('clips to the panel, so a zoomed mark can`t bleed into its neighbour', async () => {
      // `ChartClipPath` renders inside the layer, so each panel gets its own — sized from
      // `ctx.width` / `height`, which are the panel's box
      render(ScatterChart, {
        data,
        x: 'v',
        y: 'w',
        fx: 'g',
        brush: true,
        width: 400,
        height: 300,
      } as any);
      await expect.poll(() => document.querySelectorAll('circle').length).toBeGreaterThan(0);

      // clip geometry is a path: `M0,0 h<width> v<height> ...`
      const widths = Array.from(document.querySelectorAll('clipPath'))
        .map((clip) => Number(clip.getAttribute('path')?.match(/h(-?[\d.]+)/)?.[1]))
        .filter((width) => width > 0);
      const counts = new Map<number, number>();
      for (const width of widths) counts.set(width, (counts.get(width) ?? 0) + 1);

      // the marks clip is the narrowest, appears once per panel, and can't reach a neighbour
      const panelWidth = Math.min(...widths);
      expect(counts.get(panelWidth)).toBe(2);
      expect(panelWidth).toBeLessThan(400 / 2);
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
