import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';

import TransformTestHarness from './tests/TransformTestHarness.svelte';
import { geoMercator, geoOrthographic } from 'd3-geo';

describe('TransformContext', () => {
  describe('reactive prop syncing', () => {
    it('should sync processTranslate when projection changes from flat to globe', async () => {
      let chartContext: any;

      const chartProps = $state({
        height: 300,
        geo: {
          projection: geoMercator,
          fitGeojson: { type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject,
        },
        transform: {
          mode: 'projection' as const,
        },
      });

      render(TransformTestHarness, {
        chartProps,
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());

      // Mercator is a flat projection — processTranslate should be undefined
      expect(chartContext.transform.processTranslate).toBeUndefined();

      // Switch to orthographic (globe)
      chartProps.geo = {
        projection: geoOrthographic,
        fitGeojson: { type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject,
      };
      await tick();

      // Orthographic is a globe — processTranslate should now be a function
      await vi.waitFor(() => {
        expect(chartContext.transform.processTranslate).toBeTypeOf('function');
      });
    });

    it('should sync processTranslate when projection changes from globe to flat', async () => {
      let chartContext: any;

      const chartProps = $state({
        height: 300,
        geo: {
          projection: geoOrthographic,
          fitGeojson: { type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject,
        },
        transform: {
          mode: 'projection' as const,
        },
      });

      render(TransformTestHarness, {
        chartProps,
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());

      // Orthographic is a globe — processTranslate should be a function
      // (TransformContext is lazy-loaded, so wait for it to resolve)
      await vi.waitFor(() => {
        expect(chartContext.transform.processTranslate).toBeTypeOf('function');
      });

      // Switch to Mercator (flat)
      chartProps.geo = {
        projection: geoMercator,
        fitGeojson: { type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject,
      };
      await tick();

      // Mercator is flat — processTranslate should be undefined
      await vi.waitFor(() => {
        expect(chartContext.transform.processTranslate).toBeUndefined();
      });
    });

    it('should enable scale for globe projections so scroll zoom works', async () => {
      let chartContext: any;

      render(TransformTestHarness, {
        chartProps: {
          height: 300,
          geo: {
            projection: geoOrthographic,
            fitGeojson: { type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject,
          },
          transform: {
            mode: 'projection' as const,
            scrollMode: 'scale' as const,
          },
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());

      // TransformContext is lazy-loaded, so wait for fitSize to apply
      await vi.waitFor(() => expect(chartContext.transform.scale).toBeGreaterThan(1));
      const initialScale = chartContext.transform.scale;

      // Simulate zoom in
      chartContext.transform.setScale(initialScale * 2, { instant: true });
      await tick();

      await vi.waitFor(() => {
        expect(chartContext.transform.scale).toBeCloseTo(initialScale * 2, 0);
      });

      // Verify the projection scale also updated (transformApply.scale = true for globes)
      expect(chartContext.geo.projection?.scale()).toBeCloseTo(initialScale * 2, 0);
    });

    it('should interpret scaleExtent as relative multipliers in projection mode', async () => {
      let chartContext: any;

      render(TransformTestHarness, {
        chartProps: {
          height: 300,
          geo: {
            projection: geoMercator,
            fitGeojson: { type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject,
          },
          transform: {
            mode: 'projection' as const,
            scrollMode: 'scale' as const,
            scaleExtent: [0.5, 2] as [number, number],
          },
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());

      // TransformContext is lazy-loaded, so wait for fitSize to apply
      await vi.waitFor(() => expect(chartContext.transform.scale).toBeGreaterThan(10));
      const initialScale = chartContext.transform.scale;

      // Try to zoom way beyond 2x — should be clamped to 2x initial
      chartContext.transform.setScale(initialScale * 5, { instant: true });
      await tick();

      await vi.waitFor(() => {
        // Should be clamped to ~2x the initial scale
        expect(chartContext.transform.scale).toBeCloseTo(initialScale * 2, 0);
      });

      // Try to zoom below 0.5x — should be clamped to 0.5x initial
      chartContext.transform.setScale(initialScale * 0.1, { instant: true });
      await tick();

      await vi.waitFor(() => {
        expect(chartContext.transform.scale).toBeCloseTo(initialScale * 0.5, 0);
      });
    });

    it('should sync disablePointer reactively', async () => {
      let chartContext: any;

      const chartProps = $state({
        height: 300,
        transform: {
          mode: 'canvas' as const,
          disablePointer: false,
        },
      });

      render(TransformTestHarness, {
        chartProps,
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());

      // TransformContext is lazy-loaded, so wait for it to resolve
      await vi.waitFor(() => {
        expect(chartContext.transform.disablePointer).toBe(false);
      });

      // Enable disablePointer
      chartProps.transform = {
        mode: 'canvas' as const,
        disablePointer: true,
      };
      await tick();

      await vi.waitFor(() => {
        expect(chartContext.transform.disablePointer).toBe(true);
      });
    });
  });
});
