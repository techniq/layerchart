import { describe, it, expect } from 'vitest';

import { createStackData } from './stack.js';

export const testData = [
  { year: 2019, basket: 1, fruit: 'apples', value: 3840 },
  { year: 2019, basket: 1, fruit: 'bananas', value: 1920 },
  { year: 2019, basket: 2, fruit: 'cherries', value: 960 },
  { year: 2019, basket: 2, fruit: 'dates', value: 400 },

  { year: 2018, basket: 1, fruit: 'apples', value: 1600 },
  { year: 2018, basket: 1, fruit: 'bananas', value: 1440 },
  { year: 2018, basket: 2, fruit: 'cherries', value: 960 },
  { year: 2018, basket: 2, fruit: 'dates', value: 400 },

  { year: 2017, basket: 1, fruit: 'apples', value: 820 },
  { year: 2017, basket: 1, fruit: 'bananas', value: 1000 },
  { year: 2017, basket: 2, fruit: 'cherries', value: 640 },
  { year: 2017, basket: 2, fruit: 'dates', value: 400 },

  { year: 2016, basket: 1, fruit: 'apples', value: 820 },
  { year: 2016, basket: 1, fruit: 'bananas', value: 560 },
  { year: 2016, basket: 2, fruit: 'cherries', value: 720 },
  { year: 2016, basket: 2, fruit: 'dates', value: 400 },
];

describe('createStackData', () => {
  it('xKey only', () => {
    const actual = createStackData(testData, { xKey: 'year' });

    expect(actual.length).toEqual(4);
    const expected = {};
    // expect(actual).toEqual(expected);
  });

  it('xKey with groupBy', () => {
    const xKey = 'year';
    const groupBy = 'fruit';
    const actual = createStackData(testData, { xKey, groupBy });

    expect(actual.length).toEqual(16); // same length, but with
    const expected = {};
    // expect(actual).toEqual(expected);
  });
});
