import { describe, expect, it } from 'vitest';
import { scaleBand, scaleLinear } from 'd3-scale';

import { keyboardNav, keyboardNavStep, type KeyboardNavContext } from './keyboard.js';

const xScale = scaleLinear().domain([0, 30]).range([0, 300]);

function context(overrides: Partial<KeyboardNavContext> & { flatData: any[] }): KeyboardNavContext {
  return {
    valueAxis: 'y',
    xGet: (d) => xScale(d.x),
    yGet: (d) => d.y,
    cKey: () => null,
    cGroups: null,
    series: { isDefaultSeries: true, visibleSeries: [] },
    ...overrides,
  };
}

// Out of order on purpose — navigation follows the screen, not the array
const single = [
  { x: 20, y: 30 },
  { x: 0, y: 10 },
  { x: 10, y: 20 },
];

describe('keyboardNav', () => {
  it('orders a lone series by position', () => {
    const nav = keyboardNav(context({ flatData: single }));
    expect(nav.series).toHaveLength(1);
    expect(nav.series[0].key).toBeNull();
    expect(nav.series[0].rows.map((d) => d.x)).toEqual([0, 10, 20]);
    expect(nav.positions).toBeNull();
  });

  it('orders a band scale by its domain, not its values', () => {
    const band = scaleBand().domain(['c', 'a', 'b']).range([0, 300]);
    const flatData = [{ x: 'a' }, { x: 'b' }, { x: 'c' }];
    const nav = keyboardNav(context({ flatData, xGet: (d) => band(d.x) }));
    expect(nav.series[0].rows.map((d) => d.x)).toEqual(['c', 'a', 'b']);
  });

  it('orders a horizontal chart along y', () => {
    const flatData = [
      { x: 1, y: 200 },
      { x: 2, y: 0 },
      { x: 3, y: 100 },
    ];
    const nav = keyboardNav(context({ flatData, valueAxis: 'x' }));
    expect(nav.series[0].rows.map((d) => d.x)).toEqual([2, 3, 1]);
  });

  it('builds a group per wide series, skipping rows a series has no value for', () => {
    const flatData = [
      { x: 0, apples: 1, bananas: 4 },
      { x: 10, apples: null, bananas: 5 },
      { x: 20, apples: 3, bananas: 6 },
    ];
    const nav = keyboardNav(
      context({
        flatData,
        series: {
          isDefaultSeries: false,
          visibleSeries: [{ key: 'apples' }, { key: 'bananas', value: (d: any) => d.bananas }],
        },
      })
    );
    expect(nav.series.map((g) => g.key)).toEqual(['apples', 'bananas']);
    expect(nav.series[0].rows.map((d) => d.x)).toEqual([0, 20]);
    expect(nav.series[1].rows.map((d) => d.x)).toEqual([0, 10, 20]);
    expect(nav.positions?.rows.map((d) => d.x)).toEqual([0, 10, 20]);
  });

  it('builds a group per series carrying its own data', () => {
    const flatData = [
      { seriesKey: 'a', x: 10 },
      { seriesKey: 'a', x: 0 },
      { seriesKey: 'b', x: 5 },
    ];
    const nav = keyboardNav(
      context({
        flatData,
        series: {
          isDefaultSeries: false,
          visibleSeries: [
            { key: 'a', data: [] },
            { key: 'b', data: [] },
          ],
        },
      })
    );
    expect(nav.series[0].rows.map((d) => d.x)).toEqual([0, 10]);
    expect(nav.series[1].rows.map((d) => d.x)).toEqual([5]);
    expect(nav.positions?.rows.map((d) => d.x)).toEqual([0, 5, 10]);
  });

  it('builds a group per `c` category, dropping empty ones', () => {
    const flatData = [
      { x: 0, fruit: 'apple' },
      { x: 0, fruit: 'pear' },
      { x: 10, fruit: 'apple' },
    ];
    const nav = keyboardNav(
      context({ flatData, cGroups: ['apple', 'pear', 'plum'], cKey: (d) => d.fruit })
    );
    expect(nav.series.map((g) => g.key)).toEqual(['apple', 'pear']);
    expect(nav.series[0].rows).toHaveLength(2);
  });

  it('has no positions for single point modes', () => {
    const flatData = [
      { x: 0, fruit: 'apple' },
      { x: 0, fruit: 'pear' },
    ];
    const nav = keyboardNav(
      context({ flatData, cGroups: ['apple', 'pear'], cKey: (d) => d.fruit }),
      { singlePoint: true }
    );
    expect(nav.positions).toBeNull();
  });

  it('orders facet panels before positions', () => {
    const flatData = [
      { x: 0, panel: 1 },
      { x: 10, panel: 0 },
      { x: 0, panel: 0 },
    ];
    const nav = keyboardNav(
      context({
        flatData,
        facet: {
          enabled: true,
          panels: [{ has: (d: any) => d.panel === 0 }, { has: (d: any) => d.panel === 1 }],
        },
      })
    );
    expect(nav.series[0].rows.map((d) => [d.panel, d.x])).toEqual([
      [0, 0],
      [0, 10],
      [1, 0],
    ]);
  });
});

