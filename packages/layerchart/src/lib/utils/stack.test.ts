import { describe, it, expect } from 'vitest';

import { groupStackData } from './stack.js';
import { group } from 'd3-array';

export const testData = [
  { year: 2019, basket: 1, fruit: 'apples', value: 3840 },
  { year: 2019, basket: 1, fruit: 'bananas', value: 1920 },
  { year: 2019, basket: 2, fruit: 'cherries', value: 960 },
  { year: 2019, basket: 2, fruit: 'grapes', value: 400 },

  { year: 2018, basket: 1, fruit: 'apples', value: 1600 },
  { year: 2018, basket: 1, fruit: 'bananas', value: 1440 },
  { year: 2018, basket: 2, fruit: 'cherries', value: 960 },
  { year: 2018, basket: 2, fruit: 'grapes', value: 400 },

  { year: 2017, basket: 1, fruit: 'apples', value: 820 },
  { year: 2017, basket: 1, fruit: 'bananas', value: 1000 },
  { year: 2017, basket: 2, fruit: 'cherries', value: 640 },
  { year: 2017, basket: 2, fruit: 'grapes', value: 400 },

  { year: 2016, basket: 1, fruit: 'apples', value: 820 },
  { year: 2016, basket: 1, fruit: 'bananas', value: 560 },
  { year: 2016, basket: 2, fruit: 'cherries', value: 720 },
  { year: 2016, basket: 2, fruit: 'grapes', value: 400 },
];

const testDataByYear = group(testData, (d) => d.year);

describe('groupStackData', () => {
  it('xKey only', () => {
    const actual = groupStackData(testData, { xKey: 'year' });

    expect(actual.length).toEqual(4);
    expect(actual[0]).toEqual({
      year: 2019,
      keys: { year: 2019 },
      value: 7120,
      values: [0, 7120],
      data: testDataByYear.get(2019),
    });
  });

  it('xKey with groupBy (unique)', () => {
    const xKey = 'year';
    const groupBy = 'fruit';
    const actual = groupStackData(testData, { xKey, groupBy });

    // 4 years, 4 fruits each (each a separate bar)
    expect(actual.length).toEqual(16);

    expect(actual[0]).toEqual({
      year: 2019,
      fruit: 'apples',
      value: 3840,
      keys: { year: 2019, fruit: 'apples' },
      values: [0, 3840],
      data: testDataByYear.get(2019),
    });

    expect(actual[1]).toEqual({
      year: 2019,
      fruit: 'bananas',
      value: 1920,
      keys: { year: 2019, fruit: 'bananas' },
      values: [0, 1920],
      data: testDataByYear.get(2019),
    });
  });

  it('xKey with groupBy (grouped)', () => {
    const xKey = 'year';
    const groupBy = 'basket';
    const actual = groupStackData(testData, { xKey, groupBy });

    // 4 years, 2 buckets each
    expect(actual.length).toEqual(8);

    expect(actual[0]).toEqual({
      year: 2019,
      basket: 1,
      value: 5760,
      keys: { year: 2019, basket: 1 },
      values: [0, 5760],
      data: testDataByYear.get(2019),
    });

    expect(actual[1]).toEqual({
      year: 2019,
      basket: 2,
      value: 1360,
      keys: { year: 2019, basket: 2 },
      values: [0, 1360],
      data: testDataByYear.get(2019),
    });

    expect(actual[2]).toEqual({
      year: 2018,
      basket: 1,
      value: 3040,
      keys: { year: 2018, basket: 1 },
      values: [0, 3040],
      data: testDataByYear.get(2018),
    });
  });

  it('xKey with stackBy', () => {
    const xKey = 'year';
    const stackBy = 'fruit';
    const actual = groupStackData(testData, { xKey, stackBy });

    // 4 years, 4 fruits each (each a separate bar)
    expect(actual.length).toEqual(16);

    expect(actual[0]).toEqual({
      year: 2019,
      fruit: 'apples',
      value: 3840,
      keys: { year: 2019, fruit: 'apples' },
      values: [0, 3840],
      data: testDataByYear.get(2019),
    });

    expect(actual[1]).toEqual({
      year: 2018,
      fruit: 'apples',
      value: 1600,
      keys: { year: 2018, fruit: 'apples' },
      values: [0, 1600],
      data: testDataByYear.get(2018),
    });

    expect(actual[2]).toEqual({
      year: 2017,
      fruit: 'apples',
      value: 820,
      keys: { year: 2017, fruit: 'apples' },
      values: [0, 820],
      data: testDataByYear.get(2017),
    });

    expect(actual[3]).toEqual({
      year: 2016,
      fruit: 'apples',
      value: 820,
      keys: { year: 2016, fruit: 'apples' },
      values: [0, 820],
      data: testDataByYear.get(2016),
    });

    expect(actual[4]).toEqual({
      year: 2019,
      fruit: 'bananas',
      value: 1920,
      keys: { year: 2019, fruit: 'bananas' },
      values: [3840, 5760],
      data: testDataByYear.get(2019),
    });
  });
});
