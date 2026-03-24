import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';

import { ChartState } from './chart.svelte.js';
import type { ChartPropsWithoutHTML } from '$lib/components/Chart.svelte';

type TestData = { date: string; value: number };
type MultiSeriesData = { date: string; apples: number; bananas: number };

function createChartState<T = TestData>(props: Partial<ChartPropsWithoutHTML<T>>) {
  let cleanup: () => void;
  let state: ChartState<T>;

  cleanup = $effect.root(() => {
    state = new ChartState<T>(() => props as ChartPropsWithoutHTML<T>);
  });

  // Access derived values after reactive graph is set up
  flushSync();

  return { state: state!, cleanup };
}

describe('ChartState baseline domain', () => {
  describe('single series (default)', () => {
    it('should include yBaseline=0 in y domain when all values are positive', () => {
      const data: TestData[] = [
        { date: '2024-01', value: 10 },
        { date: '2024-02', value: 20 },
        { date: '2024-03', value: 30 },
      ];

      const { state, cleanup } = createChartState<TestData>({
        data,
        x: 'date',
        y: 'value',
        yBaseline: 0,
      });

      try {
        expect(state._yDomain).toEqual([0, 30]);
      } finally {
        cleanup();
      }
    });

    it('should include yBaseline=0 in y domain when all values are negative', () => {
      const data: TestData[] = [
        { date: '2024-01', value: -30 },
        { date: '2024-02', value: -20 },
        { date: '2024-03', value: -10 },
      ];

      const { state, cleanup } = createChartState<TestData>({
        data,
        x: 'date',
        y: 'value',
        yBaseline: 0,
      });

      try {
        expect(state._yDomain).toEqual([-30, 0]);
      } finally {
        cleanup();
      }
    });

    it('should not alter domain when baseline is within data range', () => {
      const data: TestData[] = [
        { date: '2024-01', value: -10 },
        { date: '2024-02', value: 20 },
      ];

      const { state, cleanup } = createChartState<TestData>({
        data,
        x: 'date',
        y: 'value',
        yBaseline: 0,
      });

      try {
        expect(state._yDomain).toEqual([-10, 20]);
      } finally {
        cleanup();
      }
    });

    it('should include xBaseline=0 in x domain for horizontal charts', () => {
      const data: TestData[] = [
        { date: '2024-01', value: 10 },
        { date: '2024-02', value: 20 },
      ];

      const { state, cleanup } = createChartState<TestData>({
        data,
        x: 'value',
        y: 'date',
        xBaseline: 0,
      });

      try {
        expect(state._xDomain).toEqual([0, 20]);
      } finally {
        cleanup();
      }
    });
  });

  describe('multi-series', () => {
    it('should include yBaseline=0 in y domain for multi-series', () => {
      const data: MultiSeriesData[] = [
        { date: '2024-01', apples: 10, bananas: 15 },
        { date: '2024-02', apples: 20, bananas: 25 },
      ];

      const { state, cleanup } = createChartState<MultiSeriesData>({
        data,
        x: 'date',
        yBaseline: 0,
        valueAxis: 'y',
        series: [{ key: 'apples' }, { key: 'bananas' }],
      });

      try {
        expect(state._yDomain).toEqual([0, 25]);
      } finally {
        cleanup();
      }
    });

    it('should include yBaseline=0 when all multi-series values are positive and above 0', () => {
      const data: MultiSeriesData[] = [
        { date: '2024-01', apples: 50, bananas: 60 },
        { date: '2024-02', apples: 70, bananas: 80 },
      ];

      const { state, cleanup } = createChartState<MultiSeriesData>({
        data,
        x: 'date',
        yBaseline: 0,
        valueAxis: 'y',
        series: [{ key: 'apples' }, { key: 'bananas' }],
      });

      try {
        // Without the fix, this would be [50, 80] (missing baseline)
        expect(state._yDomain).toEqual([0, 80]);
      } finally {
        cleanup();
      }
    });

    it('should include yBaseline=0 when all multi-series values are negative', () => {
      const data: MultiSeriesData[] = [
        { date: '2024-01', apples: -30, bananas: -20 },
        { date: '2024-02', apples: -10, bananas: -5 },
      ];

      const { state, cleanup } = createChartState<MultiSeriesData>({
        data,
        x: 'date',
        yBaseline: 0,
        valueAxis: 'y',
        series: [{ key: 'apples' }, { key: 'bananas' }],
      });

      try {
        expect(state._yDomain).toEqual([-30, 0]);
      } finally {
        cleanup();
      }
    });

    it('should include xBaseline=0 for horizontal multi-series', () => {
      const data: MultiSeriesData[] = [
        { date: '2024-01', apples: 10, bananas: 15 },
        { date: '2024-02', apples: 20, bananas: 25 },
      ];

      const { state, cleanup } = createChartState<MultiSeriesData>({
        data,
        y: 'date',
        xBaseline: 0,
        valueAxis: 'x',
        series: [{ key: 'apples' }, { key: 'bananas' }],
      });

      try {
        expect(state._xDomain).toEqual([0, 25]);
      } finally {
        cleanup();
      }
    });

    it('should work without baseline (no forced 0)', () => {
      const data: MultiSeriesData[] = [
        { date: '2024-01', apples: 50, bananas: 60 },
        { date: '2024-02', apples: 70, bananas: 80 },
      ];

      const { state, cleanup } = createChartState<MultiSeriesData>({
        data,
        x: 'date',
        valueAxis: 'y',
        series: [{ key: 'apples' }, { key: 'bananas' }],
      });

      try {
        // Without baseline, domain should just be extent of data
        expect(state._yDomain).toEqual([50, 80]);
      } finally {
        cleanup();
      }
    });
  });
});
