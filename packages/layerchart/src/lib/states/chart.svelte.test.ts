import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';

import { scaleBand } from 'd3-scale';
import { geoAlbersUsa } from 'd3-geo';
import { timeDay } from 'd3-time';

import { ChartState } from './chart.svelte.js';
import { TooltipState } from './tooltip.svelte.js';
import type { ChartPropsWithoutHTML } from '$lib/components/Chart/Chart.svelte';
import { isScaleBand, isScaleTime } from '$lib/utils/scales.svelte.js';

type TestData = { date: string; value: number };
type MultiSeriesData = { date: string; apples: number; bananas: number };
type WideData = { year: string; apples: number; bananas: number; cherries: number; grapes: number };
type GeoData = { name: string; longitude: number; latitude: number };

function createChartState<T = TestData>(props: Partial<ChartPropsWithoutHTML<T>>) {
  let cleanup: () => void;
  let state: ChartState<T>;

  cleanup = $effect.root(() => {
    state = new ChartState<T>(props as ChartPropsWithoutHTML<T>);
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
        seriesLayout: 'overlap',
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
        seriesLayout: 'overlap',
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
        seriesLayout: 'overlap',
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
        seriesLayout: 'overlap',
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
        seriesLayout: 'overlap',
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

  it('should not create implicit series when mark accessor matches chart accessor', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
    });

    try {
      // Mark with same y as chart — not a new series, just using chart's axis
      state.registerMark({ y: 'value', color: 'red' });
      flushSync();

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
      expect(state.seriesState.series[0]).toMatchObject({
        key: 'apples',
        color: 'red',
        value: 'apples',
      });
      expect(state.seriesState.series[1]).toMatchObject({
        key: 'bananas',
        color: 'yellow',
        value: 'bananas',
      });
    } finally {
      cleanup();
    }
  });

  it('should not generate implicit series when explicit series are provided', () => {
    const data: MultiSeriesData[] = [{ date: '2024-01', apples: 10, bananas: 15 }];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      seriesLayout: 'overlap',
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

  it('should treat an empty explicit series array as authoritative', () => {
    // Charts render their marks from the series, so deriving the series back from those marks
    // leaves the two oscillating with no fixed point — a chart whose data emptied out mid-flight
    // (a refetch, say) would hang the tab rather than render as empty.
    const data: MultiSeriesData[] = [{ date: '2024-01', apples: 10, bananas: 15 }];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      seriesLayout: 'overlap',
      data,
      x: 'date',
      series: [],
    });

    try {
      // Marks left over from the previous, non-empty series
      state.registerMark({ y: 'apples', color: 'red' });
      state.registerMark({ y: 'bananas', color: 'yellow' });
      flushSync();

      expect(state.seriesState.series).toHaveLength(0);
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

describe('ChartState data vs visibleSeriesData', () => {
  it('should return props.data when explicit, even if a mark registers a filtered subset', () => {
    const fullData: TestData[] = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 20 },
      { date: '2024-03', value: 30 },
    ];
    const highlighted = [fullData[0]]; // filtered subset

    const { state, cleanup } = createChartState<TestData>({
      data: fullData,
      x: 'date',
      y: 'value',
    });

    try {
      // Simulate a decorative mark (e.g. <Text data={highlighted}>) registering
      // its own filtered dataset with the same value accessor as the chart.
      state.registerMark({ y: 'value', data: highlighted });
      flushSync();

      // ctx.data (used by sibling marks for iteration) should remain the full
      // chart data, not be replaced by the filtered subset.
      expect(state.data).toBe(fullData);
      expect(state.data).toHaveLength(3);
    } finally {
      cleanup();
    }
  });

  it('should fall back to visibleSeriesData when props.data is not provided', () => {
    const applesData: TestData[] = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 20 },
    ];
    const bananasData: TestData[] = [
      { date: '2024-01', value: 15 },
      { date: '2024-02', value: 25 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      seriesLayout: 'overlap',
      x: 'date',
      y: 'value',
      series: [
        { key: 'apples', data: applesData },
        { key: 'bananas', data: bananasData },
      ],
    });

    try {
      // No props.data — ctx.data should flatten series data for iteration.
      expect(state.data).toHaveLength(4);
    } finally {
      cleanup();
    }
  });

  it('should not create an implicit series for a decorative mark when chart has own data', () => {
    // Scenario: <Chart data={full}> + <Text data={highlighted} y="value"> (labels)
    // The Text mark shouldn't create an implicit series that narrows the domain.
    const fullData: TestData[] = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 50 },
      { date: '2024-03', value: 100 },
    ];
    const highlighted = [fullData[1]];

    const { state, cleanup } = createChartState<TestData>({
      data: fullData,
      x: 'date',
      y: 'value',
    });

    try {
      state.registerMark({ y: 'value', data: highlighted });
      flushSync();

      // Decorative mark shouldn't turn this into a multi-series chart.
      expect(state.seriesState.isDefaultSeries).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('should not create an implicit series when chart uses array y accessor matching the mark key', () => {
    // Scenario: <Chart data={full} y={['v1', 'v2']}> + <Text data={highlighted} y="v2">
    // The chart declares both v1 and v2 as value axes; the Text mark using v2
    // is just decorative, not a new series.
    type Dual = { date: string; v1: number; v2: number };
    const fullData: Dual[] = [
      { date: '2024-01', v1: 10, v2: 20 },
      { date: '2024-02', v1: 30, v2: 40 },
    ];

    const { state, cleanup } = createChartState<Dual>({
      data: fullData,
      x: 'date',
      y: ['v1', 'v2'],
    });

    try {
      state.registerMark({ y: 'v2', data: [fullData[0]] });
      flushSync();

      expect(state.seriesState.isDefaultSeries).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('should compute yDomain from full chart data when a decorative mark has a filtered subset', () => {
    // Regression: Text labeling highlighted rows shouldn't narrow the y domain.
    const fullData: TestData[] = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 50 },
      { date: '2024-03', value: 100 },
    ];
    const highlighted = [fullData[1]]; // only value=50

    const { state, cleanup } = createChartState<TestData>({
      data: fullData,
      x: 'date',
      y: 'value',
    });

    try {
      state.registerMark({ y: 'value', data: highlighted });
      flushSync();

      // yDomain should reflect the full data extent [10, 100], not just [50, 50].
      expect(state.yDomain).toEqual([10, 100]);
    } finally {
      cleanup();
    }
  });

  it('should compute yDomain across all array y accessors on Chart', () => {
    // Scenario: arrow-variation chart with y={['v1', 'v2']} where v1/v2 span different ranges.
    type Dual = { date: string; v1: number; v2: number };
    const data: Dual[] = [
      { date: '2024-01', v1: 3, v2: 5 },
      { date: '2024-02', v1: 2, v2: 8 },
      { date: '2024-03', v1: 4, v2: 9 },
    ];

    const { state, cleanup } = createChartState<Dual>({
      data,
      x: 'date',
      y: ['v1', 'v2'],
    });

    try {
      // Domain should span min(v1) = 2 to max(v2) = 9
      expect(state.yDomain).toEqual([2, 9]);
    } finally {
      cleanup();
    }
  });

  it('should keep full yDomain when decorative mark + array y both present', () => {
    // End-to-end bended-arrows scenario
    type Dual = { date: string; v1: number; v2: number };
    const data: Dual[] = [
      { date: '2024-01', v1: 3, v2: 5 },
      { date: '2024-02', v1: 2, v2: 8 },
      { date: '2024-03', v1: 4, v2: 9 },
    ];

    const { state, cleanup } = createChartState<Dual>({
      data,
      x: 'date',
      y: ['v1', 'v2'],
    });

    try {
      // Decorative Text mark with subset data and y matching one of chart's keys
      state.registerMark({ y: 'v2', data: [data[0]] });
      flushSync();

      // Still the full range [2, 9], not narrowed to [5, 5]
      expect(state.yDomain).toEqual([2, 9]);
      expect(state.seriesState.isDefaultSeries).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('should fall back to visibleSeriesData when props.data is an empty array', () => {
    // Composite charts (BarChart, etc.) default `data = []` when not passed.
    const applesData: TestData[] = [{ date: '2024-01', value: 10 }];
    const bananasData: TestData[] = [{ date: '2024-01', value: 15 }];

    const { state, cleanup } = createChartState<TestData>({
      seriesLayout: 'overlap',
      data: [],
      x: 'date',
      y: 'value',
      series: [
        { key: 'apples', data: applesData },
        { key: 'bananas', data: bananasData },
      ],
    });

    try {
      expect(state.data).toHaveLength(2);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState geo projection skips markInfo', () => {
  const geoData: GeoData[] = [
    { name: 'New York', longitude: -74.006, latitude: 40.7128 },
    { name: 'Los Angeles', longitude: -118.2437, latitude: 34.0522 },
    { name: 'Chicago', longitude: -87.6298, latitude: 41.8781 },
  ];

  it('should not create implicit series from marks when geo projection is active', () => {
    const { state, cleanup } = createChartState<GeoData>({
      data: geoData,
      x: 'longitude',
      y: 'latitude',
      geo: { projection: geoAlbersUsa },
    });

    try {
      // Register a mark with its own data (like a tooltip highlight Circle)
      state.registerMark({ data: [geoData[0]], x: 'longitude', y: 'latitude' });
      flushSync();

      // Should remain default series — mark should not create implicit "latitude" series
      expect(state.seriesState.isDefaultSeries).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('should not add mark data to flatData when geo projection is active', () => {
    const { state, cleanup } = createChartState<GeoData>({
      data: geoData,
      x: 'longitude',
      y: 'latitude',
      geo: { projection: geoAlbersUsa },
    });

    try {
      state.registerMark({ data: [geoData[0]], x: 'longitude', y: 'latitude' });
      flushSync();

      // flatData should only contain chart data, not the mark's extra data
      expect(state.flatData).toHaveLength(3);
      expect(state.flatData).toBe(geoData);
    } finally {
      cleanup();
    }
  });

  it('should not derive x/y accessors from marks when geo projection is active', () => {
    // Chart with geo but no explicit x/y — marks should not fill in the accessors
    const { state: stateWithGeo, cleanup: cleanupGeo } = createChartState<GeoData>({
      data: geoData,
      geo: { projection: geoAlbersUsa },
    });

    const { state: stateWithoutGeo, cleanup: cleanupNoGeo } = createChartState<GeoData>({
      data: geoData,
    });

    try {
      // Both start with null x accessor (no x prop set)
      expect(stateWithGeo.x).toBeNull();
      expect(stateWithoutGeo.x).toBeNull();

      stateWithGeo.registerMark({ x: 'longitude', y: 'latitude' });
      stateWithoutGeo.registerMark({ x: 'longitude', y: 'latitude' });
      flushSync();

      // Without geo: mark should derive x accessor
      expect(stateWithoutGeo.x).not.toBeNull();
      expect(stateWithoutGeo.x!(geoData[0])).toBe(geoData[0].longitude);

      // With geo: mark should NOT derive x accessor
      expect(stateWithGeo.x).toBeNull();
    } finally {
      cleanupGeo();
      cleanupNoGeo();
    }
  });

  it('should preserve seriesKey/color/label from marks in geo mode for legends', () => {
    const { state, cleanup } = createChartState<GeoData>({
      data: geoData,
      x: 'longitude',
      y: 'latitude',
      geo: { projection: geoAlbersUsa },
    });

    try {
      state.registerMark({ seriesKey: 'earthquakes', color: 'red', label: 'Earthquakes' });
      state.registerMark({ seriesKey: 'volcanos', color: 'orange', label: 'Volcanos' });
      flushSync();

      // seriesKey/color/label should still create implicit series for legends
      expect(state.seriesState.isDefaultSeries).toBe(false);
      expect(state.seriesState.series).toHaveLength(2);
      expect(state.seriesState.series[0]).toMatchObject({
        key: 'earthquakes',
        color: 'red',
        label: 'Earthquakes',
      });
      expect(state.seriesState.series[1]).toMatchObject({
        key: 'volcanos',
        color: 'orange',
        label: 'Volcanos',
      });

      // But flatData should not include extra mark data
      expect(state.flatData).toHaveLength(3);
    } finally {
      cleanup();
    }
  });

  it('should still process marks normally without geo projection', () => {
    const { state, cleanup } = createChartState<GeoData>({
      data: geoData,
      x: 'name',
    });

    try {
      state.registerMark({ y: 'latitude', color: 'blue' });
      flushSync();

      // Without geo, marks should create implicit series as normal
      expect(state.seriesState.isDefaultSeries).toBe(false);
      expect(state.seriesState.series[0].key).toBe('latitude');
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
      seriesLayout: 'overlap',
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

describe('ChartState metadata-only series', () => {
  type CategoryEvent = { date: string; category: string };

  it('should not produce [undefined, undefined] domain when items lack series-key properties', () => {
    const data: CategoryEvent[] = [
      { date: '2024-01', category: 'svelte' },
      { date: '2024-02', category: 'sveltekit' },
      { date: '2024-03', category: 'ecosystem' },
    ];

    const { state, cleanup } = createChartState<CategoryEvent>({
      seriesLayout: 'overlap',
      data,
      x: 'date',
      valueAxis: 'y',
      series: [
        { key: 'svelte', color: 'red' },
        { key: 'sveltekit', color: 'orange' },
        { key: 'ecosystem', color: 'blue' },
      ],
    });

    try {
      expect(state._yDomain).toBeUndefined();
    } finally {
      cleanup();
    }
  });

  it('should remain stable across visibility toggles instead of throwing', () => {
    const data: CategoryEvent[] = [
      { date: '2024-01', category: 'svelte' },
      { date: '2024-02', category: 'sveltekit' },
    ];

    const { state, cleanup } = createChartState<CategoryEvent>({
      seriesLayout: 'overlap',
      data,
      x: 'date',
      valueAxis: 'y',
      series: [
        { key: 'svelte', color: 'red' },
        { key: 'sveltekit', color: 'orange' },
      ],
      motion: { type: 'spring' },
    });

    try {
      expect(state._yDomain).toBeUndefined();

      expect(() => {
        state.seriesState.selectedKeys.toggle('svelte');
        flushSync();
      }).not.toThrow();

      expect(state._yDomain).toBeUndefined();
      expect(state.seriesState.visibleSeries).toHaveLength(1);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState degenerate domain', () => {
  it('should expand degenerate y domain [0, 0] to [0, 1]', () => {
    const data: TestData[] = [
      { date: '2024-01', value: 0 },
      { date: '2024-02', value: 0 },
      { date: '2024-03', value: 0 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      data,
      x: 'date',
      y: 'value',
      yBaseline: 0,
    });

    try {
      // Domain from data+baseline is [0,0] — scale should expand to [0,1]
      expect(state._yDomain).toEqual([0, 0]);
      expect(state.yScale.domain()).toEqual([0, 1]);
      // yScale(0) should be a valid number (not NaN)
      expect(state.yScale(0)).not.toBeNaN();
    } finally {
      cleanup();
    }
  });

  it('should expand degenerate y domain [5, 5] to [5, 6]', () => {
    const data: TestData[] = [
      { date: '2024-01', value: 5 },
      { date: '2024-02', value: 5 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      data,
      x: 'date',
      y: 'value',
    });

    try {
      // _yDomain is undefined (no baseline/explicit domain), domain comes from extents
      expect(state.yDomain).toEqual([5, 5]);
      expect(state.yScale.domain()).toEqual([5, 6]);
      expect(state.yScale(5)).not.toBeNaN();
    } finally {
      cleanup();
    }
  });

  it('should not expand a non-degenerate domain', () => {
    const data: TestData[] = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 20 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      data,
      x: 'date',
      y: 'value',
    });

    try {
      expect(state.yScale.domain()).toEqual([10, 20]);
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
    const data: DateValueData[] = [{ date: new Date(2024, 0, 1), value: 10 }];

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
    const data: DateValueData[] = [{ date: new Date(2024, 0, 1), value: 10 }];

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

describe('ChartState bandPadding auto-derives category axis scale', () => {
  const wideData: WideData[] = [
    { year: '2016', apples: 480, bananas: 240, cherries: 120, grapes: 50 },
    { year: '2017', apples: 960, bananas: 480, cherries: 240, grapes: 100 },
    { year: '2018', apples: 1920, bananas: 960, cherries: 480, grapes: 200 },
    { year: '2019', apples: 3840, bananas: 1920, cherries: 960, grapes: 400 },
  ];

  it('should use scaleBand on x when bandPadding set and valueAxis=y', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      y: 'apples',
      valueAxis: 'y',
      bandPadding: 0.4,
    });

    try {
      expect(isScaleBand(state.xScale)).toBe(true);
      expect(state.xScale.bandwidth!()).toBeGreaterThan(0);
    } finally {
      cleanup();
    }
  });

  it('should use scaleBand on y when bandPadding set and valueAxis=x', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      y: 'year',
      x: 'apples',
      valueAxis: 'x',
      bandPadding: 0.4,
    });

    try {
      expect(isScaleBand(state.yScale)).toBe(true);
      expect(state.yScale.bandwidth!()).toBeGreaterThan(0);
    } finally {
      cleanup();
    }
  });

  it('should not use scaleBand when bandPadding is not set', () => {
    const data: TestData[] = [
      { date: '2024-01', value: 10 },
      { date: '2024-02', value: 20 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      data,
      x: 'date',
      y: 'value',
      valueAxis: 'y',
    });

    try {
      // Without bandPadding, autoScale determines the scale from data type
      // String data should still get scaleBand via autoScale, but without custom padding
      expect(isScaleBand(state.xScale)).toBe(true);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState xInterval forces scaleTime over scaleBand', () => {
  it('should use scaleTime when xInterval is set even with bandPadding', () => {
    type DateData = { date: Date; value: number };
    const data: DateData[] = [
      { date: new Date(2024, 0, 1), value: 40 },
      { date: new Date(2024, 0, 5), value: 60 },
    ];

    const { state, cleanup } = createChartState<DateData>({
      data,
      x: 'date',
      y: 'value',
      valueAxis: 'y',
      bandPadding: 0.4,
      xInterval: timeDay,
    });

    try {
      expect(isScaleBand(state.xScale)).toBe(false);
      expect(isScaleTime(state.xScale)).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('should use scaleBand when xInterval is not set with bandPadding', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: [{ year: '2016', apples: 480, bananas: 240, cherries: 120, grapes: 50 }],
      x: 'year',
      y: 'apples',
      valueAxis: 'y',
      bandPadding: 0.4,
    });

    try {
      expect(isScaleBand(state.xScale)).toBe(true);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState explicit baseline=null disables auto-baseline', () => {
  it('should not include baseline=0 in domain when xBaseline=null', () => {
    type RangeData = { label: string; start: number; end: number };
    const data: RangeData[] = [
      { label: 'A', start: 15, end: 25 },
      { label: 'B', start: 25, end: 35 },
    ];

    const { state, cleanup } = createChartState<RangeData>({
      data,
      x: ['start', 'end'] as any,
      y: (d: any) => 1,
      valueAxis: 'x',
      bandPadding: 0,
      xBaseline: null,
      xNice: false,
    });

    try {
      // Domain should be [15, 35], not [0, 35]
      const domain = state.xScale.domain();
      expect(domain[0]).toBe(15);
      expect(domain[1]).toBe(35);
    } finally {
      cleanup();
    }
  });

  it('should include auto-baseline=0 when xBaseline is not provided', () => {
    type RangeData = { label: string; start: number; end: number };
    const data: RangeData[] = [
      { label: 'A', start: 15, end: 25 },
      { label: 'B', start: 25, end: 35 },
    ];

    const { state, cleanup } = createChartState<RangeData>({
      data,
      x: ['start', 'end'] as any,
      y: (d: any) => 1,
      valueAxis: 'x',
      bandPadding: 0,
      xNice: false,
      // xBaseline not provided — auto-baseline should kick in
    });

    try {
      // Domain should be [0, 35] due to auto-baseline
      const domain = state.xScale.domain();
      expect(domain[0]).toBe(0);
      expect(domain[1]).toBe(35);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState yReverse with band scales', () => {
  it('should not reverse y when auto-derived scaleBand (horizontal bar chart)', () => {
    type AgeData = { age: string; male: number; female: number };
    const data: AgeData[] = [
      { age: '0-4', male: 200, female: 190 },
      { age: '5-9', male: 180, female: 175 },
      { age: '85+', male: 20, female: 15 },
    ];

    const { state, cleanup } = createChartState<AgeData>({
      seriesLayout: 'overlap',
      data,
      y: 'age',
      valueAxis: 'x',
      bandPadding: 0.4,
      series: [{ key: 'male' }, { key: 'female' }],
    });

    try {
      expect(isScaleBand(state.yScale)).toBe(true);
      expect(state.yReverse).toBe(false);
      // Domain should preserve data order (0-4 first)
      expect(state.yScale.domain()).toEqual(['0-4', '5-9', '85+']);
    } finally {
      cleanup();
    }
  });

  it('should not reverse y when explicit scaleBand is provided', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [
        { date: '2024-01', value: 10 },
        { date: '2024-02', value: 20 },
      ],
      y: 'date',
      yScale: scaleBand().padding(0.4),
    });

    try {
      expect(state.yReverse).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('should reverse y for linear scales (default)', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [
        { date: '2024-01', value: 10 },
        { date: '2024-02', value: 20 },
      ],
      x: 'date',
      y: 'value',
    });

    try {
      expect(state.yReverse).toBe(true);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState auto-baseline from bandPadding', () => {
  it('should auto-derive yBaseline=0 when bandPadding set and valueAxis=y', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 50, bananas: 60 },
      { date: '2024-02', apples: 70, bananas: 80 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      seriesLayout: 'overlap',
      data,
      x: 'date',
      valueAxis: 'y',
      bandPadding: 0.4,
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      // With bandPadding, auto-baseline should include 0
      expect(state._yDomain).toEqual([0, 80]);
    } finally {
      cleanup();
    }
  });

  it('should auto-derive xBaseline=0 when bandPadding set and valueAxis=x', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 50, bananas: 60 },
      { date: '2024-02', apples: 70, bananas: 80 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      seriesLayout: 'overlap',
      data,
      y: 'date',
      valueAxis: 'x',
      bandPadding: 0.4,
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      expect(state._xDomain).toEqual([0, 80]);
    } finally {
      cleanup();
    }
  });

  it('should not auto-derive baseline without bandPadding', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 50, bananas: 60 },
      { date: '2024-02', apples: 70, bananas: 80 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      seriesLayout: 'overlap',
      data,
      x: 'date',
      valueAxis: 'y',
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      // Without bandPadding, no auto-baseline — domain is just extent
      expect(state._yDomain).toEqual([50, 80]);
    } finally {
      cleanup();
    }
  });

  it('should respect explicit baseline over auto-baseline', () => {
    const data: MultiSeriesData[] = [
      { date: '2024-01', apples: 50, bananas: 60 },
      { date: '2024-02', apples: 70, bananas: 80 },
    ];

    const { state, cleanup } = createChartState<MultiSeriesData>({
      seriesLayout: 'overlap',
      data,
      x: 'date',
      valueAxis: 'y',
      bandPadding: 0.4,
      yBaseline: 10,
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      // Explicit yBaseline=10 should take precedence over auto-baseline=0
      expect(state._yDomain).toEqual([10, 80]);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState auto-nice from valueAxis', () => {
  it('should auto-nice the value axis when valueAxis is set', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
      valueAxis: 'y',
    });

    try {
      expect(state.yNice).toBe(true);
      expect(state.xNice).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('should auto-nice xNice when valueAxis=x', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'value',
      y: 'date',
      valueAxis: 'x',
    });

    try {
      expect(state.xNice).toBe(true);
      expect(state.yNice).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('should not auto-nice when valueAxis is not set', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
    });

    try {
      expect(state.xNice).toBe(false);
      expect(state.yNice).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('should respect explicit xNice/yNice over auto-derived', () => {
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 10 }],
      x: 'date',
      y: 'value',
      valueAxis: 'y',
      yNice: false,
      xNice: true,
    });

    try {
      expect(state.yNice).toBe(false);
      expect(state.xNice).toBe(true);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState group layout auto-derives x1/y1', () => {
  const wideData: WideData[] = [
    { year: '2016', apples: 480, bananas: 240, cherries: 120, grapes: 50 },
    { year: '2017', apples: 960, bananas: 480, cherries: 240, grapes: 100 },
  ];

  const series = [{ key: 'apples' }, { key: 'bananas' }, { key: 'cherries' }, { key: 'grapes' }];

  it('should auto-derive x1Domain from series keys when seriesLayout=group and valueAxis=y', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      valueAxis: 'y',
      bandPadding: 0.4,
      seriesLayout: 'group',
      series,
    });

    try {
      expect(state.x1Domain).toEqual(['apples', 'bananas', 'cherries', 'grapes']);
    } finally {
      cleanup();
    }
  });

  it('should auto-derive y1Domain from series keys when seriesLayout=group and valueAxis=x', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      y: 'year',
      valueAxis: 'x',
      bandPadding: 0.4,
      seriesLayout: 'group',
      series,
    });

    try {
      expect(state.y1Domain).toEqual(['apples', 'bananas', 'cherries', 'grapes']);
    } finally {
      cleanup();
    }
  });

  it('should auto-create x1Scale as scaleBand for group layout', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      valueAxis: 'y',
      bandPadding: 0.4,
      seriesLayout: 'group',
      series,
    });

    try {
      expect(state.x1Scale).not.toBeNull();
      expect(isScaleBand(state.x1Scale!)).toBe(true);
      expect(state.x1Scale!.domain()).toEqual(['apples', 'bananas', 'cherries', 'grapes']);
    } finally {
      cleanup();
    }
  });

  it('should not auto-derive x1 when seriesLayout is not group', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      valueAxis: 'y',
      bandPadding: 0.4,
      seriesLayout: 'stack',
      series,
    });

    try {
      expect(state.x1Domain).toBeUndefined();
      expect(state.x1Scale).toBeNull();
    } finally {
      cleanup();
    }
  });

  it('should apply groupPadding to auto-derived x1Scale', () => {
    const { state: stateNoPad, cleanup: c1 } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      valueAxis: 'y',
      bandPadding: 0.4,
      groupPadding: 0,
      seriesLayout: 'group',
      series,
    });

    const { state: stateWithPad, cleanup: c2 } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      valueAxis: 'y',
      bandPadding: 0.4,
      groupPadding: 0.5,
      seriesLayout: 'group',
      series,
    });

    try {
      // With more padding, bandwidth should be smaller
      expect(stateWithPad.x1Scale!.bandwidth!()).toBeLessThan(stateNoPad.x1Scale!.bandwidth!());
    } finally {
      c1();
      c2();
    }
  });

  it('should update x1Domain to only visible series when toggling legend', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      valueAxis: 'y',
      bandPadding: 0.4,
      seriesLayout: 'group',
      series,
    });

    try {
      expect(state.x1Domain).toEqual(['apples', 'bananas', 'cherries', 'grapes']);

      // Select only 'apples' (hides the other 3)
      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      expect(state.seriesState.visibleSeries).toHaveLength(1);
      expect(state.x1Domain).toEqual(['apples']);

      // x1Scale domain should also update
      expect(state.x1Scale!.domain()).toEqual(['apples']);

      // Deselect to show all again
      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      expect(state.x1Domain).toEqual(['apples', 'bananas', 'cherries', 'grapes']);
    } finally {
      cleanup();
    }
  });

  it('should update x1Scale bandwidth when series visibility changes', () => {
    const { state, cleanup } = createChartState<WideData>({
      data: wideData,
      x: 'year',
      valueAxis: 'y',
      bandPadding: 0.4,
      groupPadding: 0,
      seriesLayout: 'group',
      series,
    });

    try {
      const initialBandwidth = state.x1Scale!.bandwidth!();

      // Select only 'apples'
      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      // With only 1 series, bandwidth should be larger (full group band)
      expect(state.x1Scale!.bandwidth!()).toBeGreaterThan(initialBandwidth);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState explicit x1Domain/y1Domain', () => {
  type LongData = { year: number; fruit: string; value: number };
  const longData: LongData[] = [
    { year: 2019, fruit: 'apples', value: 3840 },
    { year: 2019, fruit: 'bananas', value: 1920 },
    { year: 2018, fruit: 'apples', value: 1600 },
    { year: 2018, fruit: 'bananas', value: 1440 },
  ];

  it('should pass through explicit x1Domain when no series are configured', () => {
    const { state, cleanup } = createChartState<LongData>({
      data: longData,
      x: 'year',
      xScale: scaleBand(),
      y: 'value',
      x1: 'fruit',
      x1Domain: ['apples', 'bananas'],
      x1Range: ({ xScale }) => [0, (xScale as any).bandwidth()],
    });

    try {
      expect(state.seriesState.series).toHaveLength(0);
      expect(state.x1Domain).toEqual(['apples', 'bananas']);
      expect(state.x1Scale!.domain()).toEqual(['apples', 'bananas']);
    } finally {
      cleanup();
    }
  });

  it('should pass through explicit y1Domain when no series are configured', () => {
    const { state, cleanup } = createChartState<LongData>({
      data: longData,
      y: 'year',
      yScale: scaleBand(),
      x: 'value',
      y1: 'fruit',
      y1Domain: ['apples', 'bananas'],
      y1Range: ({ yScale }) => [0, (yScale as any).bandwidth()],
    });

    try {
      expect(state.seriesState.series).toHaveLength(0);
      expect(state.y1Domain).toEqual(['apples', 'bananas']);
      expect(state.y1Scale!.domain()).toEqual(['apples', 'bananas']);
    } finally {
      cleanup();
    }
  });

  it('should pass through explicit x1Domain alongside the implicit `default` series', () => {
    // `BarChart` always configures a series, so "no series" alone doesn't cover it
    const { state, cleanup } = createChartState<LongData>({
      seriesLayout: 'overlap',
      data: longData,
      x: 'year',
      xScale: scaleBand(),
      y: 'value',
      x1: 'fruit',
      x1Domain: ['apples', 'bananas'],
      x1Range: ({ xScale }) => [0, (xScale as any).bandwidth()],
      series: [{ key: 'default', label: 'value', value: 'value' }],
    });

    try {
      expect(state.x1Domain).toEqual(['apples', 'bananas']);
      expect(state.x1Scale!.domain()).toEqual(['apples', 'bananas']);
    } finally {
      cleanup();
    }
  });

  it('should pass through sub-band values that do not name a series', () => {
    // `x1` names a data property, so its values are unrelated to the series keys stacked in it
    const { state, cleanup } = createChartState<LongData>({
      data: longData,
      x: 'year',
      xScale: scaleBand(),
      y: 'value',
      x1: 'fruit',
      x1Domain: ['apples', 'bananas'],
      x1Range: ({ xScale }) => [0, (xScale as any).bandwidth()],
      seriesLayout: 'stack',
      series: [{ key: 'north' }, { key: 'south' }],
    });

    try {
      expect(state.x1Domain).toEqual(['apples', 'bananas']);
    } finally {
      cleanup();
    }
  });

  it('should drop explicit sub-bands that name a hidden series', () => {
    const { state, cleanup } = createChartState<LongData>({
      data: longData,
      x: 'year',
      xScale: scaleBand(),
      y: 'value',
      x1Domain: ['apples', 'bananas'],
      x1Range: ({ xScale }) => [0, (xScale as any).bandwidth()],
      seriesLayout: 'group',
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      expect(state.x1Domain).toEqual(['apples', 'bananas']);

      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      expect(state.x1Domain).toEqual(['apples']);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState facetBand', () => {
  type FacetData = { party: string; year: number; percent: number };
  const facetData: FacetData[] = [
    { party: 'AfD', year: 2021, percent: 10.3 },
    { party: 'AfD', year: 2025, percent: 20.8 },
    { party: 'SPD', year: 2021, percent: 25.7 },
    { party: 'SPD', year: 2025, percent: 16.4 },
  ];

  function createFaceted(props: Partial<ChartPropsWithoutHTML<FacetData>>, mode = 'facet') {
    const created = createChartState<FacetData>({
      data: facetData,
      x: 'year',
      xScale: scaleBand(),
      y: 'percent',
      fx: 'party',
      ...props,
    });
    created.state.tooltipState = new TooltipState(
      mode as any,
      () => {},
      () => {}
    );
    flushSync();
    return created;
  }

  it('should treat the panel as the band in `facet` mode', () => {
    const { state, cleanup } = createFaceted({});

    try {
      expect(state.facetBand).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('should leave `band` mode resolving to the bar', () => {
    // Faceting a chart doesn't change what its tooltip points at — `facet` is asked for
    const { state, cleanup } = createFaceted({}, 'band');

    try {
      expect(state.facetBand).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('should not treat the panel as the band outside band modes', () => {
    // `quadtree` resolves to one point, so the panel is never what the pointer covers
    const { state, cleanup } = createFaceted({}, 'quadtree');

    try {
      expect(state.facetBand).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('should not treat the panel as the band when series are configured', () => {
    // Each row carries the whole series set, so a band is already a row
    const { state, cleanup } = createFaceted({
      series: [{ key: 'percent', value: 'percent' }],
    });

    try {
      expect(state.facetBand).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('should not treat the panel as the band when the chart is not faceted', () => {
    const { state, cleanup } = createFaceted({ fx: undefined });

    try {
      expect(state.facetBand).toBe(false);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState transform fallback', () => {
  it('should answer every documented method before `TransformContext` loads', () => {
    // `TransformContext` is imported lazily, so a chart driven from the outside reaches these
    // first — one that is missing throws rather than doing nothing
    const { state, cleanup } = createChartState<TestData>({
      data: [{ date: '2024-01', value: 1 }],
      x: 'date',
      y: 'value',
    });

    try {
      expect(state.transformState).toBeFalsy();

      const transform = state.transform as any;
      for (const method of [
        'reset',
        'zoomIn',
        'zoomOut',
        'zoomTo',
        'scaleTo',
        'setScale',
        'setTranslate',
        'setScrollMode',
        'translateCenter',
      ]) {
        expect(typeof transform[method], method).toBe('function');
        expect(() => transform[method](1, { x: 0, y: 0 })).not.toThrow();
      }
    } finally {
      cleanup();
    }
  });
});

describe('ChartState zoomToBrush', () => {
  type DateData = { date: Date; value: number };
  const data: DateData[] = [
    { date: new Date(2024, 0, 1), value: 10 },
    { date: new Date(2024, 0, 31), value: 50 },
  ];
  const half = [new Date(2024, 0, 1), new Date(2024, 0, 16)] as any;
  const brush = { x: half, y: [null, null] as any };

  /** Stands in for the lazily-imported `TransformContext`'s state */
  function transformStub() {
    const scales: number[] = [];
    const translates: { x: number; y: number }[] = [];
    return {
      scales,
      translates,
      state: {
        mode: 'domain',
        axis: 'x',
        scale: 1,
        translate: { x: 0, y: 0 },
        setScale: (v: number) => scales.push(v),
        setTranslate: (p: any) => translates.push(p),
      },
    };
  }

  it('should apply the zoom when transform state already exists', () => {
    const { state, cleanup } = createChartState<DateData>({ data, x: 'date', y: 'value' });
    const stub = transformStub();

    try {
      state.transformState = stub.state as any;
      state.zoomToBrush(brush, 'x');

      // Half the domain brushed, so twice the scale
      expect(stub.scales).toEqual([2]);
      expect(stub.translates).toHaveLength(1);
    } finally {
      cleanup();
    }
  });

  it('should narrow the domain from `transform.initialDomain` before transform state exists', () => {
    // `TransformContext` is imported lazily, so a chart opening zoomed has to render from this
    // rather than waiting — otherwise it paints the full domain first
    const { state, cleanup } = createChartState<DateData>({
      data,
      x: 'date',
      y: 'value',
      transform: { mode: 'domain', axis: 'x', initialDomain: { x: half } },
    });

    try {
      expect(state.transformState).toBeFalsy();
      expect(state._initialTransform?.scale).toBe(2);

      const domain = state.xDomain as Date[];
      expect(+domain[0]).toBe(+half[0]);
      expect(+domain[1]).toBe(+half[1]);
    } finally {
      cleanup();
    }
  });

  it('should leave the domain alone without an initial domain', () => {
    const { state, cleanup } = createChartState<DateData>({
      data,
      x: 'date',
      y: 'value',
      transform: { mode: 'domain', axis: 'x' },
    });

    try {
      expect(state._initialTransform).toBeUndefined();

      const domain = state.xDomain as Date[];
      expect(+domain[0]).toBe(+data[0].date);
      expect(+domain[1]).toBe(+data[1].date);
    } finally {
      cleanup();
    }
  });

  it('should keep the range anchored when the scale clamps', () => {
    // A selection narrower than `scaleExtent` allows can't be reached — but the part of it that
    // can be shown has to start where the selection does, not somewhere further along
    const { state, cleanup } = createChartState<DateData>({
      data,
      x: 'date',
      y: 'value',
      transform: { mode: 'domain', axis: 'x', scaleExtent: [1, 4] },
    });
    const stub = transformStub();

    try {
      // Nine days into a 30-day domain, asking for a 3-day window — 10x, past the 4x limit
      state.transformState = { ...stub.state, targetScale: 4 } as any;
      state.zoomToBrush(
        { x: [new Date(2024, 0, 10), new Date(2024, 0, 13)] as any, y: [null, null] as any },
        'x'
      );

      expect(stub.scales).toEqual([10]);

      // Translate follows the scale that was applied (4), not the one asked for (10) — otherwise
      // it carries the view far past the selection
      const offset = 9 / 30;
      expect(stub.translates[0].x).toBeCloseTo(-offset * state.width * 4, 6);
    } finally {
      cleanup();
    }
  });

  it('should hold a zoom requested before transform state exists as the initial transform', () => {
    const { state, cleanup } = createChartState<DateData>({
      data,
      x: 'date',
      y: 'value',
      transform: { mode: 'domain', axis: 'x' },
    });

    try {
      state.zoomToBrush(brush, 'x');
      flushSync();

      // `Chart` hands this to `TransformContext` as its initial scale/translate
      expect(state._initialTransform?.scale).toBe(2);

      const domain = state.xDomain as Date[];
      expect(+domain[0]).toBe(+half[0]);
      expect(+domain[1]).toBe(+half[1]);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState `c` legend key', () => {
  type LongData = { year: string; fruit: string; value: number };

  const longData: LongData[] = [
    { year: '2019', fruit: 'apples', value: 10 },
    { year: '2019', fruit: 'bananas', value: 50 },
    { year: '2020', fruit: 'apples', value: 20 },
    { year: '2020', fruit: 'bananas', value: 80 },
  ];

  function createCategoryChart(props: Partial<ChartPropsWithoutHTML<LongData>> = {}) {
    return createChartState<LongData>({
      seriesLayout: 'overlap',
      data: longData,
      x: 'year',
      y: 'value',
      x1: 'fruit',
      c: 'fruit',
      valueAxis: 'y',
      series: [{ key: 'default' }],
      ...props,
    });
  }

  it('should key rows by their `c` value when the series are implicit', () => {
    const { state, cleanup } = createCategoryChart();

    try {
      expect(state.cKey(longData[0])).toBe('apples');
      expect(state.cKey(longData[1])).toBe('bananas');
    } finally {
      cleanup();
    }
  });

  it('should key rows by nothing when series name the legend items instead', () => {
    const { state, cleanup } = createCategoryChart({
      series: [{ key: 'apples' }, { key: 'bananas' }],
    });

    try {
      expect(state.cKey(longData[0])).toBe(null);
    } finally {
      cleanup();
    }
  });

  it('should key rows by nothing for a continuous `c`, which the legend draws as a ramp', () => {
    const { state, cleanup } = createCategoryChart({ c: 'value' });

    try {
      expect(state.cDomain).toEqual([10, 80]);
      expect(state.cKey(longData[0])).toBe(null);
    } finally {
      cleanup();
    }
  });

  it('should drop the rows of a hidden category and release its sub-band', () => {
    const { state, cleanup } = createCategoryChart();

    try {
      expect(state.data).toHaveLength(4);
      expect(state.x1Domain).toEqual(['apples', 'bananas']);
      expect(state.yDomain).toEqual([10, 80]);

      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      expect(state.data).toEqual([longData[0], longData[2]]);
      // The sub-band bananas held is released, so the bars left widen into it
      expect(state.x1Domain).toEqual(['apples']);
      expect(state.yDomain).toEqual([10, 20]);
    } finally {
      cleanup();
    }
  });

  it('should keep a hidden category in the color domain, so the rest keep their color', () => {
    const { state, cleanup } = createCategoryChart({ cRange: ['red', 'yellow'] });

    try {
      expect(state.cGet(longData[0])).toBe('red');

      state.seriesState.selectedKeys.toggle('bananas');
      flushSync();

      expect(state.cDomain).toEqual(['apples', 'bananas']);
      expect(state.cGet(longData[1])).toBe('yellow');
    } finally {
      cleanup();
    }
  });

  it('should keep the implicit series visible while categories are selected', () => {
    const { state, cleanup } = createCategoryChart();

    try {
      state.seriesState.selectedKeys.toggle('apples');
      flushSync();

      // Hiding the one series that draws every category would empty the chart
      expect(state.seriesState.visibleSeries.map((s) => s.key)).toEqual(['default']);
    } finally {
      cleanup();
    }
  });

  it('should read a highlight on the implicit series as no highlight', () => {
    const { state, cleanup } = createCategoryChart();

    try {
      state.seriesState.highlightKey = 'default';
      flushSync();

      // `default` names nothing to tell apart — every mark would fade against it
      expect(state.seriesState.highlightKey).toBe(null);

      state.seriesState.highlightKey = 'apples';
      flushSync();

      expect(state.seriesState.isHighlighted('apples', true)).toBe(true);
      expect(state.seriesState.isHighlighted('bananas', true)).toBe(false);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState stacked domain with mixed marks', () => {
  type MixedData = { date: string; apples: number; bananas: number; target: number };

  const mixed: MixedData[] = [
    { date: '2024-01', apples: 10, bananas: 20, target: 90 },
    { date: '2024-02', apples: 15, bananas: 25, target: 80 },
  ];

  function createStacked(props: Partial<ChartPropsWithoutHTML<MixedData>> = {}) {
    return createChartState<MixedData>({
      data: mixed,
      x: 'date',
      valueAxis: 'y',
      seriesLayout: 'stack',
      series: [{ key: 'apples' }, { key: 'bananas' }],
      ...props,
    });
  }

  it('should cover a mark drawn beside the stack rather than in it', () => {
    const { state, cleanup } = createStacked();

    try {
      // A `Spline y="target"` over stacked bars: the bars total 40, the line reaches 90
      state.registerMark({ y: 'apples', seriesKey: 'apples', stacks: true });
      state.registerMark({ y: 'bananas', seriesKey: 'bananas', stacks: true });
      state.registerMark({ y: 'target' });
      flushSync();

      expect(state.yDomain).toEqual([0, 90]);
    } finally {
      cleanup();
    }
  });

  it('should scale to the stack when every mark draws it', () => {
    const { state, cleanup } = createStacked();

    try {
      state.registerMark({ y: 'apples', seriesKey: 'apples', stacks: true });
      state.registerMark({ y: 'bananas', seriesKey: 'bananas', stacks: true });
      flushSync();

      expect(state.yDomain).toEqual([0, 40]);
    } finally {
      cleanup();
    }
  });

  it('should leave the domain alone when no mark draws the stack', () => {
    // Two marks compared against each other read the raw accessor, so scaling to a total none of
    // them draws would squash both into the lower half
    const { state, cleanup } = createStacked();

    try {
      state.registerMark({ y: 'apples' });
      state.registerMark({ y: 'bananas' });
      flushSync();

      expect(state.yDomain).toEqual([10, 25]);
    } finally {
      cleanup();
    }
  });

  it('should still stack when no mark has registered', () => {
    const { state, cleanup } = createStacked();

    try {
      expect(state.yDomain).toEqual([0, 40]);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState c as a grouping channel', () => {
  type FruitRow = { year: string; fruit: string; value: number };
  const longData: FruitRow[] = [
    { year: '2024', fruit: 'apples', value: 10 },
    { year: '2024', fruit: 'bananas', value: 20 },
    { year: '2025', fruit: 'apples', value: 30 },
    { year: '2025', fruit: 'bananas', value: 40 },
  ];

  it('names groups when `c` names a column', () => {
    const { state, cleanup } = createChartState<FruitRow>({
      data: longData,
      x: 'year',
      y: 'value',
      c: 'fruit',
    });

    try {
      expect(state.cGroups).toEqual(['apples', 'bananas']);
      expect(state.cKey(longData[0])).toBe('apples');
    } finally {
      cleanup();
    }
  });

  it('names nothing when `c` computes a colour per row', () => {
    // Grouping on a computed colour would cut one series into a path per colour, joining points
    // that are not adjacent
    const { state, cleanup } = createChartState<TestData>({
      data: [
        { date: '2024-01', value: -10 },
        { date: '2024-02', value: 20 },
      ],
      x: 'date',
      y: 'value',
      c: (d: TestData) => (d.value < 0 ? 'under' : 'over'),
      cDomain: ['over', 'under'],
    });

    try {
      expect(state.cGroups).toBeNull();
      expect(state.cKey({ date: '2024-01', value: -10 })).toBeNull();
    } finally {
      cleanup();
    }
  });

  it('names nothing when `c` resolves to an interval', () => {
    // `BarChart` passes its value accessor as `c`, so a `y={['start', 'end']}` chart hands a pair
    // per row to the colour channel — pairs are not category names
    const data = [
      { date: '2024-01', start: 5, end: 10 },
      { date: '2024-02', start: 8, end: 16 },
    ];

    const { state, cleanup } = createChartState<any>({
      data,
      x: 'date',
      y: ['start', 'end'],
      c: ['start', 'end'],
    });

    try {
      expect(state.cGroups).toBeNull();
      expect(state.cKey(data[0])).toBeNull();
    } finally {
      cleanup();
    }
  });

  it('does not infer a stack without a value accessor', () => {
    // A chart that places its own marks — a beeswarm dodging along one axis — has no magnitude to
    // accumulate, and inferring a stack would give the other axis a domain, ticks and gridlines
    const { state, cleanup } = createChartState<FruitRow>({
      data: longData,
      x: 'year',
      c: 'fruit',
    });

    try {
      expect(state.seriesLayout).toBe('overlap');
    } finally {
      cleanup();
    }
  });

  it('infers a stack once there is a value accessor to stack', () => {
    const { state, cleanup } = createChartState<FruitRow>({
      data: longData,
      x: 'year',
      y: 'value',
      c: 'fruit',
    });

    try {
      expect(state.seriesLayout).toBe('stackDiverging');
    } finally {
      cleanup();
    }
  });
});

describe('ChartState explicit null domain', () => {
  it('takes the extent from the data rather than adding a baseline', () => {
    // `yDomain={null}` asks for the data's own extent.  `valueAxis` + `bandPadding` are what turn
    // on the auto-baseline the null is refusing, so a sparkline stays filled rather than being
    // squashed against zero
    const data: TestData[] = [
      { date: '2024-01', value: 45 },
      { date: '2024-02', value: 65 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      data,
      x: 'date',
      y: 'value',
      yDomain: null,
      valueAxis: 'y',
      bandPadding: 0.4,
    });

    try {
      // The `null` survives as the resolved domain, leaving the scale to take the extent from the
      // data — what matters is that nothing pinned it to zero
      expect(state._yDomain).toBeNull();
      expect(state.yScale.domain()[0]).toBeGreaterThan(0);
    } finally {
      cleanup();
    }
  });

  it('still auto-derives a baseline when no domain is given', () => {
    const data: TestData[] = [
      { date: '2024-01', value: 45 },
      { date: '2024-02', value: 65 },
    ];

    const { state, cleanup } = createChartState<TestData>({
      data,
      x: 'date',
      y: 'value',
      valueAxis: 'y',
      bandPadding: 0.4,
    });

    try {
      expect(state._yDomain).toEqual([0, 65]);
    } finally {
      cleanup();
    }
  });
});

describe('ChartState implied colour channel', () => {
  type Row = { date: string; value: number; island: string };
  const data: Row[] = [
    { date: '2024-01', value: 10, island: 'Torgersen' },
    { date: '2024-02', value: 20, island: 'Biscoe' },
    { date: '2024-03', value: 30, island: 'Dream' },
  ];

  const cRange = ['red', 'green', 'blue'];

  it('takes the colour column from a mark that named one', () => {
    // `<Circle fill="island">` names the column without the chart declaring `c="island"`
    const { state, cleanup } = createChartState<Row>({ data, x: 'date', y: 'value', cRange });
    try {
      state.registerMark({ x: 'date', y: 'value', color: 'island' });
      flushSync();

      expect(state.cChannel).toBe('island');
      expect(state.cDomain).toEqual(['Torgersen', 'Biscoe', 'Dream']);
      expect(state.cGet(data[0])).toBe('red');
    } finally {
      cleanup();
    }
  });

  it('leaves the declared `c` alone', () => {
    const { state, cleanup } = createChartState<Row>({
      data,
      x: 'date',
      y: 'value',
      c: 'date',
      cRange,
    });
    try {
      state.registerMark({ x: 'date', y: 'value', color: 'island' });
      flushSync();

      // The chart said `c="date"`; a mark can't overrule it
      expect(state.cChannel).toBe('date');
      expect(state.cDomain).toEqual(['2024-01', '2024-02', '2024-03']);
    } finally {
      cleanup();
    }
  });

  it('ignores a CSS colour, which names no column', () => {
    const { state, cleanup } = createChartState<Row>({ data, x: 'date', y: 'value', cRange });
    try {
      state.registerMark({ x: 'date', y: 'value', color: 'var(--color-primary)' });
      state.registerMark({ x: 'date', y: 'value', color: '#ff0000' });
      flushSync();

      expect(state.cChannel).toBeUndefined();
    } finally {
      cleanup();
    }
  });

  it('ignores a string that names nothing in the data', () => {
    const { state, cleanup } = createChartState<Row>({ data, x: 'date', y: 'value', cRange });
    try {
      state.registerMark({ x: 'date', y: 'value', color: 'rebeccapurple' });
      flushSync();

      expect(state.cChannel).toBeUndefined();
    } finally {
      cleanup();
    }
  });

  it('stays out of it when marks name different columns', () => {
    // Nothing makes one of them the chart's colour channel, and picking either would be a guess
    const { state, cleanup } = createChartState<Row>({ data, x: 'date', y: 'value', cRange });
    try {
      state.registerMark({ x: 'date', y: 'value', color: 'island' });
      state.registerMark({ x: 'date', y: 'value', color: 'date' });
      flushSync();

      expect(state.cChannel).toBeUndefined();
    } finally {
      cleanup();
    }
  });

  it('colours without grouping — no legend selection, row filtering, or stack splitting', () => {
    // `cGroups` drives all three, and `ChartState.data` is built from it.  `data` is upstream of
    // every scale, so letting it depend on the mark registry closes a loop: a scale change re-runs
    // each mark's registration effect, which re-registers, which invalidates `data`.  Measured on
    // the stacked-waffle shape: drawn in 13s on the declared prop, blank after 254s on the implied
    // channel.  `Waffle.svelte.test.ts` guards the shape; this pins the boundary.
    const { state, cleanup } = createChartState<Row>({ data, x: 'date', y: 'value', cRange });
    try {
      state.registerMark({ x: 'date', y: 'value', color: 'island' });
      flushSync();

      expect(state.cChannel).toBe('island');
      expect(state.cGroups).toBeNull();
      expect(state.cKey(data[0])).toBeNull();
      expect(state.data).toEqual(data);
    } finally {
      cleanup();
    }
  });

  it('groups nothing when a computed accessor gives a colour per row', () => {
    // Naming a column says that column holds the category.  A mark colouring by a function is a
    // colour per row, which would cut one series into a path per colour
    const { state, cleanup } = createChartState<Row>({
      data,
      x: 'date',
      y: 'value',
      c: (d: Row) => (d.value > 15 ? 'high' : 'low'),
      cRange,
    });
    try {
      flushSync();
      expect(state.cGroups).toBeNull();
    } finally {
      cleanup();
    }
  });

  it('keeps a category on the same colour whatever else is in the data', () => {
    // Without a channel the domain is the rows themselves, so an ordinal scale meets each category
    // as an unknown value and answers with whatever the row count left next in the range — which
    // moved every colour when a single row came or went
    // Looked up by value, the way a mark's own `fill="island"` resolves it
    const colourOf = (rows: Row[], island: string, withMark: boolean) => {
      const { state, cleanup } = createChartState<Row>({ data: rows, x: 'date', y: 'value', cRange }); // prettier-ignore
      try {
        if (withMark) state.registerMark({ x: 'date', y: 'value', color: 'island' });
        flushSync();
        return state.cScale?.(island);
      } finally {
        cleanup();
      }
    };

    const extra = [...data, { date: '2024-04', value: 40, island: 'Biscoe' }];

    // implied channel: 'Dream' is the third category either way
    expect(colourOf(data, 'Dream', true)).toBe('blue');
    expect(colourOf(extra, 'Dream', true)).toBe('blue');

    // without one, the domain is the rows, so the category is an unknown value the scale answers
    // by extending — and one more row moves it to a different colour
    expect(colourOf(data, 'Dream', false)).not.toBe(colourOf(extra, 'Dream', false));
  });
});
