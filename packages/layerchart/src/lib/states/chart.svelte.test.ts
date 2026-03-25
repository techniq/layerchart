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

      const unregister = state.registerMark({ y: 'value', color: 'red' });
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
      state.registerMark({ y: 'apples', color: 'red' });
      state.registerMark({ y: 'bananas', color: 'yellow' });
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
      state.registerMark({ seriesKey: 'temp', color: 'blue' });
      state.registerMark({ seriesKey: 'humidity', color: 'green' });
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
      state.registerMark({ x: 'apples', color: 'red' });
      state.registerMark({ x: 'bananas', color: 'yellow' });
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
      state.registerMark({ y: 'apples', color: 'red' });
      state.registerMark({ y: 'bananas', color: 'yellow' });
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
      state.registerMark({ y: 'value', color: 'red' });
      state.registerMark({ y: 'value', color: 'blue' });
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
      state.registerMark({ data: markData });
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
      state.registerMark({ data: [{ date: '2024-01', value: 10 }] });
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
      state.registerMark({ y: 'apples', color: 'red' });
      state.registerMark({ y: 'bananas', color: 'yellow' });
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
      state.registerMark({ y: 'value', data: markData1, color: 'red' });
      state.registerMark({ y: 'value', data: markData2, color: 'blue' });
      flushSync();

      // Both marks have the same y='value' key so they deduplicate to one series,
      // but the first mark's data should be on the series
      expect(state.seriesState.series).toHaveLength(1);
      expect(state.seriesState.series[0].data).toBe(markData1);
    } finally {
      cleanup();
    }
  });

  it('should include data from two marks with same y accessor but different data arrays', () => {
    const data1: TestData[] = [
      { date: '2024-01', value: 30 },
      { date: '2024-02', value: 40 },
    ];
    const data2: TestData[] = [
      { date: '2024-01', value: 60 },
      { date: '2024-02', value: 70 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      x: 'date',
      y: 'value',
    });

    try {
      state.registerMark({ y: 'value', data: data1, color: 'red' });
      state.registerMark({ y: 'value', data: data2, color: 'blue' });
      flushSync();

      // Both datasets should appear in flatData for correct domain calculation.
      // data1 is on the implicit series; data2 has a different reference so it's extra.
      expect(state.flatData.length).toBeGreaterThanOrEqual(data1.length + data2.length);
    } finally {
      cleanup();
    }
  });

  it('should calculate correct y domain from two marks with same y accessor but different data', () => {
    const data1: TestData[] = [
      { date: '2024-01', value: 30 },
      { date: '2024-02', value: 40 },
    ];
    const data2: TestData[] = [
      { date: '2024-01', value: 60 },
      { date: '2024-02', value: 70 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      x: 'date',
      y: 'value',
    });

    try {
      state.registerMark({ y: 'value', data: data1, color: 'red' });
      state.registerMark({ y: 'value', data: data2, color: 'blue' });
      flushSync();

      // Domain must span both datasets: [30, 70]
      expect(state._yDomain).toEqual([30, 70]);
    } finally {
      cleanup();
    }
  });

  it('should not double-include data when mark data matches series data reference', () => {
    const markData: TestData[] = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 20 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      x: 'date',
      y: 'value',
    });

    try {
      // Register the same data reference twice (should not double-count in flatData)
      state.registerMark({ y: 'value', data: markData, color: 'red' });
      state.registerMark({ y: 'value', data: markData, color: 'blue' });
      flushSync();

      // Only one series (deduplication by key), data1 is its data.
      // The second mark shares the same reference, so flatData only includes markData once
      // (via the series). Total items = markData.length.
      expect(state.flatData).toHaveLength(markData.length);
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
      const unregister = state.registerMark({ data: markData });
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
      state.registerMark({ y: 'value', color: 'red', label: 'Temperature' });
      flushSync();

      expect(state.seriesState.series[0].label).toBe('Temperature');
    } finally {
      cleanup();
    }
  });
});

