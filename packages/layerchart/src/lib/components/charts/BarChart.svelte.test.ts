import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BarChart from './BarChart/BarChart.svelte';
import BarChartFixedWidthTest from './BarChartFixedWidthTest.svelte';

const wideData = [
  { year: '2016', apples: 480, bananas: 240, cherries: 120, grapes: 50 },
  { year: '2017', apples: 960, bananas: 480, cherries: 240, grapes: 100 },
  { year: '2018', apples: 1920, bananas: 960, cherries: 480, grapes: 200 },
  { year: '2019', apples: 3840, bananas: 1920, cherries: 960, grapes: 400 },
];

const series = [
  { key: 'apples', color: 'red' },
  { key: 'bananas', color: 'yellow' },
  { key: 'cherries', color: 'pink' },
  { key: 'grapes', color: 'purple' },
];

const simpleData = [
  { name: 'A', value: 10 },
  { name: 'B', value: 20 },
  { name: 'C', value: 15 },
  { name: 'D', value: 25 },
];

describe('BarChart', () => {
  describe('faceted tooltip header', () => {
    function triggerTooltip(el: Element) {
      const r = el.getBoundingClientRect();
      const init = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
      el.dispatchEvent(new PointerEvent('pointerenter', init));
      el.dispatchEvent(new PointerEvent('pointermove', init));
    }

    async function headerAfterHover(container: HTMLElement) {
      let header = '';
      await vi.waitFor(() => {
        const rect = container.querySelector('.lc-tooltip-rect');
        expect(rect).not.toBeNull();
        triggerTooltip(rect!);
        const el = document.querySelector('.lc-tooltip-header');
        expect(el).not.toBeNull();
        header = el!.textContent?.trim() ?? '';
      });
      return header;
    }

    it('should name the panel in front of the band', async () => {
      // The band value alone names a row in every panel, so it only identifies the row with the
      // panel in front of it
      const { container } = render(BarChart, {
        props: {
          data: [
            { species: 'Adelie', island: 'Torgersen', count: 23, other: 5 },
            { species: 'Gentoo', island: 'Torgersen', count: 61, other: 7 },
          ],
          y: 'island',
          fy: 'species',
          series: [{ key: 'count' }, { key: 'other' }],
          seriesLayout: 'stack',
          orientation: 'horizontal',
          width: 400,
          height: 300,
        },
      } as any);

      expect(await headerAfterHover(container as HTMLElement)).toBe('Adelie · Torgersen');
    });

    it('should format the band value before joining the panel to it', async () => {
      // Joining raw would put a `Date`'s full string in the header
      const { container } = render(BarChart, {
        props: {
          data: [
            { region: 'North', date: new Date('2024-01-15T00:00:00Z'), count: 10, other: 2 },
            { region: 'South', date: new Date('2024-01-15T00:00:00Z'), count: 20, other: 3 },
          ],
          x: 'date',
          fx: 'region',
          series: [{ key: 'count' }, { key: 'other' }],
          seriesLayout: 'stack',
          width: 400,
          height: 300,
        },
      } as any);

      const header = await headerAfterHover(container as HTMLElement);
      expect(header).toMatch(/^North · /);
      expect(header).not.toMatch(/GMT|00:00:00/);
    });
  });

  describe('stacked bar rounding', () => {
    // A rounded corner renders as a `path` with an arc; a square one as a `rect`
    const isRounded = (el: Element) =>
      el.tagName === 'path' && /a[\d.]+,[\d.]+/.test(el.getAttribute('d') ?? '');

    it('should round the top series of each stack, per row', async () => {
      // `top` is absent from the second row, so `middle` is what the eye sees on top there
      const { container } = render(BarChart, {
        props: {
          data: [
            { year: '2024', bottom: 10, middle: 5, top: 3 },
            { year: '2025', bottom: 10, middle: 5 },
          ],
          x: 'year',
          series: [{ key: 'bottom' }, { key: 'middle' }, { key: 'top' }],
          seriesLayout: 'stack',
          width: 400,
          height: 300,
        },
      } as any);

      await expect.element(container.querySelector('svg')).toBeInTheDocument();

      // One per band: `top` for 2024 and `middle` for 2025
      const rounded = [...container.querySelectorAll('.lc-bar')].filter(isRounded);
      expect(rounded.length).toBe(2);
    });

    it('should leave the lower segments square', async () => {
      const { container } = render(BarChart, {
        props: {
          data: [{ year: '2024', bottom: 10, middle: 5, top: 3 }],
          x: 'year',
          series: [{ key: 'bottom' }, { key: 'middle' }, { key: 'top' }],
          seriesLayout: 'stack',
          width: 400,
          height: 300,
        },
      } as any);

      await expect.element(container.querySelector('svg')).toBeInTheDocument();

      const bars = [...container.querySelectorAll('.lc-bar')];
      expect(bars.filter(isRounded).length).toBe(1);
    });
  });

  describe('faceted tooltip hit regions', () => {
    const facetData = [
      { party: 'AfD', year: 2021, votes: 10, other: 3 },
      { party: 'AfD', year: 2025, votes: 20, other: 4 },
      { party: 'SPD', year: 2021, votes: 25, other: 5 },
      { party: 'SPD', year: 2025, votes: 16, other: 6 },
    ];

    it('should cover the whole panel when the panel is the band', async () => {
      const { container } = render(BarChart, {
        props: { data: facetData, x: 'year', y: 'votes', fx: 'party', width: 400, height: 300 },
      } as any);

      await expect.element(container.querySelector('svg')).toBeInTheDocument();

      // One per panel rather than one per bar — the tooltip lists the panel's rows
      const rects = container.querySelectorAll('.lc-tooltip-rect');
      expect(rects.length).toBe(2);
    });

    it('should stay per row when series rule the panel out as a band', async () => {
      // Each row carries the whole series set, so a panel-wide rect would resolve every hover in
      // the panel to its first row
      const { container } = render(BarChart, {
        props: {
          data: facetData,
          x: 'year',
          fx: 'party',
          series: [{ key: 'votes' }, { key: 'other' }],
          seriesLayout: 'stack',
          width: 400,
          height: 300,
        },
      } as any);

      await expect.element(container.querySelector('svg')).toBeInTheDocument();

      const rects = container.querySelectorAll('.lc-tooltip-rect');
      expect(rects.length).toBe(4);
    });
  });

  describe('per-row bar styles', () => {
    it('should resolve a `fillOpacity` accessor against each row', async () => {
      // The `Rect` a bar draws is handed computed dimensions, so it never sees the row itself —
      // the accessor has to be resolved by `Bar`
      // `BarChart` has a prop named `props`, which collides with the render option of that name
      const { container } = render(BarChart, {
        props: {
          data: simpleData,
          x: 'name',
          y: 'value',
          height: 300,
          props: { bars: { fillOpacity: (d: any) => (d.value > 15 ? 1 : 0.25) } },
        },
      } as any);

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const opacities = [...container.querySelectorAll('.lc-bar')].map((el) =>
        el.getAttribute('fill-opacity')
      );
      expect(opacities).toEqual(['0.25', '1', '0.25', '1']);
    });

    it('should still accept a plain `fillOpacity` value', async () => {
      // `BarChart` has a prop named `props`, which collides with the render option of that name
      const { container } = render(BarChart, {
        props: {
          data: simpleData,
          x: 'name',
          y: 'value',
          height: 300,
          props: { bars: { fillOpacity: 0.5 } },
        },
      } as any);

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const opacities = [...container.querySelectorAll('.lc-bar')].map((el) =>
        el.getAttribute('fill-opacity')
      );
      expect(opacities).toEqual(['0.5', '0.5', '0.5', '0.5']);
    });
  });

  describe('basic', () => {
    it('should render with default series when no series prop provided', async () => {
      const { container } = render(BarChart, {
        data: simpleData,
        x: 'name',
        y: 'value',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      // Should have bars rendered (one per data point)
      const bars = container.querySelectorAll('.lc-bars');
      expect(bars.length).toBe(1); // 1 Bars group for default series
    });

    it('should render vertical bars without NaN attributes', async () => {
      const { container } = render(BarChart, {
        data: simpleData,
        x: 'name',
        y: 'value',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      // No rect should have NaN attributes — this was a key bug
      const rects = container.querySelectorAll('rect');
      for (const rect of rects) {
        const y = rect.getAttribute('y');
        const height = rect.getAttribute('height');
        const x = rect.getAttribute('x');
        const width = rect.getAttribute('width');
        if (y) expect(y).not.toBe('NaN');
        if (height) expect(height).not.toBe('NaN');
        if (x) expect(x).not.toBe('NaN');
        if (width) expect(width).not.toBe('NaN');
      }
    });

    it('should render horizontal bars', async () => {
      const { container } = render(BarChart, {
        data: simpleData,
        x: 'value',
        y: 'name',
        orientation: 'horizontal',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const bars = container.querySelectorAll('.lc-bars');
      expect(bars.length).toBe(1);
    });
  });

  describe('series', () => {
    it('should render multiple Bars groups for each series', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        x: 'year',
        series,
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      // Should have 4 Bars groups (one per series)
      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(4);
    });

    it('should render stacked series', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        x: 'year',
        series,
        seriesLayout: 'stack',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(4);

      // Stacked bars should not have NaN values
      const rects = container.querySelectorAll('rect');
      for (const rect of rects) {
        const y = rect.getAttribute('y');
        const height = rect.getAttribute('height');
        if (y) expect(y).not.toBe('NaN');
        if (height) expect(height).not.toBe('NaN');
      }
    });

    it('should render stacked series horizontally', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        y: 'year',
        series,
        seriesLayout: 'stack',
        orientation: 'horizontal',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(4);
    });

    it('should render grouped series', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        x: 'year',
        series,
        seriesLayout: 'group',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(4);
    });

    it('should render stackExpand series', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        x: 'year',
        series,
        seriesLayout: 'stackExpand',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(4);
    });

    it('should render stackDiverging series', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        x: 'year',
        series,
        seriesLayout: 'stackDiverging',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(4);
    });

    describe('stackDiverging edge rounding', () => {
      it('should round the tip of each direction, not inner layers', async () => {
        // apples (positive inner), grapes (positive tip), bananas (negative tip)
        const { container } = render(BarChart, {
          data: wideData,
          x: 'year',
          series: [
            { key: 'apples', color: 'red' },
            { key: 'grapes', color: 'purple' },
            { key: 'bananas', value: (d: any) => -d.bananas, color: 'yellow' },
          ],
          seriesLayout: 'stackDiverging',
          height: 300,
        });

        const barsGroups = container.querySelectorAll('.lc-bars');
        expect(barsGroups.length).toBe(3);

        // apples (inner positive layer) → rounded='none' → <rect>, not <path>
        expect(barsGroups[0].querySelectorAll('rect.lc-bar').length).toBe(wideData.length);
        expect(barsGroups[0].querySelectorAll('path.lc-bar').length).toBe(0);

        // grapes (tip of positive stack) → rounded='edge' → <path> with top arcs
        const grapesPaths = barsGroups[1].querySelectorAll('path.lc-bar');
        expect(grapesPaths.length).toBe(wideData.length);
        grapesPaths.forEach((p) => {
          // top-right arc has positive x,y deltas: a r,r 0 0 1 +r,+r
          expect(p.getAttribute('d')).toMatch(/a[\d.]+,[\d.]+ 0 0 1 [\d.]+,[\d.]+/);
        });

        // bananas (tip of negative stack) → rounded='edge' → <path> with bottom arcs
        const bananasPaths = barsGroups[2].querySelectorAll('path.lc-bar');
        expect(bananasPaths.length).toBe(wideData.length);
        bananasPaths.forEach((p) => {
          // bottom-right arc has negative x, positive y delta: a r,r 0 0 1 -r,+r
          expect(p.getAttribute('d')).toMatch(/a[\d.]+,[\d.]+ 0 0 1 -[\d.]+,[\d.]+/);
        });
      });

      it('should round both tips when there is one positive and one negative series', async () => {
        const { container } = render(BarChart, {
          data: wideData,
          x: 'year',
          series: [
            { key: 'apples', color: 'red' },
            { key: 'bananas', value: (d: any) => -d.bananas, color: 'yellow' },
          ],
          seriesLayout: 'stackDiverging',
          height: 300,
        });

        const barsGroups = container.querySelectorAll('.lc-bars');
        expect(barsGroups.length).toBe(2);

        // apples is the only positive series → it is the tip → <path> with top arcs
        const applesPaths = barsGroups[0].querySelectorAll('path.lc-bar');
        expect(applesPaths.length).toBe(wideData.length);
        applesPaths.forEach((p) => {
          // top-right arc has positive x,y deltas: a r,r 0 0 1 +r,+r
          expect(p.getAttribute('d')).toMatch(/a[\d.]+,[\d.]+ 0 0 1 [\d.]+,[\d.]+/);
        });

        // bananas is the only negative series → it is the tip → <path> with bottom arcs
        const bananasPaths = barsGroups[1].querySelectorAll('path.lc-bar');
        expect(bananasPaths.length).toBe(wideData.length);
        bananasPaths.forEach((p) => {
          // bottom-right arc has negative x, positive y delta: a r,r 0 0 1 -r,+r
          expect(p.getAttribute('d')).toMatch(/a[\d.]+,[\d.]+ 0 0 1 -[\d.]+,[\d.]+/);
        });
      });
    });

    it('tooltip should use explicit series colors, not color scale', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        x: 'year',
        series: [
          { key: 'apples', color: 'rgb(255, 0, 0)' },
          { key: 'bananas', color: 'rgb(0, 128, 0)' },
          { key: 'cherries', color: 'rgb(0, 0, 255)' },
          { key: 'grapes', color: 'rgb(128, 0, 128)' },
        ],
        seriesLayout: 'group',
        height: 300,
        width: 400,
      });

      // Hover the tooltip band overlay rect to trigger the tooltip
      const tooltipRect = container.querySelector('.lc-tooltip-rect') as SVGElement | null;
      await expect.element(tooltipRect).toBeInTheDocument();

      const rect = tooltipRect!.getBoundingClientRect();
      const eventInit = {
        bubbles: true,
        clientX: rect.x + rect.width / 2,
        clientY: rect.y + rect.height / 2,
      };

      tooltipRect!.dispatchEvent(new PointerEvent('pointerenter', eventInit));
      tooltipRect!.dispatchEvent(new PointerEvent('pointermove', eventInit));

      await vi.waitFor(() => {
        const colorDots = document.querySelectorAll('.lc-tooltip-item-color');
        expect(colorDots.length).toBe(4);

        const colors = Array.from(colorDots).map((dot) =>
          (dot as HTMLElement).style.getPropertyValue('--color')
        );

        expect(colors).toEqual([
          'rgb(255, 0, 0)',
          'rgb(0, 128, 0)',
          'rgb(0, 0, 255)',
          'rgb(128, 0, 128)',
        ]);
      });
    });
  });

  describe('no series prop (transition example pattern)', () => {
    // This tests the pattern used in the vertical-grouped-stacked-or-both-transition example
    // where Chart is used directly without series prop. Previously caused effect_update_depth_exceeded.
    it('should render without series prop and not produce NaN rect attributes', async () => {
      const { container } = render(BarChart, {
        data: simpleData,
        x: 'name',
        y: 'value',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      // Verify isDefaultSeries path works — no NaN values
      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(0);
      for (const rect of rects) {
        const y = rect.getAttribute('y');
        const height = rect.getAttribute('height');
        if (y) expect(y).not.toBe('NaN');
        if (height) expect(height).not.toBe('NaN');
      }
    });
  });

  describe('legend series toggle adjusts group scale', () => {
    it('should adjust grouped bar widths when series are toggled via legend', async () => {
      const { container } = render(BarChart, {
        data: wideData,
        x: 'year',
        series,
        seriesLayout: 'group',
        legend: true,
        height: 300,
        width: 400,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      // Get initial bar widths (4 series visible)
      // Bars may be <rect> or <path> (when rounded), so query by class
      const getBarWidths = () =>
        Array.from(container.querySelectorAll('.lc-bar')).map((el) => {
          if (el.tagName === 'rect') {
            return parseFloat(el.getAttribute('width')!);
          }
          // For <path> bars, use bounding box width
          return (el as SVGGraphicsElement).getBBox().width;
        });

      await vi.waitFor(() => {
        const widths = getBarWidths();
        expect(widths.length).toBeGreaterThan(0);
      });

      const initialWidths = getBarWidths();
      const initialBarWidth = initialWidths[0];

      // Click a legend button to select only that series (exclusive select).
      // `Legend` is lazy-loaded inside `ChartChildren`, so wait for the buttons
      // to mount before interacting.
      let legendButtons: NodeListOf<Element> = container.querySelectorAll(
        '.lc-legend-swatch-button'
      );
      await vi.waitFor(() => {
        legendButtons = container.querySelectorAll('.lc-legend-swatch-button');
        expect(legendButtons.length).toBe(4);
      });
      (legendButtons[1] as HTMLElement).click();

      // After selecting one series, only that series' bars should remain and be wider
      await vi.waitFor(() => {
        const widths = getBarWidths();
        // Should only have bars for 1 visible series now (1 series × 4 data points)
        expect(widths.length).toBe(wideData.length);
        // Each bar should be wider than before since the group band is divided among fewer series
        expect(widths[0]).toBeGreaterThan(initialBarWidth);
      });
    });
  });

  describe('legend `c` category toggle', () => {
    // `x1` groups long data on its own, so the legend's items are the `c` categories rather than
    // series — the lone implicit series names none of them
    const longData = [
      { year: '2019', fruit: 'apples', value: 30 },
      { year: '2019', fruit: 'bananas', value: 20 },
      { year: '2020', fruit: 'apples', value: 40 },
      { year: '2020', fruit: 'bananas', value: 10 },
    ];

    const longDataProps = {
      data: longData,
      x: 'year',
      x1: 'fruit',
      y: 'value',
      seriesLayout: 'group' as const,
      c: 'fruit',
      cRange: ['red', 'yellow'],
      legend: true,
      width: 400,
      height: 300,
    };

    async function legendButtons(container: HTMLElement) {
      // `Legend` is lazy-loaded inside `ChartChildren`
      let buttons: NodeListOf<Element> = container.querySelectorAll('.lc-legend-swatch-button');
      await vi.waitFor(() => {
        buttons = container.querySelectorAll('.lc-legend-swatch-button');
        expect(buttons.length).toBe(2);
      });
      return buttons;
    }

    const bars = (container: HTMLElement) =>
      Array.from(container.querySelectorAll('.lc-bar')).map((el) => ({
        fill: el.getAttribute('fill'),
        opacity: (el as SVGElement).style.opacity || el.getAttribute('opacity') || '1',
      }));

    it('should hide a category\u2019s bars when its legend item is clicked', async () => {
      const { container } = render(BarChart, longDataProps as any);

      const buttons = await legendButtons(container);
      await vi.waitFor(() => expect(bars(container).length).toBe(4));

      (buttons[0] as HTMLElement).click();

      await vi.waitFor(() => {
        // Only apples remain, and they keep the color the full domain gave them
        expect(bars(container)).toEqual([
          { fill: 'red', opacity: '1' },
          { fill: 'red', opacity: '1' },
        ]);
      });
    });

    it('should stack the categories when `seriesLayout="stack"`', async () => {
      // Nothing declares the layers — the rows carry them, so `c` names the stack the way
      const { container } = render(BarChart, {
        ...longDataProps,
        x1: undefined,
        seriesLayout: 'stack',
      } as any);

      await vi.waitFor(() => expect(bars(container).length).toBe(4));

      const stacked = Array.from(container.querySelectorAll('.lc-bar')).map((el) => {
        const box = (el as SVGGraphicsElement).getBBox();
        return {
          fill: el.getAttribute('fill'),
          y: Math.round(box.y),
          height: Math.round(box.height),
        };
      });

      // Each band's segments meet — the lower one's top edge is the upper one's bottom
      const [firstLower, firstUpper] = stacked;
      expect(firstLower.fill).toBe('red');
      expect(firstUpper.fill).toBe('yellow');
      expect(firstUpper.y + firstUpper.height).toBe(firstLower.y);
      // ...and together they fill the band, since the domain covers the total
      expect(firstUpper.y).toBe(0);
    });

    it('should restack from what is left when a category is hidden', async () => {
      const { container } = render(BarChart, {
        ...longDataProps,
        x1: undefined,
        seriesLayout: 'stack',
      } as any);

      const baseOf = (el: Element) => {
        const box = (el as SVGGraphicsElement).getBBox();
        return Math.round(box.y + box.height);
      };

      const buttons = await legendButtons(container);
      await vi.waitFor(() => expect(bars(container).length).toBe(4));
      const baseline = Math.max(...Array.from(container.querySelectorAll('.lc-bar')).map(baseOf));

      (buttons[0] as HTMLElement).click();

      await vi.waitFor(() => {
        const rest = Array.from(container.querySelectorAll('.lc-bar'));
        expect(rest.length).toBe(2);
        // The remaining category sits on the axis rather than floating where the other left it
        for (const el of rest) {
          expect(baseOf(el)).toBe(baseline);
        }
      });
    });

    it('should fade the other categories while a legend item is hovered', async () => {
      const { container } = render(BarChart, longDataProps as any);

      const buttons = await legendButtons(container);
      await vi.waitFor(() => expect(bars(container).length).toBe(4));

      buttons[0].dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));

      await vi.waitFor(() => {
        expect(bars(container).map((b) => `${b.fill}:${b.opacity}`)).toEqual([
          'red:1',
          'yellow:0.1',
          'red:1',
          'yellow:0.1',
        ]);
      });
    });
  });

  describe('long data stacking', () => {
    // One row per observation, with the category in a column — no `series` to name the layers
    const stackedLongData = [
      { year: '2019', panel: 'a', fruit: 'apples', value: 30 },
      { year: '2019', panel: 'a', fruit: 'bananas', value: 10 },
      { year: '2020', panel: 'b', fruit: 'apples', value: 20 },
      { year: '2020', panel: 'b', fruit: 'bananas', value: 60 },
    ];

    const stackedProps = {
      data: stackedLongData,
      x: 'year',
      y: 'value',
      c: 'fruit',
      cRange: ['red', 'yellow'],
      width: 400,
      height: 300,
    };

    async function segments(container: HTMLElement) {
      await vi.waitFor(() => expect(container.querySelectorAll('.lc-bar').length).toBe(4));
      return Array.from(container.querySelectorAll('.lc-bar')).map((el) => {
        const box = (el as SVGGraphicsElement).getBBox();
        return {
          top: Math.round(box.y),
          bottom: Math.round(box.y + box.height),
          rounded: /[Aa]/.test(el.getAttribute('d') ?? ''),
        };
      });
    }

    /** The two segments of a band, outermost from the baseline first */
    const band = (bars: Awaited<ReturnType<typeof segments>>, i: number) =>
      bars.slice(i * 2, i * 2 + 2).sort((a, b) => a.top - b.top);

    it('should normalize each band with `stackExpand`', async () => {
      const { container } = render(BarChart, {
        ...stackedProps,
        seriesLayout: 'stackExpand',
      } as any);
      const bars = await segments(container);

      // Both bands fill the plot, whatever their totals — 40 and 80 here
      for (const i of [0, 1]) {
        const [upper, lower] = band(bars, i);
        expect(upper.top).toBe(0);
        expect(upper.bottom).toBe(lower.top);
      }
      expect(band(bars, 0)[0].bottom).not.toBe(band(bars, 1)[0].bottom); // different splits
    });

    it('should round only the outermost segment under `stackExpand`', async () => {
      // Normalized spans all sit in [0, 1], so `isStackTop` compares magnitudes that barely differ
      const { container } = render(BarChart, {
        ...stackedProps,
        seriesLayout: 'stackExpand',
      } as any);
      const bars = await segments(container);

      for (const i of [0, 1]) {
        const [upper, lower] = band(bars, i);
        expect(upper.rounded).toBe(true);
        expect(lower.rounded).toBe(false);
      }
    });

    it('should list the band\u2019s rows in the tooltip when `c` stacks them', async () => {
      // Nothing subdivides the band here — without `x1`, the tooltip has to recognise that `c` is
      // what put several rows in it, or it names only the row the pointer resolved to
      const { container } = render(BarChart, stackedProps as any);
      await segments(container);

      // Band mode hit-tests against a rect per band, and `DefaultTooltip` is lazy — so keep
      // dispatching at the first band until it has mounted
      await vi.waitFor(() => {
        const hit = container.querySelector('.lc-tooltip-rect');
        expect(hit).not.toBeNull();
        const rect = hit!.getBoundingClientRect();
        const init = {
          bubbles: true,
          clientX: rect.x + rect.width / 2,
          clientY: rect.y + rect.height / 2,
        };
        hit!.dispatchEvent(new PointerEvent('pointerenter', init));
        hit!.dispatchEvent(new PointerEvent('pointermove', init));
        expect(document.querySelector('.lc-tooltip-item-root')).not.toBeNull();
      });

      await vi.waitFor(() => {
        const labels = Array.from(document.querySelectorAll('.lc-tooltip-item-label')).map((l) =>
          l.textContent?.trim()
        );
        expect(labels).toEqual(['apples', 'bananas', 'total']);
      });
    });

    it('should stack each facet panel against its own rows', async () => {
      const { container } = render(BarChart, { ...stackedProps, fx: 'panel' } as any);
      const bars = await segments(container);

      // A panel's stack is built from that panel's rows — the segments meet within it rather
      // than accumulating across panels
      for (const i of [0, 1]) {
        const [upper, lower] = band(bars, i);
        expect(upper.bottom).toBe(lower.top);
      }
    });
  });

  describe('separate data per series', () => {
    const separateData = {
      apples: [
        { year: '2016', value: 480 },
        { year: '2017', value: 960 },
        { year: '2018', value: 1920 },
        { year: '2019', value: 3840 },
      ],
      bananas: [
        { year: '2016', value: 240 },
        { year: '2017', value: 480 },
        { year: '2018', value: 960 },
        { year: '2019', value: 1920 },
      ],
    };

    it('should render stacked series with separate data arrays', async () => {
      const { container } = render(BarChart, {
        x: 'year',
        y: 'value',
        series: [
          { key: 'apples', color: 'red', data: separateData.apples },
          { key: 'bananas', color: 'yellow', data: separateData.bananas },
        ],
        seriesLayout: 'stack',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(2);

      // Stacked bars with separate data should not have NaN values
      const rects = container.querySelectorAll('rect');
      for (const rect of rects) {
        const y = rect.getAttribute('y');
        const height = rect.getAttribute('height');
        if (y) expect(y).not.toBe('NaN');
        if (height) expect(height).not.toBe('NaN');
      }
    });

    it('should render overlapping series with separate data arrays', async () => {
      const { container } = render(BarChart, {
        x: 'year',
        y: 'value',
        series: [
          { key: 'apples', color: 'red', data: separateData.apples },
          { key: 'bananas', color: 'yellow', data: separateData.bananas },
        ],
        seriesLayout: 'overlap',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const barsGroups = container.querySelectorAll('.lc-bars');
      expect(barsGroups.length).toBe(2);
    });
  });

  describe('fixed width/height', () => {
    it('should render vertical bars with fixed width', async () => {
      const { container } = render(BarChartFixedWidthTest, {
        data: simpleData,
        x: 'name',
        y: 'value',
        barWidth: 20,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(0);
      for (const rect of rects) {
        const width = rect.getAttribute('width');
        expect(width).toBe('20');
      }
    });

    it('should center fixed-width bars within their band', async () => {
      const { container } = render(BarChartFixedWidthTest, {
        data: simpleData,
        x: 'name',
        y: 'value',
        barWidth: 10,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(0);

      // All bars should have the fixed width
      for (const rect of rects) {
        expect(rect.getAttribute('width')).toBe('10');
      }

      // Bars should have different x positions (centered within each band)
      const xPositions = Array.from(rects).map((r) => parseFloat(r.getAttribute('x')!));
      const uniquePositions = new Set(xPositions);
      expect(uniquePositions.size).toBe(simpleData.length);
    });

    it('should render horizontal bars with fixed height', async () => {
      const { container } = render(BarChartFixedWidthTest, {
        data: simpleData,
        x: 'value',
        y: 'name',
        orientation: 'horizontal',
        barHeight: 15,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(0);
      for (const rect of rects) {
        const height = rect.getAttribute('height');
        expect(height).toBe('15');
      }
    });
  });
});
