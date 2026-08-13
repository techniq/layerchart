import { describe, it, expect } from 'vitest';

import {
  accessor,
  findRelatedData,
  isEqualValue,
  resolveMaybeFn,
  getObjectOrNull,
} from './common.js';

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

describe('isEqualValue', () => {
  it('compares primitives by value', () => {
    expect(isEqualValue(1, 1)).toBe(true);
    expect(isEqualValue(1, 2)).toBe(false);
    expect(isEqualValue('a', 'a')).toBe(true);
    expect(isEqualValue('a', 'b')).toBe(false);
    expect(isEqualValue(true, true)).toBe(true);
    expect(isEqualValue(0, false)).toBe(false);
    expect(isEqualValue(0, '0')).toBe(false);
  });

  it('compares distinct Date instances by their instant', () => {
    expect(isEqualValue(new Date('2024-01-01'), new Date('2024-01-01'))).toBe(true);
    expect(isEqualValue(new Date('2024-01-01'), new Date('2024-01-02'))).toBe(false);
  });

  it('treats null and undefined as equal to each other, but not to a value', () => {
    // matches the `?.valueOf()` semantics `findRelatedData` has always had
    expect(isEqualValue(null, undefined)).toBe(true);
    expect(isEqualValue(null, null)).toBe(true);
    expect(isEqualValue(null, 0)).toBe(false);
    expect(isEqualValue(undefined, '')).toBe(false);
  });

  it('compares categorical (band/point scale) values correctly', () => {
    // the reason for `valueOf()` over d3's `+a === +b`: numeric coercion turns these into NaN,
    // so identical categories would never compare equal
    expect(isEqualValue('apples', 'apples')).toBe(true);
    expect(+'apples' === +'apples').toBe(false); // what the numeric idiom would report
  });

  it('falls back to identity for plain objects', () => {
    const datum = { value: 1 };
    expect(isEqualValue(datum, datum)).toBe(true);
    expect(isEqualValue(datum, { value: 1 })).toBe(false);
  });

  it('does not consider NaN equal to itself', () => {
    expect(isEqualValue(NaN, NaN)).toBe(false);
  });

  it('equates a Date with the matching timestamp', () => {
    // a consequence of comparing by `valueOf()` — worth knowing when domains mix the two
    expect(isEqualValue(new Date(0), 0)).toBe(true);
  });
});

describe('findRelatedData', () => {
  it('prefers exact object identity before accessor matching', () => {
    const first = { id: 'first', value: 10 };
    const second = { id: 'second', value: 10 };
    const data = [first, second];

    const actual = findRelatedData(data, second, accessor('value'));

    expect(actual).toBe(second);
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
