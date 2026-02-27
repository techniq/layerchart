import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BarChart from './BarChart.svelte';

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
});
