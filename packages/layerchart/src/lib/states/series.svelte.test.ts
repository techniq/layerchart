import { describe, it, expect } from 'vitest';
import { SeriesState } from './series.svelte.js';
import type { Component } from 'svelte';

type TestData = { date: string; apples: number; bananas: number; oranges: number };

const wideData: TestData[] = [
  { date: '2024-01', apples: 100, bananas: 80, oranges: 60 },
  { date: '2024-02', apples: 120, bananas: 90, oranges: 70 },
  { date: '2024-03', apples: 140, bananas: 100, oranges: 80 },
];

const series = [
  { key: 'apples', color: 'red' },
  { key: 'bananas', color: 'yellow' },
  { key: 'oranges', color: 'orange' },
];

function createSeriesState(seriesData = series as any[], stackConfig: any = null) {
  return new SeriesState<TestData, Component>(
    () => seriesData,
    () => stackConfig
  );
}

describe('SeriesState', () => {
  describe('constructor and basic properties', () => {
    it('should initialize with provided series', () => {
      const state = createSeriesState();
      expect(state.series).toHaveLength(3);
      expect(state.series[0].key).toBe('apples');
    });

    it('should default to overlap layout when no stack config', () => {
      const state = createSeriesState();
      expect(state.stackLayout).toBe('overlap');
      expect(state.isStacked).toBe(false);
    });

    it('should report isDefaultSeries for empty series', () => {
      const state = createSeriesState([]);
      expect(state.isDefaultSeries).toBe(true);
    });

    it('should report isDefaultSeries for single default series', () => {
      const state = createSeriesState([{ key: 'default' }]);
      expect(state.isDefaultSeries).toBe(true);
    });

    it('should not report isDefaultSeries for named series', () => {
      const state = createSeriesState();
      expect(state.isDefaultSeries).toBe(false);
    });
  });

  describe('visibility', () => {
    it('should treat all series as visible when no selection', () => {
      const state = createSeriesState();
      expect(state.isVisible('apples')).toBe(true);
      expect(state.isVisible('bananas')).toBe(true);
      expect(state.isVisible('oranges')).toBe(true);
    });

    it('should return all series as visibleSeries when no selection', () => {
      const state = createSeriesState();
      expect(state.visibleSeries).toHaveLength(3);
    });

    it('should filter visibleSeries when keys are selected', () => {
      const state = createSeriesState();
      state.selectedKeys.toggle('apples');

      expect(state.isVisible('apples')).toBe(true);
      expect(state.isVisible('bananas')).toBe(false);
      expect(state.isVisible('oranges')).toBe(false);
      expect(state.visibleSeries).toHaveLength(1);
      expect(state.visibleSeries[0].key).toBe('apples');
    });

    it('should show all series again when selection is cleared', () => {
      const state = createSeriesState();
      state.selectedKeys.toggle('apples');
      expect(state.visibleSeries).toHaveLength(1);

      state.selectedKeys.toggle('apples'); // deselect
      expect(state.visibleSeries).toHaveLength(3);
    });

    it('should respect selected: false on series items', () => {
      const state = createSeriesState([
        { key: 'apples', color: 'red' },
        { key: 'bananas', color: 'yellow', selected: false },
        { key: 'oranges', color: 'orange' },
      ]);

      expect(state.isVisible('apples')).toBe(true);
      expect(state.isVisible('bananas')).toBe(false);
      expect(state.isVisible('oranges')).toBe(true);
      expect(state.visibleSeries).toHaveLength(2);
    });

    it('should allow toggling after initial selected: false', () => {
      const state = createSeriesState([
        { key: 'apples', color: 'red' },
        { key: 'bananas', color: 'yellow', selected: false },
        { key: 'oranges', color: 'orange', selected: false },
      ]);

      expect(state.visibleSeries).toHaveLength(1);

      // Clear selection to show all
      state.selectedKeys.clear();
      expect(state.visibleSeries).toHaveLength(3);
    });

    it('should treat all visible when no series has selected: false', () => {
      const state = createSeriesState([
        { key: 'apples', color: 'red' },
        { key: 'bananas', color: 'yellow' },
        { key: 'oranges', color: 'orange' },
      ]);

      expect(state.visibleSeries).toHaveLength(3);
    });

    it('should support multiple selected keys', () => {
      const state = createSeriesState();
      state.selectedKeys.toggle('apples');
      state.selectedKeys.toggle('oranges');

      expect(state.isVisible('apples')).toBe(true);
      expect(state.isVisible('bananas')).toBe(false);
      expect(state.isVisible('oranges')).toBe(true);
      expect(state.visibleSeries).toHaveLength(2);
    });
  });

  describe('highlighting', () => {
    it('should have no highlight by default', () => {
      const state = createSeriesState();
      expect(state.highlightKey).toBeNull();
    });

    it('should return defaultValue when no highlight is active', () => {
      const state = createSeriesState();
      expect(state.isHighlighted('apples')).toBe(false);
      expect(state.isHighlighted('apples', true)).toBe(true);
    });

    it('should return true for highlighted series', () => {
      const state = createSeriesState();
      state.highlightKey = 'apples';

      expect(state.isHighlighted('apples')).toBe(true);
      expect(state.isHighlighted('bananas')).toBe(false);
    });

    it('should ignore defaultValue when highlight is active', () => {
      const state = createSeriesState();
      state.highlightKey = 'apples';

      expect(state.isHighlighted('bananas', true)).toBe(false);
    });

    it('should clear highlight when set to null', () => {
      const state = createSeriesState();
      state.highlightKey = 'apples';
      state.highlightKey = null;

      expect(state.isHighlighted('apples')).toBe(false);
    });
  });

  describe('allSeriesData', () => {
    it('should return empty when series have no data', () => {
      const state = createSeriesState();
      expect(state.allSeriesData).toHaveLength(0);
    });

    it('should flatten data from all series with seriesKey', () => {
      const seriesWithData = [
        { key: 'apples', data: [{ value: 10 }, { value: 20 }] },
        { key: 'bananas', data: [{ value: 30 }] },
      ];
      const state = createSeriesState(seriesWithData);

      expect(state.allSeriesData).toHaveLength(3);
      expect(state.allSeriesData[0]).toEqual({ seriesKey: 'apples', value: 10 });
      expect(state.allSeriesData[1]).toEqual({ seriesKey: 'apples', value: 20 });
      expect(state.allSeriesData[2]).toEqual({ seriesKey: 'bananas', value: 30 });
    });
  });

  describe('visibleSeriesData', () => {
    it('should only include data from visible series', () => {
      const seriesWithData = [
        { key: 'apples', data: [{ value: 10 }] },
        { key: 'bananas', data: [{ value: 20 }] },
      ];
      const state = createSeriesState(seriesWithData);

      state.selectedKeys.toggle('apples');

      expect(state.visibleSeriesData).toHaveLength(1);
      expect(state.visibleSeriesData[0].seriesKey).toBe('apples');
    });
  });

  describe('allSeriesColors', () => {
    it('should return colors from all series', () => {
      const state = createSeriesState();
      expect(state.allSeriesColors).toEqual(['red', 'yellow', 'orange']);
    });

    it('should filter out undefined colors', () => {
      const seriesWithMissingColor = [
        { key: 'apples', color: 'red' },
        { key: 'bananas' },
        { key: 'oranges', color: 'orange' },
      ];
      const state = createSeriesState(seriesWithMissingColor);
      expect(state.allSeriesColors).toEqual(['red', 'orange']);
    });
  });

  describe('stacking', () => {
    it('should detect stack layout', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stack',
        data: wideData,
        keyBy: 'date',
      });
      expect(state.isStacked).toBe(true);
      expect(state.stackLayout).toBe('stack');
    });

    it('should detect stackExpand layout', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stackExpand',
        data: wideData,
        keyBy: 'date',
      });
      expect(state.isStacked).toBe(true);
      expect(state.stackLayout).toBe('stackExpand');
    });

    it('should detect stackDiverging layout', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stackDiverging',
        data: wideData,
        keyBy: 'date',
      });
      expect(state.isStacked).toBe(true);
      expect(state.stackLayout).toBe('stackDiverging');
    });

    it('should not detect overlap as stacked', () => {
      const state = createSeriesState(series as any[], {
        layout: 'overlap',
        data: wideData,
        keyBy: 'date',
      });
      expect(state.isStacked).toBe(false);
    });

    it('should return stack values for a data point', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stack',
        data: wideData,
        keyBy: 'date',
      });

      const stackVal = state.getStackValue('apples', wideData[0]);
      expect(stackVal).not.toBeNull();
      expect(stackVal![0]).toBe(0); // first series starts at 0
      expect(stackVal![1]).toBe(100); // apples value for first data point
    });

    it('should stack subsequent series on top of previous', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stack',
        data: wideData,
        keyBy: 'date',
      });

      const appleVal = state.getStackValue('apples', wideData[0]);
      const bananaVal = state.getStackValue('bananas', wideData[0]);

      // Bananas should start where apples end
      expect(bananaVal![0]).toBe(appleVal![1]);
      expect(bananaVal![1]).toBe(appleVal![1]! + 80);
    });

    it('should return null for stack value when not stacking', () => {
      const state = createSeriesState();
      expect(state.getStackValue('apples', wideData[0])).toBeNull();
    });

    it('should return null for unknown series key', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stack',
        data: wideData,
        keyBy: 'date',
      });
      expect(state.getStackValue('unknown', wideData[0])).toBeNull();
    });

    it('should provide stack accessors', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stack',
        data: wideData,
        keyBy: 'date',
      });

      const accessors = state.getStackAccessors('bananas');
      expect(typeof accessors.y0).toBe('function');
      expect(typeof accessors.y1).toBe('function');
      expect(typeof accessors.value).toBe('function');

      const y0 = accessors.y0(wideData[0]);
      const y1 = accessors.y1(wideData[0]);
      expect(y0).toBe(100); // starts after apples (100)
      expect(y1).toBe(180); // 100 + 80 (bananas)
    });

    it('should recalculate stack when series visibility changes', () => {
      const state = createSeriesState(series as any[], {
        layout: 'stack',
        data: wideData,
        keyBy: 'date',
      });

      // Initially bananas starts after apples
      let bananaVal = state.getStackValue('bananas', wideData[0]);
      expect(bananaVal![0]).toBe(100);

      // Hide apples — bananas should now start at 0
      state.selectedKeys.toggle('bananas');
      state.selectedKeys.toggle('oranges');
      // Only bananas and oranges visible. Bananas starts at 0.
      bananaVal = state.getStackValue('bananas', wideData[0]);
      expect(bananaVal![0]).toBe(0);
      expect(bananaVal![1]).toBe(80);
    });

    describe('with separate data per series', () => {
      const separateSeriesData = [
        {
          key: 'apples',
          color: 'red',
          data: [
            { date: '2024-01', value: 100 },
            { date: '2024-02', value: 120 },
          ],
        },
        {
          key: 'bananas',
          color: 'yellow',
          data: [
            { date: '2024-01', value: 80 },
            { date: '2024-02', value: 90 },
          ],
        },
      ];

      it('should compute stack from aligned separate data', () => {
        const state = createSeriesState(separateSeriesData, {
          layout: 'stack',
          keyBy: 'date',
          valueAccessor: 'value',
        });

        const appleVal = state.getStackValue('apples', { date: '2024-01', value: 100 } as any);
        const bananaVal = state.getStackValue('bananas', { date: '2024-01', value: 80 } as any);

        expect(appleVal).not.toBeNull();
        expect(appleVal![0]).toBe(0);
        expect(appleVal![1]).toBe(100);

        expect(bananaVal).not.toBeNull();
        expect(bananaVal![0]).toBe(100);
        expect(bananaVal![1]).toBe(180);
      });
    });

    describe('stackExpand normalization', () => {
      it('should normalize stack values to 0-1 range', () => {
        const state = createSeriesState(series as any[], {
          layout: 'stackExpand',
          data: wideData,
          keyBy: 'date',
        });

        const appleVal = state.getStackValue('apples', wideData[0]);
        const orangeVal = state.getStackValue('oranges', wideData[0]);

        // stackExpand normalizes to [0, 1]
        expect(appleVal![0]).toBeCloseTo(0);
        expect(orangeVal![1]).toBeCloseTo(1);
      });
    });
  });
});
