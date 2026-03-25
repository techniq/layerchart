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

describe('ChartState mark registration', () => {
  it('should register and unregister marks', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
    });

    try {
      expect(state.seriesState.isDefaultSeries).toBe(true);

      const unregister = state.registerMark(() => ({ y: 'value', color: 'red' }));
      flushSync();

      // After registration, implicit series should be created
      expect(state.seriesState.isDefaultSeries).toBe(false);
      expect(state.seriesState.series).toHaveLength(1);
      expect(state.seriesState.series[0].key).toBe('value');
      expect(state.seriesState.series[0].color).toBe('red');

      unregister();
      flushSync();

      // After unregistration, should revert to default
      expect(state.seriesState.isDefaultSeries).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('should generate implicit series from marks with string y accessors', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 10, bananas: 15 },
      { date: '2024-02', apples: 20, bananas: 25 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      data,
      x: 'date',
    });

    try {
      state.registerMark(() => ({ y: 'apples', color: 'red' }));
      state.registerMark(() => ({ y: 'bananas', color: 'yellow' }));
      flushSync();

      expect(state.seriesState.isDefaultSeries).toBe(false);
      expect(state.seriesState.series).toHaveLength(2);
      expect(state.seriesState.series[0]).toMatchObject({ key: 'apples', color: 'red' });
      expect(state.seriesState.series[1]).toMatchObject({ key: 'bananas', color: 'yellow' });
    } finally {
      cleanup();
    }
  });

  it('should generate implicit series from marks with seriesKey', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
    });

    try {
      state.registerMark(() => ({ seriesKey: 'temp', color: 'blue' }));
      state.registerMark(() => ({ seriesKey: 'humidity', color: 'green' }));
      flushSync();

      expect(state.seriesState.series).toHaveLength(2);
      expect(state.seriesState.series[0].key).toBe('temp');
      expect(state.seriesState.series[1].key).toBe('humidity');
    } finally {
      cleanup();
    }
  });

  it('should generate implicit series from x accessor for vertical charts (valueAxis=x)', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 10, bananas: 15 },
      { date: '2024-02', apples: 20, bananas: 25 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      data,
      y: 'date',
      valueAxis: 'x',
    });

    try {
      state.registerMark(() => ({ x: 'apples', color: 'red' }));
      state.registerMark(() => ({ x: 'bananas', color: 'yellow' }));
      flushSync();

      expect(state.seriesState.isDefaultSeries).toBe(false);
      expect(state.seriesState.series).toHaveLength(2);
      expect(state.seriesState.series[0]).toMatchObject({ key: 'apples', color: 'red', value: 'apples' });
      expect(state.seriesState.series[1]).toMatchObject({ key: 'bananas', color: 'yellow', value: 'bananas' });
    } finally {
      cleanup();
    }
  });

  it('should not generate implicit series when explicit series are provided', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 10, bananas: 15 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      data,
      x: 'date',
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      // Register marks that would normally create implicit series
      state.registerMark(() => ({ y: 'apples', color: 'red' }));
      state.registerMark(() => ({ y: 'bananas', color: 'yellow' }));
      flushSync();

      // Explicit series should take precedence
      expect(state.seriesState.series).toHaveLength(2);
      expect(state.seriesState.series[0].color).toBeUndefined(); // explicit series has no color
    } finally {
      cleanup();
    }
  });

  it('should deduplicate implicit series with the same key', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
    });

    try {
      // Two marks referencing the same y accessor
      state.registerMark(() => ({ y: 'value', color: 'red' }));
      state.registerMark(() => ({ y: 'value', color: 'blue' }));
      flushSync();

      // Should only create one series (first wins)
      expect(state.seriesState.series).toHaveLength(1);
      expect(state.seriesState.series[0].key).toBe('value');
    } finally {
      cleanup();
    }
  });

  it('should include mark data in flatData for domain calculation', () => {
    const markData = [
      { date: '2024-01', value: 100 },
      { date: '2024-02', value: 200 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      x: 'date',
      y: 'value',
    });

    try {
      state.registerMark(() => ({ data: markData }));
      flushSync();

      expect(state.flatData).toHaveLength(2);
      expect(state.flatData).toEqual(markData);
    } finally {
      cleanup();
    }
  });

  it('should skip marks without a derivable key for implicit series', () => {
    const { state, cleanup } = createChartState<TestData>({
      x: 'date',
      y: 'value',
    });

    try {
      // Mark with data but no string y or seriesKey — no implicit series
      state.registerMark(() => ({ data: [{ date: '2024-01', value: 10 }] }));
      flushSync();

      expect(state.seriesState.isDefaultSeries).toBe(true);
      // But data should still be in flatData
      expect(state.flatData).toHaveLength(1);
    } finally {
      cleanup();
    }
  });

  it('should aggregate y accessor from implicit series into resolveAccessor', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 10, bananas: 50 },
      { date: '2024-02', apples: 20, bananas: 80 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      data,
      x: 'date',
      // No y prop — should be derived from marks
    });

    try {
      state.registerMark(() => ({ y: 'apples', color: 'red' }));
      state.registerMark(() => ({ y: 'bananas', color: 'yellow' }));
      flushSync();

      // y accessor should return both values
      const result = state.y(data[0]);
      expect(result).toEqual([10, 50]);
    } finally {
      cleanup();
    }
  });

  it('should include per-mark data in domain via implicit series', () => {
    const markData1 = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 20 },
    ];
    const markData2 = [
      { date: '2024-01', value: 50 },
      { date: '2024-02', value: 80 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      x: 'date',
    });

    try {
      state.registerMark(() => ({ y: 'value', data: markData1, color: 'red' }));
      state.registerMark(() => ({ y: 'value', data: markData2, color: 'blue' }));
      flushSync();

      // Both marks have the same y='value' key so they deduplicate to one series,
      // but the first mark's data should be on the series
      expect(state.seriesState.series).toHaveLength(1);
      expect(state.seriesState.series[0].data).toBe(markData1);
    } finally {
      cleanup();
    }
  });

  it('should revert flatData after all marks unregister', () => {
    const chartData: TestData[] = [{ date: '2024-01', value: 5 }];
    const markData: TestData[] = [
      { date: '2024-01', value: 100 },
      { date: '2024-02', value: 200 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      data: chartData,
      x: 'date',
      y: 'value',
    });

    try {
      const unregister = state.registerMark(() => ({ data: markData }));
      flushSync();

      expect(state.flatData).toHaveLength(3); // 1 chart + 2 mark
      unregister();
      flushSync();

      expect(state.flatData).toHaveLength(1); // back to chart data only
      expect(state.flatData).toEqual(chartData);
    } finally {
      cleanup();
    }
  });

  it('should include implicit series label when provided', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
    });

    try {
      state.registerMark(() => ({ y: 'value', color: 'red', label: 'Temperature' }));
      flushSync();

      expect(state.seriesState.series[0].label).toBe('Temperature');
    } finally {
      cleanup();
    }
  });
});

describe('ChartState default padding', () => {
  it('should apply default padding when using ChartChildren layout (no children snippet)', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
      // No children prop => ChartChildren renders with axis=true by default
    });

    try {
      expect(state.padding.left).toBeGreaterThan(0);
      expect(state.padding.bottom).toBeGreaterThan(0);
    } finally {
      cleanup();
    }
  });

  it('should not apply default padding when children snippet is provided', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
      children: (() => {}) as any, // Simulates user providing children snippet (Treemap, Pack, etc.)
    });

    try {
      expect(state.padding.left).toBe(0);
      expect(state.padding.bottom).toBe(0);
    } finally {
      cleanup();
    }
  });

  it('should not apply default padding when axis is explicitly false', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
      axis: false,
    });

    try {
      expect(state.padding.left).toBe(0);
      expect(state.padding.bottom).toBe(0);
    } finally {
      cleanup();
    }
  });

  it('should use explicit padding over default', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
    });

    try {
      expect(state.padding).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
    } finally {
      cleanup();
    }
  });
});