describe('keyboardNavStep', () => {
  const ctx = context({ flatData: single });
  const nav = keyboardNav(ctx);
  const [first, second, third] = nav.series[0].rows;

  it('starts at either end when nothing is current', () => {
    expect(keyboardNavStep(ctx, nav, null, 'next')?.data).toBe(first);
    expect(keyboardNavStep(ctx, nav, null, 'previous')?.data).toBe(third);
  });

  it('steps along the group and stops at its ends', () => {
    const at = (data: any) => ({ data, seriesKey: null });
    expect(keyboardNavStep(ctx, nav, at(first), 'next')?.data).toBe(second);
    expect(keyboardNavStep(ctx, nav, at(second), 'previous')?.data).toBe(first);
    expect(keyboardNavStep(ctx, nav, at(third), 'next')?.data).toBe(third);
    expect(keyboardNavStep(ctx, nav, at(first), 'previous')?.data).toBe(first);
  });

  it('jumps to the first and last', () => {
    expect(keyboardNavStep(ctx, nav, { data: second, seriesKey: null }, 'first')?.data).toBe(first);
    expect(keyboardNavStep(ctx, nav, { data: second, seriesKey: null }, 'last')?.data).toBe(third);
  });

  it('continues from the nearest row when the current one is not in the group', () => {
    // ex. a row the pointer resolved to from another chart
    const elsewhere = { x: 11, y: 0 };
    expect(keyboardNavStep(ctx, nav, { data: elsewhere, seriesKey: null }, 'next')?.data).toBe(
      third
    );
  });

  it('stays put across series when there is only one', () => {
    expect(keyboardNavStep(ctx, nav, { data: second, seriesKey: null }, 'nextSeries')).toEqual({
      data: second,
      seriesKey: null,
    });
  });

  describe('between series', () => {
    const flatData = [
      { x: 0, apples: 1, bananas: 4 },
      { x: 10, apples: null, bananas: 5 },
      { x: 20, apples: 3, bananas: 6 },
    ];
    const ctx = context({
      flatData,
      series: { isDefaultSeries: false, visibleSeries: [{ key: 'apples' }, { key: 'bananas' }] },
    });
    const nav = keyboardNav(ctx);

    it('navigates the positions until a series is entered', () => {
      expect(keyboardNavStep(ctx, nav, null, 'next')).toEqual({ data: flatData[0], seriesKey: null }); // prettier-ignore
      expect(keyboardNavStep(ctx, nav, { data: flatData[0], seriesKey: null }, 'next')).toEqual({
        data: flatData[1],
        seriesKey: null,
      });
    });

    it('enters the first series going forward and the last going back', () => {
      const atPosition = { data: flatData[2], seriesKey: null };
      expect(keyboardNavStep(ctx, nav, atPosition, 'nextSeries')).toEqual({
        data: flatData[2],
        seriesKey: 'apples',
      });
      expect(keyboardNavStep(ctx, nav, atPosition, 'previousSeries')).toEqual({
        data: flatData[2],
        seriesKey: 'bananas',
      });
    });

    it('keeps the row when the next series has it, and clamps at the last series', () => {
      const atApples = { data: flatData[0], seriesKey: 'apples' };
      expect(keyboardNavStep(ctx, nav, atApples, 'nextSeries')).toEqual({
        data: flatData[0],
        seriesKey: 'bananas',
      });
      expect(keyboardNavStep(ctx, nav, atApples, 'previousSeries')).toEqual(atApples);
    });

    it('lands on the nearest row when the next series has no value there', () => {
      expect(
        keyboardNavStep(ctx, nav, { data: flatData[1], seriesKey: 'bananas' }, 'previousSeries')
      ).toEqual({ data: flatData[0], seriesKey: 'apples' });
    });

    it('skips rows the series has no value for', () => {
      expect(keyboardNavStep(ctx, nav, { data: flatData[0], seriesKey: 'apples' }, 'next')).toEqual(
        { data: flatData[2], seriesKey: 'apples' }
      );
    });
  });
});
