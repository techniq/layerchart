import { describe, bench, afterEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';
import { geoNaturalEarth1, geoOrthographic, geoMercator } from 'd3-geo';

import ComposableLineChart from './ComposableLineChart.svelte';
import GeoBench from './GeoBench.svelte';
import {
  generateTimeSeriesData,
  generateMultiSeriesData,
  generateGeoFeatures,
} from './generateData.js';

afterEach(() => {
  cleanup();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LINE CHARTS — large datasets
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('SVG vs Canvas — single line, large datasets', () => {
  const data5k = generateTimeSeriesData(5_000);
  const data10k = generateTimeSeriesData(10_000);
  const data25k = generateTimeSeriesData(25_000);
  const data50k = generateTimeSeriesData(50_000);

  bench('SVG — 5K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 5K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'canvas',
    });
  });

  bench('SVG — 10K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data10k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 10K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data10k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'canvas',
    });
  });

  bench('SVG — 25K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data25k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 25K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data25k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'canvas',
    });
  });

  bench('SVG — 50K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data50k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 50K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data50k,
      x: 'date',
      y: 'value',
      height: 300,
      layer: 'canvas',
    });
  });
});

describe('SVG vs Canvas — multi-series, large datasets', () => {
  const keys5 = ['a', 'b', 'c', 'd', 'e'];
  const keys10 = Array.from({ length: 10 }, (_, i) => `s${i}`);
  const series5 = keys5.map((key) => ({ key, color: 'currentColor' }));
  const series10 = keys10.map((key) => ({ key, color: 'currentColor' }));

  const data5s_2k = generateMultiSeriesData(2_000, keys5);
  const data5s_5k = generateMultiSeriesData(5_000, keys5);
  const data5s_10k = generateMultiSeriesData(10_000, keys5);
  const data10s_2k = generateMultiSeriesData(2_000, keys10);
  const data10s_5k = generateMultiSeriesData(5_000, keys10);

  bench('SVG — 5 series × 2K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5s_2k,
      x: 'date',
      series: series5,
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 5 series × 2K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5s_2k,
      x: 'date',
      series: series5,
      height: 300,
      layer: 'canvas',
    });
  });

  bench('SVG — 5 series × 5K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5s_5k,
      x: 'date',
      series: series5,
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 5 series × 5K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5s_5k,
      x: 'date',
      series: series5,
      height: 300,
      layer: 'canvas',
    });
  });

  bench('SVG — 5 series × 10K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5s_10k,
      x: 'date',
      series: series5,
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 5 series × 10K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data5s_10k,
      x: 'date',
      series: series5,
      height: 300,
      layer: 'canvas',
    });
  });

  bench('SVG — 10 series × 2K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data10s_2k,
      x: 'date',
      series: series10,
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 10 series × 2K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data10s_2k,
      x: 'date',
      series: series10,
      height: 300,
      layer: 'canvas',
    });
  });

  bench('SVG — 10 series × 5K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data10s_5k,
      x: 'date',
      series: series10,
      height: 300,
      layer: 'svg',
    });
  });

  bench('Canvas — 10 series × 5K pts', () => {
    cleanup();
    render(ComposableLineChart, {
      data: data10s_5k,
      x: 'date',
      series: series10,
      height: 300,
      layer: 'canvas',
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEO — feature count scaling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('SVG vs Canvas — geo feature count (20 vertices each)', () => {
  const geo25 = generateGeoFeatures(25, 20);
  const geo50 = generateGeoFeatures(50, 20);
  const geo100 = generateGeoFeatures(100, 20);
  const geo250 = generateGeoFeatures(250, 20);

  bench('SVG — 25 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo25.features,
      fitGeojson: geo25.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 25 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo25.features,
      fitGeojson: geo25.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });

  bench('SVG — 50 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo50.features,
      fitGeojson: geo50.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 50 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo50.features,
      fitGeojson: geo50.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });

  bench('SVG — 100 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo100.features,
      fitGeojson: geo100.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 100 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo100.features,
      fitGeojson: geo100.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });

  bench('SVG — 250 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo250.features,
      fitGeojson: geo250.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 250 features', () => {
    cleanup();
    render(GeoBench, {
      features: geo250.features,
      fitGeojson: geo250.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEO — polygon complexity (vertices per feature)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('SVG vs Canvas — geo polygon complexity (50 features)', () => {
  const simple = generateGeoFeatures(50, 8);
  const medium = generateGeoFeatures(50, 30);
  const complex = generateGeoFeatures(50, 80);
  const veryComplex = generateGeoFeatures(50, 200);

  bench('SVG — 8 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: simple.features,
      fitGeojson: simple.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 8 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: simple.features,
      fitGeojson: simple.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });

  bench('SVG — 30 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: medium.features,
      fitGeojson: medium.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 30 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: medium.features,
      fitGeojson: medium.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });

  bench('SVG — 80 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: complex.features,
      fitGeojson: complex.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 80 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: complex.features,
      fitGeojson: complex.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });

  bench('SVG — 200 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: veryComplex.features,
      fitGeojson: veryComplex.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — 200 vertices/feature', () => {
    cleanup();
    render(GeoBench, {
      features: veryComplex.features,
      fitGeojson: veryComplex.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEO — projection type comparison
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('SVG vs Canvas — projection types (75 features)', () => {
  const geo = generateGeoFeatures(75, 20);

  bench('SVG — NaturalEarth1', () => {
    cleanup();
    render(GeoBench, {
      features: geo.features,
      fitGeojson: geo.collection,
      projection: geoNaturalEarth1,
      layer: 'svg',
    });
  });

  bench('Canvas — NaturalEarth1', () => {
    cleanup();
    render(GeoBench, {
      features: geo.features,
      fitGeojson: geo.collection,
      projection: geoNaturalEarth1,
      layer: 'canvas',
    });
  });

  bench('SVG — Mercator', () => {
    cleanup();
    render(GeoBench, {
      features: geo.features,
      fitGeojson: geo.collection,
      projection: geoMercator,
      layer: 'svg',
    });
  });

  bench('Canvas — Mercator', () => {
    cleanup();
    render(GeoBench, {
      features: geo.features,
      fitGeojson: geo.collection,
      projection: geoMercator,
      layer: 'canvas',
    });
  });

  bench('SVG — Orthographic', () => {
    cleanup();
    render(GeoBench, {
      features: geo.features,
      fitGeojson: geo.collection,
      projection: geoOrthographic,
      layer: 'svg',
    });
  });

  bench('Canvas — Orthographic', () => {
    cleanup();
    render(GeoBench, {
      features: geo.features,
      fitGeojson: geo.collection,
      projection: geoOrthographic,
      layer: 'canvas',
    });
  });
});
