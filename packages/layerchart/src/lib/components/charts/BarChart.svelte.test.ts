import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BarChart from './BarChart.svelte';
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

      // Click a legend button to select only that series (exclusive select)
      const legendButtons = container.querySelectorAll('.lc-legend-swatch-button');
      expect(legendButtons.length).toBe(4);
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
