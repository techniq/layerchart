import { describe, bench, afterEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';

import LineChart from '$lib/components/charts/LineChart/LineChart.svelte';
import ComposableLineChart from './ComposableLineChart.svelte';
import { generateTimeSeriesData, generateMultiSeriesData } from './generateData.js';

// SVG vs Canvas benchmarks are in svg-vs-canvas.svelte.bench.ts

afterEach(() => {
  cleanup();
});

// ── Composable API vs high-level LineChart ──────────────────────────
describe('Composable vs LineChart — single series (500 pts)', () => {
  const data = generateTimeSeriesData(500);

  bench('LineChart (default features)', () => {
    cleanup();
    render(LineChart, { data, x: 'date', y: 'value', height: 300 });
  });

  bench('LineChart (minimal: no axis/highlight/tooltip)', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
      axis: false,
      highlight: false,
      tooltipContext: false,
    });
  });

  bench('Composable: Chart + Layer + Spline only', () => {
    cleanup();
    render(ComposableLineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
    });
  });

  bench('Composable: Chart + Layer + Spline + Axis', () => {
    cleanup();
    render(ComposableLineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
      axis: true,
    });
  });

  bench('Composable: Chart + Layer + Spline + Axis + Highlight', () => {
    cleanup();
    render(ComposableLineChart, {
      data,
      x: 'date',
      y: 'value',
      height: 300,
      axis: true,
      highlight: true,
    });
  });
});

// ── Composable vs LineChart — multi-series ──────────────────────────
describe('Composable vs LineChart — 5 series (500 pts)', () => {
  const keys = ['a', 'b', 'c', 'd', 'e'];
  const data = generateMultiSeriesData(500, keys);
  const series = keys.map((key) => ({ key, color: 'currentColor' }));

  bench('LineChart with series', () => {
    cleanup();
    render(LineChart, { data, x: 'date', series, height: 300 });
  });

  bench('LineChart with series (minimal)', () => {
    cleanup();
    render(LineChart, {
      data,
      x: 'date',
      series,
      height: 300,
      axis: false,
      highlight: false,
      tooltipContext: false,
    });
  });

  bench('Composable with series (Spline only)', () => {
    cleanup();
    render(ComposableLineChart, {
      data,
      x: 'date',
      series,
      height: 300,
    });
  });

  bench('Composable with series + Axis', () => {
    cleanup();
    render(ComposableLineChart, {
      data,
      x: 'date',
      series,
      height: 300,
      axis: true,
    });
  });
});
