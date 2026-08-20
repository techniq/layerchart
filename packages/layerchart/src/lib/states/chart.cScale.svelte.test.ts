import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '../components/tests/TestHarness.svelte';
import Circle from '../components/Circle/Circle.svelte';
import Density from '../components/Density/Density.svelte';
import Contour from '../components/Contour/Contour.svelte';
import { isScaleOrdinal } from '../utils/scales.svelte.js';
import type { ChartState } from './chart.svelte.js';

/**
 * `cScale` is the configured `cScale` / `cRange` when there is one, else an ordinal lookup of the
 * colors declared on `series`. Marks resolving a categorical color use it directly; marks building
 * a continuous ramp skip it when it's ordinal.
 */

const data = [
  { group: 'a', x: 1, y: 10 },
  { group: 'b', x: 2, y: 20 },
  { group: 'a', x: 3, y: 30 },
  { group: 'b', x: 4, y: 40 },
];

const series = [
  { key: 'a', color: 'rgb(255, 0, 0)' },
  { key: 'b', color: 'rgb(0, 0, 255)' },
];

const chartProps = (extra: Record<string, any> = {}) => ({
  data,
  x: 'x',
  y: 'y',
  xDomain: [0, 5],
  yDomain: [0, 50],
  ...extra,
});

function renderChart(chartExtra: Record<string, any>, componentProps: Record<string, any> = {}) {
  let ctx: ChartState<any, any, any> = null!;
  render(TestHarness, {
    component: Circle,
    chartProps: chartProps(chartExtra),
    componentProps: { cx: 'x', cy: 'y', r: 3, ...componentProps },
    oncontext: (c: any) => (ctx = c),
  });
  return () => ctx;
}

describe('ChartState.cScale', () => {
  describe('series color fallback', () => {
    it('is null when nothing configures it and no series have colors', async () => {
      const ctx = renderChart({});
      await expect.poll(() => ctx()?.width).toBeGreaterThan(0);
      expect(ctx().cScale).toBe(null);
      expect(ctx().cScale).toBe(null);
    });

    it('is built from `series` colors when they exist', async () => {
      const ctx = renderChart({ series });
      await expect.poll(() => ctx()?.width).toBeGreaterThan(0);
      expect(ctx().cScale?.('a')).toBe('rgb(255, 0, 0)');
      expect(ctx().cScale?.('b')).toBe('rgb(0, 0, 255)');
      // it is the series' own scale, handed straight through
      expect(ctx().cScale).toBe(ctx().series.cScale);
    });

    it('leaves values outside the series keys unresolved rather than recycling the palette', async () => {
      const ctx = renderChart({ series });
      await expect.poll(() => ctx()?.width).toBeGreaterThan(0);
      expect(ctx().cScale?.('not-a-series')).toBe(undefined);
      // and the domain isn't extended by the miss, so known keys keep their colors
      expect(ctx().cScale?.('a')).toBe('rgb(255, 0, 0)');
    });

    it('ignores series that declare no color', async () => {
      const ctx = renderChart({ series: [{ key: 'a' }, { key: 'b' }] });
      await expect.poll(() => ctx()?.width).toBeGreaterThan(0);
      expect(ctx().cScale).toBe(null);
    });

    it('ignores the implicit default series', async () => {
      // `Legend` picks series swatches over a scale legend on exactly this condition
      // (`hasSeriesWithColors`), so keeping the fallback narrower than it leaves `Legend` alone
      const ctx = renderChart({ series: [{ key: 'default', color: 'rgb(255, 0, 0)' }] });
      await expect.poll(() => ctx()?.width).toBeGreaterThan(0);
      expect(ctx().series.isDefaultSeries).toBe(true);
      expect(ctx().cScale).toBe(null);
    });
  });

  describe('an explicit scale still wins', () => {
    it('`cRange` takes precedence over series colors', async () => {
      const ctx = renderChart({
        series,
        c: 'group',
        cRange: ['rgb(0, 255, 0)', 'rgb(255, 255, 0)'],
      });
      await expect.poll(() => ctx()?.width).toBeGreaterThan(0);
      expect(ctx().cScale?.('a')).toBe('rgb(0, 255, 0)');
      // the configured scale, not the series fallback
      expect(ctx().cScale).not.toBe(ctx().series.cScale);
    });
  });

  describe('marks', () => {
    it('resolve a data-property color through the fallback', async () => {
      renderChart({ series }, { fill: 'group' });
      await expect.poll(() => document.querySelectorAll('circle').length).toBe(4);
      const fills = Array.from(document.querySelectorAll('circle')).map((c) =>
        c.getAttribute('fill')
      );
      expect(fills).toEqual([
        'rgb(255, 0, 0)',
        'rgb(0, 0, 255)',
        'rgb(255, 0, 0)',
        'rgb(0, 0, 255)',
      ]);
    });

    it('keep a CSS color literal untouched', async () => {
      renderChart({ series }, { fill: 'var(--color-danger)' });
      await expect.poll(() => document.querySelectorAll('circle').length).toBe(4);
      expect(document.querySelector('circle')?.getAttribute('fill')).toBe('var(--color-danger)');
    });
  });

  describe('continuous marks are unaffected', () => {
    // These copy `cScale` and re-domain it as a ramp, which an ordinal scale can't satisfy —
    // `isScaleOrdinal` is what keeps them off the series fallback.
    it('Density falls back to its own sequential scale despite series colors', async () => {
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Density,
        chartProps: chartProps({ series }),
        componentProps: {},
        oncontext: (c: any) => (ctx = c),
      });
      await expect.poll(() => ctx?.width).toBeGreaterThan(0);
      // `cScale` here *is* the ordinal series lookup, so Density must decline it and ramp its own
      expect(ctx.cScale).not.toBe(null);
      expect(isScaleOrdinal(ctx.cScale!)).toBe(true);

      const fills = Array.from(document.querySelectorAll('svg path')).map((p) =>
        p.getAttribute('fill')
      );
      // the YlGnBu ramp, not one of the two series colors
      expect(fills.some((f) => f === 'rgb(255, 0, 0)' || f === 'rgb(0, 0, 255)')).toBe(false);
    });

    it('Contour falls back to its own sequential scale despite series colors', async () => {
      let ctx: ChartState<any, any, any> = null!;
      render(TestHarness, {
        component: Contour,
        chartProps: chartProps({ series }),
        componentProps: {},
        oncontext: (c: any) => (ctx = c),
      });
      await expect.poll(() => ctx?.width).toBeGreaterThan(0);

      const fills = Array.from(document.querySelectorAll('svg path')).map((p) =>
        p.getAttribute('fill')
      );
      expect(fills.some((f) => f === 'rgb(255, 0, 0)' || f === 'rgb(0, 0, 255)')).toBe(false);
    });
  });
});
