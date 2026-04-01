import { describe, bench, afterEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';

import LineChart from './LineChart.svelte';
import {
  generateTimeSeriesData,
  generateMultiSeriesData,
  generateSeparateSeriesData,
} from '$lib/bench/generateData.js';

afterEach(() => {
  cleanup();
});

// ── Data size scaling ────────────────────────────────────────────────
describe('LineChart mount — data size', () => {
  const data10 = generateTimeSeriesData(10);
  const data100 = generateTimeSeriesData(100);
  const data1000 = generateTimeSeriesData(1_000);
  const data5000 = generateTimeSeriesData(5_000);

  bench('10 points', () => {
    cleanup();
    render(LineChart, { data: data10, x: 'date', y: 'value', height: 300 });
  });

  bench('100 points', () => {
    cleanup();
    render(LineChart, { data: data100, x: 'date', y: 'value', height: 300 });
  });

  bench('1,000 points', () => {
    cleanup();
    render(LineChart, { data: data1000, x: 'date', y: 'value', height: 300 });
  });

  bench('5,000 points', () => {
    cleanup();
    render(LineChart, { data: data5000, x: 'date', y: 'value', height: 300 });
  });
});

// ── Explicit dimensions vs auto-sizing ──────────────────────────────
describe('LineChart mount — explicit dimensions', () => {
  const data = generateTimeSeriesData(500);

  bench('no explicit width/height (auto-size)', () => {
    cleanup();
    render(LineChart, { data, x: 'date', y: 'value' });
  });

  bench('explicit height only', () => {
    cleanup();
    render(LineChart, { data, x: 'date', y: 'value', height: 300 });
  });

  bench('explicit width and height', () => {
    cleanup();
    render(LineChart, { data, x: 'date', y: 'value', width: 600, height: 300 });
  });
});

// ── Explicit domain vs computed domain ──────────────────────────────
describe('LineChart mount — domain optimization', () => {
  const data = generateTimeSeriesData(1_000);
  const xDomain = [data[0].date, data[data.length - 1].date] as [Date, Date];
  const yValues = data.map((d) => d.value);
  const yDomain = [Math.min(...yValues), Math.max(...yValues)] as [number, number];

  bench('computed domain (default)', () => {
    cleanup();
    render(LineChart, { data, x: 'date', y: 'value', height: 300 });
  });

  bench('explicit xDomain', () => {
    cleanup();
    render(LineChart, { data, x: 'date', y: 'value', height: 300, xDomain });
  });

  bench('explicit xDomain + yDomain', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
      xDomain,
      yDomain,
    });
  });

  bench('explicit width + height + xDomain + yDomain', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      y: 'value',
      width: 600,
      height: 300,
      xDomain,
      yDomain,
    });
  });
});

// ── Data patterns: chart-level vs series ────────────────────────────
describe('LineChart mount — data patterns (3 series)', () => {
  const seriesKeys = ['alpha', 'beta', 'gamma'];
  const wideData = generateMultiSeriesData(500, seriesKeys);
  const separateData = generateSeparateSeriesData(500, seriesKeys);

  bench('chart-level data + series (wide format)', () => {
    cleanup();
    render(LineChart, {
      data: wideData,
      x: 'date',
      series: seriesKeys.map((key) => ({ key, color: 'currentColor' })),
      height: 300,
    });
  });

  bench('series with separate data (long format)', () => {
    cleanup();
    render(LineChart, {
      x: 'date',
      y: 'value',
      series: seriesKeys.map((key) => ({
        key,
        color: 'currentColor',
        data: separateData[key],
      })),
      height: 300,
    });
  });
});

// ── Series count scaling ────────────────────────────────────────────
describe('LineChart mount — series count', () => {
  const keys1 = ['a'];
  const keys3 = ['a', 'b', 'c'];
  const keys5 = ['a', 'b', 'c', 'd', 'e'];
  const keys10 = Array.from({ length: 10 }, (_, i) => `s${i}`);

  const data1 = generateMultiSeriesData(200, keys1);
  const data3 = generateMultiSeriesData(200, keys3);
  const data5 = generateMultiSeriesData(200, keys5);
  const data10 = generateMultiSeriesData(200, keys10);

  const makeSeries = (keys: string[]) =>
    keys.map((key) => ({ key, color: 'currentColor' }));

  bench('1 series', () => {
    cleanup();
    render(LineChart, { data: data1, x: 'date', series: makeSeries(keys1), height: 300 });
  });

  bench('3 series', () => {
    cleanup();
    render(LineChart, { data: data3, x: 'date', series: makeSeries(keys3), height: 300 });
  });

  bench('5 series', () => {
    cleanup();
    render(LineChart, { data: data5, x: 'date', series: makeSeries(keys5), height: 300 });
  });

  bench('10 series', () => {
    cleanup();
    render(LineChart, { data: data10, x: 'date', series: makeSeries(keys10), height: 300 });
  });
});

// ── Chart features impact ───────────────────────────────────────────
describe('LineChart mount — feature toggles', () => {
  const data = generateTimeSeriesData(500);

  bench('minimal (no axis, no legend, no highlight)', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
      axis: false,
      legend: false,
      highlight: false,
      tooltipContext: false,
    });
  });

  bench('axis only', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
      axis: true,
      legend: false,
      highlight: false,
      tooltipContext: false,
    });
  });

  bench('default (axis + highlight + tooltip)', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
    });
  });

  bench('all features (axis + highlight + tooltip + legend)', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
      legend: true,
    });
  });
});