describe('ChartState implicit series domain update on visibility toggle', () => {
  it('should update y domain when hiding an implicit series', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 10, bananas: 50 },
      { date: '2024-02', apples: 20, bananas: 80 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      data,
      x: 'date',
      // No y prop — will be derived from marks
    });

    try {
      state.registerMark({ y: 'apples', color: 'red' });
      state.registerMark({ y: 'bananas', color: 'yellow' });
      flushSync();

      // Both visible: domain should span all values
      expect(state.seriesState.series).toHaveLength(2);
      expect(state._yDomain).toEqual([10, 80]);

      // Toggle "apples" — when selection is empty, toggling adds it,
      // making only "apples" visible (bananas hidden)
      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      // With only apples visible, domain should be [10, 20]
      expect(state.seriesState.visibleSeries).toHaveLength(1);
      expect(state.seriesState.visibleSeries[0].key).toBe('apples');
      expect(state._yDomain).toEqual([10, 20]);
      expect(state._baseYDomain).toEqual([10, 20]);
      expect(state.yDomain).toEqual([10, 20]);
      // Verify scale domain updated too
      expect(state.yScale.domain()).toEqual([10, 20]);
    } finally {
      cleanup();
    }
  });

  it('should update y domain when hiding an explicit series', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 10, bananas: 50 },
      { date: '2024-02', apples: 20, bananas: 80 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      data,
      x: 'date',
      valueAxis: 'y',
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      expect(state._yDomain).toEqual([10, 80]);

      // Select only apples (hides bananas)
      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      expect(state.seriesState.visibleSeries).toHaveLength(1);
      expect(state.seriesState.visibleSeries[0].key).toBe('apples');
      expect(state._yDomain).toEqual([10, 20]);
      expect(state._baseYDomain).toEqual([10, 20]);
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

describe('ChartState implicit x/y from marks (no x/y on Chart)', () => {
  type DateValueData = { date: Date; value: number };

  it('should derive x accessor from marks when x prop is absent', () => {
    const data: DateValueData[] = [
      { date: new Date(2024, 0, 1), value: 30 },
      { date: new Date(2024, 1, 1), value: 40 },
    ];

    const { state, cleanup } = createChartState<DateValueData>({});

    try {
      state.registerMark({ x: 'date', y: 'value', data });
      flushSync();

      expect(state.x(data[0])).toEqual(new Date(2024, 0, 1));
      // y is derived from implicit series — returns array form (single-element for one series)
      expect(state.y(data[0])).toEqual([30]);
    } finally {
      cleanup();
    }
  });

  it('should derive correct y domain across two marks with different data and no y prop', () => {
    const temperatureData: DateValueData[] = [
      { date: new Date(2024, 0, 1), value: 32 },
      { date: new Date(2024, 1, 1), value: 28 },
    ];
    const humidityData: DateValueData[] = [
      { date: new Date(2024, 0, 1), value: 60 },
      { date: new Date(2024, 1, 1), value: 70 },
    ];

    const { state, cleanup } = createChartState<DateValueData>({});

    try {
      state.registerMark({ x: 'date', y: 'value', data: temperatureData, color: 'red' });
      state.registerMark({ x: 'date', y: 'value', data: humidityData, color: 'blue' });
      flushSync();

      // y domain should span both datasets
      expect(state._yDomain).toEqual([28, 70]);
    } finally {
      cleanup();
    }
  });

  it('should deduplicate repeated mark x keys into a single accessor', () => {
    const data: DateValueData[] = [
      { date: new Date(2024, 0, 1), value: 10 },
    ];

    const { state, cleanup } = createChartState<DateValueData>({});

    try {
      // Two marks, same x='date' — should not create duplicate keys
      state.registerMark({ x: 'date', y: 'value', data });
      state.registerMark({ x: 'date', y: 'value', data });
      flushSync();

      // x accessor should work normally (not return array of duplicates)
      expect(state.x(data[0])).toEqual(new Date(2024, 0, 1));
    } finally {
      cleanup();
    }
  });

  it('should use explicit x/y from Chart props over mark-derived values', () => {
    const data: DateValueData[] = [
      { date: new Date(2024, 0, 1), value: 10 },
    ];

    const { state, cleanup } = createChartState<DateValueData>({
      x: 'value', // explicit — should override 'date' from marks
      y: 'value',
    });

    try {
      state.registerMark({ x: 'date', y: 'value', data });
      flushSync();

      // Chart props take precedence
      expect(state.x(data[0])).toEqual(10);
    } finally {
      cleanup();
    }
  });
});
