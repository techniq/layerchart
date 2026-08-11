import { describe, it, expect, vi } from 'vitest';
import { scaleTime, scaleUtc } from 'd3-scale';
import { utcDay } from 'd3-time';
import { PeriodType } from '@layerstack/utils';

import { autoTickFormat, autoTickVals, filterTicksByFormat } from './ticks.js';
import type { TimeInterval } from 'd3-time';

// Mock helpers
const mockTicksFn = vi.fn();
const mockDomain = vi.fn(() => ['a', 'b', 'c', 'd', 'e']);

describe('autoTickVals', () => {
  it('returns array ticks directly', () => {
    const ticks = [1, 2, 3];
    const scale = { ticks: mockTicksFn } as any;
    expect(autoTickVals(scale, ticks)).toEqual([1, 2, 3]);
  });

  it('calls function ticks with scale', () => {
    const fnTicks = vi.fn(() => [4, 5, 6]);
    const scale = { ticks: mockTicksFn } as any;
    expect(autoTickVals(scale, fnTicks)).toEqual([4, 5, 6]);
    expect(fnTicks).toHaveBeenCalledWith(scale);
  });

  it('uses interval when provided', () => {
    const interval = { every: vi.fn() } as unknown as TimeInterval;
    const ticksConfig = { interval };
    const scale = { ticks: vi.fn(() => [7, 8, 9]) } as any;
    expect(autoTickVals(scale, ticksConfig)).toEqual([7, 8, 9]);
    expect(scale.ticks).toHaveBeenCalledWith(interval);
  });

  it('returns empty array if interval is null', () => {
    const ticksConfig = { interval: null };
    const scale = { ticks: mockTicksFn } as any;
    expect(autoTickVals(scale, ticksConfig)).toEqual([]);
  });

  it('filters band scale domain with explicit number ticks', () => {
    const scale = { domain: mockDomain, bandwidth: vi.fn() } as any;
    // ticks=2, domain has 5 items → step = ceil(5/2) = 3 → indices 0, 3
    expect(autoTickVals(scale, 2)).toEqual(['a', 'd']);
  });

  it('filters band scale domain using count parameter (from tickSpacing)', () => {
    const scale = { domain: mockDomain, bandwidth: vi.fn() } as any;
    // count=3, domain has 5 items → step = ceil(5/3) = 2 → indices 0, 2, 4
    expect(autoTickVals(scale, undefined, 3)).toEqual(['a', 'c', 'e']);
  });

  it('returns full domain for band scale when count >= domain length', () => {
    const scale = { domain: mockDomain, bandwidth: vi.fn() } as any;
    expect(autoTickVals(scale, undefined, 10)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('returns full domain for band scale without ticks or count', () => {
    const scale = { domain: mockDomain, bandwidth: vi.fn() } as any;
    expect(autoTickVals(scale)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('uses undefined for non-left/right placement', () => {
    const scale = { domain: mockDomain, ticks: vi.fn(() => [1, 2]) } as any;
    expect(autoTickVals(scale, undefined, undefined)).toEqual([1, 2]);
    expect(scale.ticks).toHaveBeenCalledWith(undefined);
  });

  it('passes number ticks to scale.ticks', () => {
    const scale = { domain: mockDomain, ticks: vi.fn(() => [10, 20]) } as any;
    expect(autoTickVals(scale, 5)).toEqual([10, 20]);
    expect(scale.ticks).toHaveBeenCalledWith(5);
  });

  it('returns empty array for scale without ticks', () => {
    const scale = { domain: mockDomain } as any;
    expect(autoTickVals(scale, 5)).toEqual([]);
  });

  it('handles null ticks with placement', () => {
    const scale = { domain: mockDomain, ticks: vi.fn(() => [1, 2, 3]) } as any;
    expect(autoTickVals(scale, null, undefined)).toEqual([1, 2, 3]);
    expect(scale.ticks).toHaveBeenCalledWith(undefined);
  });
});

// The suite runs under a fixed non-zero offset (`TZ=UTC-5`), so local and UTC boundaries differ.
describe('filterTicksByFormat', () => {
  const utcMidnights = [
    new Date('2024-01-01T00:00:00Z'),
    new Date('2024-01-02T00:00:00Z'),
    new Date('2024-01-03T00:00:00Z'),
  ];

  it('keeps UTC-midnight ticks for a day format when utc is set', () => {
    expect(filterTicksByFormat(utcMidnights, 'day', { utc: true })).toEqual(utcMidnights);
    expect(filterTicksByFormat(utcMidnights, PeriodType.Day, { utc: true })).toEqual(utcMidnights);
  });

  it('drops UTC-midnight ticks for a day format when utc is not set', () => {
    // Regression: filtering a `scaleUtc()` axis with local intervals removed every tick, so a
    // day-formatted axis rendered no labels at all.
    expect(filterTicksByFormat(utcMidnights, 'day')).toEqual([]);
  });

  it('keeps local-midnight ticks for a day format without utc', () => {
    const localMidnights = [new Date(2024, 0, 1), new Date(2024, 0, 2)];
    expect(filterTicksByFormat(localMidnights, 'day')).toEqual(localMidnights);
    expect(filterTicksByFormat(localMidnights, 'day', { utc: true })).toEqual([]);
  });

  it('honours utc for month/year boundaries', () => {
    const firstOfMonth = [new Date('2024-01-01T00:00:00Z'), new Date('2024-02-01T00:00:00Z')];
    expect(filterTicksByFormat(firstOfMonth, 'month', { utc: true })).toEqual(firstOfMonth);
    expect(filterTicksByFormat(firstOfMonth, 'year', { utc: true })).toEqual([firstOfMonth[0]]);
  });

  it('passes through unknown/absent format types', () => {
    expect(filterTicksByFormat(utcMidnights, undefined)).toEqual(utcMidnights);
  });

  it('filters integers', () => {
    expect(filterTicksByFormat([1, 1.5, 2], 'integer')).toEqual([1, 2]);
  });
});

describe('autoTickFormat with a UTC scale', () => {
  const start = new Date('2024-01-02T00:00:00Z');
  const domain: [Date, Date] = [start, utcDay.offset(start, 3)];

  it('labels a UTC-midnight tick with its UTC day', () => {
    const scale = scaleUtc().domain(domain).range([0, 100]);
    const fmt = autoTickFormat({ scale: scale as any, formatType: 'day', count: 3 });
    expect(fmt(start, 0)).toContain('2');
    // Under TZ=UTC-5 the local day of this instant is Jan 1 — the label must not say that.
    expect(fmt(start, 0)).not.toContain('1/1');
  });

  it('still labels a local scale in local time', () => {
    const scale = scaleTime().domain(domain).range([0, 100]);
    const fmt = autoTickFormat({ scale: scale as any, formatType: 'day', count: 3 });
    expect(typeof fmt(start, 0)).toBe('string');
  });
});
