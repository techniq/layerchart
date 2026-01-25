import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AreaChart from './AreaChart.svelte';

const seriesData = [
  { date: new Date('2024-01-01'), one: 10, two: 20, three: 15 },
  { date: new Date('2024-01-02'), one: 15, two: 25, three: 20 },
  { date: new Date('2024-01-03'), one: 12, two: 18, three: 22 },
  { date: new Date('2024-01-04'), one: 20, two: 30, three: 25 },
  { date: new Date('2024-01-05'), one: 18, two: 22, three: 28 },
];

const separateSeriesData = {
  one: [
    { date: new Date('2024-01-01'), value: 10 },
    { date: new Date('2024-01-02'), value: 15 },
    { date: new Date('2024-01-03'), value: 12 },
    { date: new Date('2024-01-04'), value: 20 },
    { date: new Date('2024-01-05'), value: 18 },
  ],
  two: [
    { date: new Date('2024-01-01'), value: 20 },
    { date: new Date('2024-01-02'), value: 25 },
    { date: new Date('2024-01-03'), value: 18 },
    { date: new Date('2024-01-04'), value: 30 },
    { date: new Date('2024-01-05'), value: 22 },
  ],
  three: [
    { date: new Date('2024-01-01'), value: 15 },
    { date: new Date('2024-01-02'), value: 20 },
    { date: new Date('2024-01-03'), value: 22 },
    { date: new Date('2024-01-04'), value: 25 },
    { date: new Date('2024-01-05'), value: 28 },
  ],
};

describe(`AreaChart`, () => {
  describe('basic', () => {
    it('should render with single series when no series prop provided', async () => {
      const simpleData = [
        { date: new Date('2024-01-01'), value: 10 },
        { date: new Date('2024-01-02'), value: 15 },
        { date: new Date('2024-01-03'), value: 12 },
      ];

      const { container } = render(AreaChart, {
        data: simpleData,
        x: 'date',
        y: 'value',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();

      // Should have 1 area path for default series
      const paths = container.querySelectorAll('path.lc-area-path');
      expect(paths.length).toBe(1);
    });

    it('should render multiple area paths for each series', async () => {
      const { container } = render(AreaChart, {
        data: seriesData,
        x: 'date',
        series: [
          { key: 'one', color: 'blue' },
          { key: 'two', color: 'green' },
          { key: 'three', color: 'orange' },
        ],
        height: 300,
      });

      // Should have 3 area paths (one for each series)
      const paths = container.querySelectorAll('path.lc-area-path');
      expect(paths.length).toBe(3);
    });

    it('should render multiple area paths for each series with separate data', async () => {
      const { container } = render(AreaChart, {
        x: 'date',
        y: 'value',
        series: [
          { key: 'one', color: 'blue', data: separateSeriesData.one },
          { key: 'two', color: 'green', data: separateSeriesData.two },
          { key: 'three', color: 'orange', data: separateSeriesData.three },
        ],
        height: 300,
      });

      // Should have 3 area paths (one for each series)
      const paths = container.querySelectorAll('path.lc-area-path');
      expect(paths.length).toBe(3);
    });

    it('should render multiple area paths for each series with separate data and stack layout', async () => {
      const { container } = render(AreaChart, {
        x: 'date',
        y: 'value',
        series: [
          { key: 'one', color: 'blue', data: separateSeriesData.one },
          { key: 'two', color: 'green', data: separateSeriesData.two },
          { key: 'three', color: 'orange', data: separateSeriesData.three },
        ],
        seriesLayout: 'stack',
        height: 300,
      });

      // Should have 3 area paths (one for each series)
      const paths = container.querySelectorAll('path.lc-area-path');
      expect(paths.length).toBe(3);
    });
  });

  describe('series layout', () => {
    it('should render with overlap layout', async () => {
      const { container } = render(AreaChart, {
        data: seriesData,
        x: 'date',
        series: [
          { key: 'one', color: 'blue' },
          { key: 'two', color: 'green' },
        ],
        seriesLayout: 'overlap',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();
    });

    it('should render with stack layout', async () => {
      const { container } = render(AreaChart, {
        data: seriesData,
        x: 'date',
        series: [
          { key: 'one', color: 'blue' },
          { key: 'two', color: 'green' },
        ],
        seriesLayout: 'stack',
        height: 300,
      });

      const svg = container.querySelector('svg');
      await expect.element(svg).toBeInTheDocument();
    });
  });
});
