import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';

import { scaleBand } from 'd3-scale';
import { geoAlbersUsa } from 'd3-geo';
import { timeDay } from 'd3-time';

import { ChartState } from './chart.svelte.js';
import type { ChartPropsWithoutHTML } from '$lib/components/Chart.svelte';
import { isScaleBand, isScaleTime } from '$lib/utils/scales.svelte.js';

type TestData = { date: string; value: number };
type MultiSeriesData = { date: string; apples: number; bananas: number };
type WideData = { year: string; apples: number; bananas: number; cherries: number; grapes: number };
type GeoData = { name: string; longitude: number; latitude: number };

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

  it('should fall back to visibleSeriesData when props.data is an empty array', () => {
    // Composite charts (BarChart, etc.) default `data = []` when not passed.
    const applesData: TestData[] = [{ date: '2024-01', value: 10 }];
    const bananasData: TestData[] = [{ date: '2024-01', value: 15 }];

    const { state, cleanup } = createChartState<TestData>({
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

describe('ChartState x1Domain/y1Domain without series', () => {
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
});
