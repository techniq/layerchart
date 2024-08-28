import { describe, it, expect } from 'vitest';

import { accessor } from './common.js';

export const testData = {
  one: 1,
  two: 2,
  obj: { value: 2 },
  arr: ['one', 'two', 'three'],
};

describe('accessor', () => {
  it('string', () => {
    const actual = accessor('one')(testData);
    expect(actual).toEqual(testData.one);
  });

  it('nested string', () => {
    const actual = accessor('obj.value')(testData);
    expect(actual).toEqual(testData.obj.value);
  });

  it('multiple properties', () => {
    const actual = accessor(['one', 'two', 'obj.value', (d) => d.arr[0]])(testData);
    expect(actual).toEqual([testData.one, testData.two, testData.obj.value, testData.arr[0]]);
  });

  it('function', () => {
    const actual = accessor((d) => d.obj.value)(testData);
    expect(actual).toEqual(testData.obj.value);
  });

  it('string array', () => {
    const actual = accessor('arr[0]')(testData);
    expect(actual).toEqual(testData.arr[0]);
  });

  it('null returns full object', () => {
    const actual = accessor(null)(testData);
    expect(actual).toEqual(testData);
  });
});
