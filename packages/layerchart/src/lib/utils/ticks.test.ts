import { describe, it, expect, vi } from 'vitest';
import { resolveTickVals } from './ticks.js';
import type { TimeInterval } from 'd3-time';

// Mock helpers
const mockTicksFn = vi.fn();
const mockDomain = vi.fn(() => ['a', 'b', 'c', 'd', 'e']);

describe('resolveTickVals', () => {
  it('returns array ticks directly', () => {
    const ticks = [1, 2, 3];
    const scale = { ticks: mockTicksFn } as any;
    expect(resolveTickVals(scale, ticks)).toEqual([1, 2, 3]);
  });

  it('calls function ticks with scale', () => {
    const fnTicks = vi.fn(() => [4, 5, 6]);
    const scale = { ticks: mockTicksFn } as any;
    expect(resolveTickVals(scale, fnTicks)).toEqual([4, 5, 6]);
    expect(fnTicks).toHaveBeenCalledWith(scale);
  });

  it('uses interval when provided', () => {
    const interval = { every: vi.fn() } as unknown as TimeInterval;
    const ticksConfig = { interval };
    const scale = { ticks: vi.fn(() => [7, 8, 9]) } as any;
    expect(resolveTickVals(scale, ticksConfig)).toEqual([7, 8, 9]);
    expect(scale.ticks).toHaveBeenCalledWith(interval);
  });

  it('returns empty array if interval is null', () => {
    const ticksConfig = { interval: null };
    const scale = { ticks: mockTicksFn } as any;
    expect(resolveTickVals(scale, ticksConfig)).toEqual([]);
  });

  it('filters band scale domain with number ticks', () => {
    const scale = { domain: mockDomain, bandwidth: vi.fn() } as any;
    expect(resolveTickVals(scale, 2)).toEqual(['a', 'c', 'e']);
  });

  it('returns full domain for band scale without ticks', () => {
    const scale = { domain: mockDomain, bandwidth: vi.fn() } as any;
    expect(resolveTickVals(scale)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('uses undefined for non-left/right placement', () => {
    const scale = { domain: mockDomain, ticks: vi.fn(() => [1, 2]) } as any;
    expect(resolveTickVals(scale, undefined, undefined)).toEqual([1, 2]);
    expect(scale.ticks).toHaveBeenCalledWith(undefined);
  });

  it('passes number ticks to scale.ticks', () => {
    const scale = { domain: mockDomain, ticks: vi.fn(() => [10, 20]) } as any;
    expect(resolveTickVals(scale, 5)).toEqual([10, 20]);
    expect(scale.ticks).toHaveBeenCalledWith(5);
  });

  it('returns empty array for scale without ticks', () => {
    const scale = { domain: mockDomain } as any;
    expect(resolveTickVals(scale, 5)).toEqual([]);
  });

  it('handles null ticks with placement', () => {
    const scale = { domain: mockDomain, ticks: vi.fn(() => [1, 2, 3]) } as any;
    expect(resolveTickVals(scale, null, undefined)).toEqual([1, 2, 3]);
    expect(scale.ticks).toHaveBeenCalledWith(undefined);
  });
});
