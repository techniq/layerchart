import { describe, it, expect } from 'vitest';

import { accessor, resolveMaybeFn, getObjectOrNull } from './common.js';

export const testData = {
  one: 1,
  two: 2,
  obj: { value: 2 },
  arr: ['one', 'two', 'three'],
};

describe('accessor', () => {
  it('string path', () => {
    const actual = accessor('one')(testData);
    expect(actual).toEqual(testData.one);
  });

  it('nested path', () => {
    const actual = accessor('obj.value')(testData);
    expect(actual).toEqual(testData.obj.value);
  });

  it('multiple properties', () => {
    const actual = accessor(['one', 'two', 'obj.value', (d) => d.arr[0]])(testData);
    expect(actual).toEqual([testData.one, testData.two, testData.obj.value, testData.arr[0]]);
  });

  it('multiple properties as numbers (index)', () => {
    const actual = accessor([0, 1])(testData.arr);
    expect(actual).toEqual([testData.arr[0], testData.arr[1]]);
  });

  it('function', () => {
    const actual = accessor((d) => d.obj.value)(testData);
    expect(actual).toEqual(testData.obj.value);
  });

  it('string path with array value', () => {
    const actual = accessor('arr[0]')(testData);
    expect(actual).toEqual(testData.arr[0]);
  });

  it('null returns full object', () => {
    const actual = accessor(null)(testData);
    expect(actual).toEqual(testData);
  });
});

describe('getObjectOrNull', () => {
  it('returns null for non-object values', () => {
    expect(getObjectOrNull(5)).toBeNull();
    expect(getObjectOrNull('string')).toBeNull();
    expect(getObjectOrNull(null)).toBeNull();
    expect(getObjectOrNull(undefined)).toBeUndefined();
  });

  it('returns null for functions', () => {
    const fn = () => {};
    expect(getObjectOrNull(fn)).toBeNull();
  });

  it('returns the object if value is an object', () => {
    const obj = { a: 1 };
    expect(getObjectOrNull(obj)).toBe(obj);
  });
});

describe('resolveMaybeFn', () => {
  it('returns value if not a function', () => {
    expect(resolveMaybeFn(5)).toBe(5);
  });

  it('calls function with args', () => {
    const fn = (a: number, b: number) => a + b;
    expect(resolveMaybeFn(fn, 2, 3)).toBe(5);
  });
});
