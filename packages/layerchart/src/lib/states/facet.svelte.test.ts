import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleBand } from 'd3-scale';

import TestHarness from '$lib/tests/TestHarness.svelte';
import Circle from '../components/Circle/Circle.svelte';
import Highlight from '../components/Highlight/Highlight.svelte';
import ScatterChart from '../components/charts/ScatterChart/ScatterChart.svelte';
import BarChart from '../components/charts/BarChart/BarChart.svelte';
import Axis from '../components/Axis/Axis.svelte';
import { panelDatum } from '../utils/tooltip.js';
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

  describe('headers', () => {
    it('draws the panel headers from the default layout', async () => {
      // `FacetAxis` lives outside `Facet` so that `Axis` stays out of every layer's bundle —
      // `Chart`'s default layout renders it, and a composed chart adds `<FacetAxis />` itself
      render(ScatterChart, {
        props: { data, x: 'v', y: 'w', fx: 'g', width: 400, height: 300 },
      } as any);

      await expect.poll(() => document.querySelectorAll('.lc-facet-axis-x').length).toBe(1);
      const labels = Array.from(document.querySelectorAll('.lc-facet-axis-x text')).map((t) =>
        t.textContent?.trim()
      );
      expect(labels).toEqual(['a', 'b']);
    });

    it('draws the row headers when faceting on `fy`', async () => {
      render(ScatterChart, {
        props: { data, x: 'v', y: 'w', fy: 'h', width: 400, height: 300 },
      } as any);

      await expect.poll(() => document.querySelectorAll('.lc-facet-axis-y').length).toBe(1);
      const labels = Array.from(document.querySelectorAll('.lc-facet-axis-y text')).map((t) =>
        t.textContent?.trim()
      );
      expect(labels).toEqual(['x', 'y']);
    });

    it('repeats a data axis in every panel with `facetAll`', async () => {
      // Documented in the facets guide.  Without it an axis draws on the grid's outer edge only,
      // so `fx` with two columns would place a single `left` axis
      const chartProps = { data, x: 'v', y: 'w', fx: 'g', width: 400, height: 300, padding: 0 };

      render(TestHarness, {
        component: Axis,
        chartProps,
        componentProps: { placement: 'left', facetAll: true },
      } as any);
      await expect.poll(() => document.querySelectorAll('.lc-axis.placement-left').length).toBe(2);

      document.body.innerHTML = '';
      render(TestHarness, {
        component: Axis,
        chartProps,
        componentProps: { placement: 'left' },
      } as any);
      await expect.poll(() => document.querySelectorAll('.lc-axis.placement-left').length).toBe(1);
    });

    it('draws both headers on a two-dimensional grid', async () => {
      render(ScatterChart, {
        props: { data, x: 'v', y: 'w', fx: 'g', fy: 'h', width: 400, height: 300 },
      } as any);

      await expect.poll(() => document.querySelectorAll('.lc-facet-axis-x').length).toBe(1);
      expect(document.querySelectorAll('.lc-facet-axis-y').length).toBe(1);
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

    it('resolves per panel in rect modes, whose hit targets render per panel', async () => {
      // `bounds` / `band` build a `<rect>` per row inside the layer, so each panel draws its own
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data: [
            { g: 'a', cat: 'x', v: 10, id: 'a' },
            { g: 'b', cat: 'x', v: 20, id: 'b' },
          ],
          x: 'cat',
          xScale: scaleBand(),
          y: 'v',
          yDomain: [0, 50],
          width: 400,
          height: 300,
          padding: 0,
          fx: 'g',
          tooltipContext: { mode: 'band' },
        },
        componentProps: { cx: 'cat', cy: 'v', r: 3 },
        oncontext: (c: any) => (ctx = c),
      });

      await expect.poll(() => ctx?.facet.panels.length).toBe(2);
      // one hit rect per row, in its own panel — not every row in every panel
      await expect.poll(() => document.querySelectorAll('.lc-tooltip-rect').length).toBe(2);

      const rects = Array.from(document.querySelectorAll('.lc-tooltip-rect'));
      await vi.waitFor(() => {
        rects[1].dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
        rects[1].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
        expect(ctx.tooltip.data?.id).toBe('b');
      });
    });

    it('resolves per panel in voronoi mode, whose cells are built per panel', async () => {
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
          tooltipContext: { mode: 'voronoi' },
        },
        componentProps: { cx: 'v', cy: 'w', r: 3 },
        oncontext: (c: any) => (ctx = c),
      });

      await expect.poll(() => ctx?.facet.panels.length).toBe(2);
      // one cell per row, in its own panel — `Voronoi` is lazily imported
      await expect
        .poll(() => document.querySelectorAll('.lc-tooltip-voronoi-path').length)
        .toBe(paired.length);

      const cells = Array.from(document.querySelectorAll('.lc-tooltip-voronoi-path'));
      const ids = new Set<string>();
      for (const cell of cells) {
        cell.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
        ids.add(ctx.tooltip.data?.id);
      }
      // every row reachable, rather than the same panel's rows found twice over
      expect([...ids].sort()).toEqual(['a1', 'a4', 'b1', 'b4']);
    });

    it('resolves per panel in bisect modes too', async () => {
      const ctx = renderPaired({ tooltipContext: { mode: 'bisect-x' } });
      await expect.poll(() => ctx()?.facet.panels.length).toBe(2);

      await hoverPoint(ctx(), 1, 4, 40);
      await expect.poll(() => ctx().tooltip.data?.id).toBe('b4');

      await hoverPoint(ctx(), 0, 4, 40);
      await expect.poll(() => ctx().tooltip.data?.id).toBe('a4');
    });

    it('marks the same position in every panel with `facetAll`', async () => {
      // `v: 1` is in both panels; `v: 2` only in the first
      const shared = [
        { g: 'a', v: 1, w: 10 },
        { g: 'a', v: 2, w: 20 },
        { g: 'b', v: 1, w: 30 },
      ];
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Highlight,
        chartProps: {
          data: shared,
          x: 'v',
          y: 'w',
          xDomain: [0, 5],
          yDomain: [0, 50],
          width: 400,
          height: 300,
          padding: 0,
          fx: 'g',
        },
        componentProps: { points: true, lines: true, facetAll: true },
        oncontext: (c: any) => (ctx = c),
      });
      await expect.poll(() => ctx?.facet.panels.length).toBe(2);

      // both panels have a row at `v: 1`, so both mark it
      ctx.tooltip.show({ data: shared[0] });
      await expect.poll(() => document.querySelectorAll('.lc-highlight-point').length).toBe(2);

      // the second panel has nothing at `v: 2`, so it marks no point — but the crosshair, which
      // marks a position rather than a row, is still drawn in both
      ctx.tooltip.show({ data: shared[1] });
      await expect.poll(() => document.querySelectorAll('.lc-highlight-point').length).toBe(1);
      expect(document.querySelectorAll('.lc-highlight-line').length).toBe(2);
    });

    it('renders a tooltip per panel with `facetAll`, each showing its own row', async () => {
      // `props.tooltip.root` only reaches `DefaultTooltip`, which the default layout renders
      const shared = [
        { g: 'a', v: 1, w: 11 },
        { g: 'a', v: 4, w: 12 },
        { g: 'b', v: 1, w: 33 },
        { g: 'b', v: 4, w: 34 },
      ];
      // nested under `props`, since a bare `props` key would read as a Svelte mount option
      render(ScatterChart, {
        props: {
          data: shared,
          x: 'v',
          y: 'w',
          fx: 'g',
          xDomain: [0, 5],
          yDomain: [0, 50],
          width: 400,
          height: 300,
          padding: 0,
          props: { tooltip: { root: { facetAll: true } } },
        },
      } as any);

      const hitArea = (await vi.waitUntil(() =>
        document.querySelector('.lc-tooltip-context')
      )) as HTMLElement;

      await vi.waitFor(() => {
        const rect = hitArea.getBoundingClientRect();
        const eventInit = {
          bubbles: true,
          clientX: rect.x + rect.width * 0.05,
          clientY: rect.y + rect.height * 0.8,
        };
        hitArea.dispatchEvent(new PointerEvent('pointerenter', eventInit));
        hitArea.dispatchEvent(new PointerEvent('pointermove', eventInit));

        // one per panel, each showing its own row rather than the hovered one's
        const text = Array.from(document.querySelectorAll('.lc-tooltip-root')).map((t) =>
          t.textContent?.replace(/\s+/g, ' ').trim()
        );
        expect(text.length).toBe(2);
        expect(text.some((v) => v?.includes('11'))).toBe(true);
        expect(text.some((v) => v?.includes('33'))).toBe(true);
      });
    });

    describe('panel name', () => {
      const named = [
        { g: 0, name: 'North', m: 'Jan', v: 1, w: 11 },
        { g: 1, name: 'South', m: 'Jan', v: 1, w: 33 },
      ];

      /** What `DefaultTooltip` puts in front of the hovered value */
      function label(facet?: Record<string, any>) {
        const ctx = renderChart({ data: named, fx: 'g', ...(facet ? { facet } : null) });
        return (row: any) => ctx().facet.tooltipLabel(row);
      }

      it('is the panel`s `fx` / `fy` values', () => {
        expect(label()(named[0])).toBe(0);
      });

      it('joins both when the grid is crossed', () => {
        expect(label({})(named[0])).toBe(0);
        const crossed = renderChart({ data: named, fx: 'g', fy: 'name' });
        expect(crossed().facet.tooltipLabel(named[0])).toBe('0 · North');
      });

      it('is empty with `tooltip: false`', () => {
        expect(label({ tooltip: false })(named[0])).toBeUndefined();
      });

      it('comes off the row with a `tooltip` function', () => {
        // what a wrapped grid needs: `fx` is a position, and the name is on the row
        expect(label({ tooltip: (d: any) => d.name })(named[0])).toBe('North');
      });

      it('is empty when the `tooltip` function has nothing to give', () => {
        expect(label({ tooltip: () => null })(named[0])).toBeUndefined();
      });

      /**
       * The rendered tooltip header for the first panel's bar.
       *
       * A `BarChart` rather than the scatter above: `quadtree` / `voronoi` tooltips head their
       * list with the series instead, so the panel has nowhere to go there.
       */
      async function headerText(facet?: Record<string, any>) {
        render(BarChart, {
          props: {
            data: named,
            x: 'm',
            y: 'w',
            fx: 'g',
            series: [{ key: 'w' }],
            width: 400,
            height: 300,
            padding: 0,
            ...(facet ? { facet } : null),
          },
        } as any);

        // one hit rect per bar, since configured series rule out the panel being the band
        await expect.poll(() => document.querySelectorAll('.lc-tooltip-rect').length).toBe(2);
        const rect = document.querySelectorAll('.lc-tooltip-rect')[0];

        let text: string | undefined;
        await vi.waitFor(() => {
          rect.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
          rect.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));

          text = document.querySelector('.lc-tooltip-root')?.textContent?.replace(/\s+/g, ' ');
          expect(text).toBeTruthy();
        });
        return text!;
      }

      it('reaches the tooltip header', async () => {
        expect(await headerText()).toContain('0 · Jan');
      });

      it('reaches the tooltip header through a `tooltip` function', async () => {
        expect(await headerText({ tooltip: (d: any) => d.name })).toContain('North · Jan');
      });

      it('names each panel in its own tooltip with `facetAll`', async () => {
        // One tooltip per panel, each for a different row — a header read off the hovered row
        // would name the hovered panel in all of them
        render(ScatterChart, {
          props: {
            data: [
              { g: 'a', v: 1, w: 11 },
              { g: 'b', v: 1, w: 33 },
            ],
            x: 'v',
            y: 'w',
            fx: 'g',
            xDomain: [0, 5],
            yDomain: [0, 50],
            width: 400,
            height: 300,
            padding: 0,
            tooltipContext: { mode: 'bisect-x' },
            props: { tooltip: { root: { facetAll: true } } },
          },
        } as any);

        const hitArea = (await vi.waitUntil(() =>
          document.querySelector('.lc-tooltip-context')
        )) as HTMLElement;

        await vi.waitFor(() => {
          const rect = hitArea.getBoundingClientRect();
          const eventInit = {
            bubbles: true,
            clientX: rect.x + rect.width * 0.05,
            clientY: rect.y + rect.height * 0.5,
          };
          hitArea.dispatchEvent(new PointerEvent('pointerenter', eventInit));
          hitArea.dispatchEvent(new PointerEvent('pointermove', eventInit));

          const headers = Array.from(document.querySelectorAll('.lc-tooltip-header')).map((h) =>
            h.textContent?.replace(/\s+/g, ' ').trim()
          );
          expect(headers.length).toBe(2);
          expect(headers.some((h) => h?.startsWith('a'))).toBe(true);
          expect(headers.some((h) => h?.startsWith('b'))).toBe(true);
        });
      });
    });

    it('resolves each panel`s row at a hovered position', async () => {
      const ctx = renderPaired();
      await expect.poll(() => ctx()?.facet.panels.length).toBe(2);

      const [a, b] = ctx().facet.panels;
      // `v: 1` is in both panels, so each resolves its own row there
      expect(panelDatum(ctx(), a, paired[2])?.id).toBe('a1');
      expect(panelDatum(ctx(), b, paired[0])?.id).toBe('b1');
      // ...and nothing when the panel has no row at that position
      expect(panelDatum(ctx(), a, { v: 3, w: 30 })).toBeUndefined();
    });

    it('tells whether a row belongs to a panel', async () => {
      const ctx = renderPaired();
      await expect.poll(() => ctx()?.facet.panels.length).toBe(2);

      const [a, b] = ctx().facet.panels;
      expect(a.has(paired[0])).toBe(true);
      expect(b.has(paired[0])).toBe(false);
      // by `fx` value rather than identity, so a mark's own row belongs where its values place it
      expect(b.has({ g: 'b', v: 9, w: 9 })).toBe(true);
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

    it('confines the highlight to the panel owning the row', async () => {
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

      // both the point and the crosshair stay in that panel — `facetAll` opts into all of them
      await expect.poll(() => document.querySelectorAll('.lc-highlight-point').length).toBe(1);
      expect(document.querySelectorAll('.lc-highlight-line').length).toBe(1);
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
