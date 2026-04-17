import { describe, it, expect, vi, beforeEach } from 'vitest';

import { isDataProp, hasAnyDataProp, resolveDataProp, resolveColorProp } from './dataProp.js';

describe('isDataProp', () => {
  it('returns true for strings', () => {
    expect(isDataProp('date')).toBe(true);
    expect(isDataProp('nested.path')).toBe(true);
  });

  it('returns true for functions', () => {
    expect(isDataProp((d: any) => d.value)).toBe(true);
  });

  it('returns false for numbers', () => {
    expect(isDataProp(0)).toBe(false);
    expect(isDataProp(42)).toBe(false);
  });

  it('returns false for undefined and null', () => {
    expect(isDataProp(undefined)).toBe(false);
    expect(isDataProp(null)).toBe(false);
  });
});

describe('hasAnyDataProp', () => {
  it('returns true if any value is a string', () => {
    expect(hasAnyDataProp(10, 'date', 20)).toBe(true);
  });

  it('returns true if any value is a function', () => {
    expect(hasAnyDataProp(10, (d: any) => d.x, 20)).toBe(true);
  });

  it('returns false if all values are numbers', () => {
    expect(hasAnyDataProp(10, 20, 30)).toBe(false);
  });

  it('returns false if all values are undefined', () => {
    expect(hasAnyDataProp(undefined, undefined)).toBe(false);
  });

  it('ignores undefined values but detects strings', () => {
    expect(hasAnyDataProp(undefined, 'date')).toBe(true);
  });
});

describe('resolveDataProp', () => {
  const data = { date: '2024-01-01', value: 42, nested: { x: 10 } };
  const mockScale = vi.fn((v: any) => v * 2) as any;

  beforeEach(() => {
    mockScale.mockClear();
  });

  it('returns number directly without calling scale', () => {
    expect(resolveDataProp(100, data, mockScale)).toBe(100);
    expect(mockScale).not.toHaveBeenCalled();
  });

  it('resolves string as property path and passes through scale', () => {
    expect(resolveDataProp('value', data, mockScale)).toBe(84); // 42 * 2
    expect(mockScale).toHaveBeenCalledWith(42);
  });

  it('resolves nested string paths', () => {
    expect(resolveDataProp('nested.x', data, mockScale)).toBe(20); // 10 * 2
    expect(mockScale).toHaveBeenCalledWith(10);
  });

  it('resolves function accessor and passes through scale', () => {
    const accessor = (d: any) => d.value;
    expect(resolveDataProp(accessor, data, mockScale)).toBe(84); // 42 * 2
    expect(mockScale).toHaveBeenCalledWith(42);
  });

  it('returns defaultValue for undefined', () => {
    expect(resolveDataProp(undefined, data, mockScale)).toBe(0);
    expect(resolveDataProp(undefined, data, mockScale, 99)).toBe(99);
  });

  it('returns defaultValue for null', () => {
    expect(resolveDataProp(null, data, mockScale)).toBe(0);
    expect(resolveDataProp(null, data, mockScale, 99)).toBe(99);
  });

  it('returns raw numeric value when no scale provided', () => {
    expect(resolveDataProp('value', data, null)).toBe(42);
    expect(resolveDataProp('value', data, undefined)).toBe(42);
  });

  it('returns defaultValue when no scale and raw value is not numeric', () => {
    expect(resolveDataProp('date', data, null)).toBe(0); // '2024-01-01' is not a number
  });

  it('returns defaultValue when scale returns non-finite value', () => {
    const badScale = vi.fn(() => NaN);
    expect(resolveDataProp('value', data, badScale as any)).toBe(0);
  });

  it('returns defaultValue when scale returns Infinity', () => {
    const badScale = vi.fn(() => Infinity);
    expect(resolveDataProp('value', data, badScale as any)).toBe(0);
  });

  it('handles function returning a number without scale', () => {
    const accessor = (d: any) => d.value;
    expect(resolveDataProp(accessor, data, null)).toBe(42);
  });
});

describe('resolveColorProp', () => {
  const data = { category: 'A', value: 42, color: '#ff0000' };
  const mockCScale = vi.fn((v: any) => (v === 'A' ? 'steelblue' : v === 'B' ? 'coral' : 'gray'));

  beforeEach(() => {
    mockCScale.mockClear();
  });

  it('returns undefined for undefined input', () => {
    expect(resolveColorProp(undefined, data, mockCScale as any)).toBeUndefined();
  });

  it('returns undefined for null input', () => {
    expect(resolveColorProp(null, data, mockCScale as any)).toBeUndefined();
  });

  it('resolves string data property through cScale', () => {
    expect(resolveColorProp('category', data, mockCScale as any)).toBe('steelblue');
    expect(mockCScale).toHaveBeenCalledWith('A');
  });

  it('returns literal CSS color when string does not match a data property', () => {
    expect(resolveColorProp('red', data, mockCScale as any)).toBe('red');
    expect(mockCScale).not.toHaveBeenCalled();
  });

  it('returns hex color literal when not a data property', () => {
    expect(resolveColorProp('#00ff00', data, mockCScale as any)).toBe('#00ff00');
    expect(mockCScale).not.toHaveBeenCalled();
  });

  it('resolves function accessor through cScale', () => {
    expect(resolveColorProp((d: any) => d.category, data, mockCScale as any)).toBe('steelblue');
    expect(mockCScale).toHaveBeenCalledWith('A');
  });

  it('returns stringified data value when no cScale', () => {
    expect(resolveColorProp('category', data, null)).toBe('A');
  });

  it('returns data property value directly when it is a color string and no cScale', () => {
    expect(resolveColorProp('color', data, null)).toBe('#ff0000');
  });

  it('returns undefined when function accessor returns undefined', () => {
    expect(resolveColorProp((d: any) => d.nonexistent, data, mockCScale as any)).toBeUndefined();
  });

  it('returns stringified function result when no cScale', () => {
    expect(resolveColorProp((d: any) => d.value, data, null)).toBe('42');
  });
});
