import { describe, bench, afterEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';
import LazyBench from './LazyBench.svelte';
import { generateTimeSeriesData } from './generateData.js';

afterEach(() => cleanup());

describe('50 stacked LineCharts (≈3 on screen)', () => {
  const data = generateTimeSeriesData(500);
  bench('eager', () => {
    cleanup();
    render(LazyBench, { data, count: 50, lazy: false });
  });
  bench('lazy', () => {
    cleanup();
    render(LazyBench, { data, count: 50, lazy: true });
  });
});
