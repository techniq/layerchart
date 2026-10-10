import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';

import TransformTestHarness from '$lib/tests/TransformTestHarness.svelte';
import { isometric } from '$lib/views/isometric.js';
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

  describe('pinch to zoom', () => {
    /** Render the harness and return the transform state along with pointer event helpers */
    async function setup(transform: Record<string, any>) {
      let chartContext: any;

      render(TransformTestHarness, {
        chartProps: { height: 300, transform },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());

      // TransformContext is lazy-loaded, so wait for it to render
      const element = await vi.waitFor(() => {
        const el = document.querySelector<HTMLElement>('.lc-transform-context');
        expect(el).not.toBeNull();
        return el!;
      });

      const rect = element.getBoundingClientRect();
      function dispatch(type: string, pointerId: number, x: number, y: number) {
        element.dispatchEvent(
          new PointerEvent(type, {
            pointerId,
            pointerType: 'touch',
            clientX: rect.left + x,
            clientY: rect.top + y,
            bubbles: true,
            cancelable: true,
          })
        );
      }

      return {
        get context() {
          return chartContext;
        },
        get transform() {
          return chartContext.transform;
        },
        dispatch,
      };
    }

    it('should scale by the change in distance between two pointers', async () => {
      const { transform, dispatch } = await setup({ mode: 'canvas' });

      expect(transform.scale).toBe(1);

      dispatch('pointerdown', 1, 100, 100);
      dispatch('pointerdown', 2, 200, 100);
      expect(transform.pinching).toBe(true);

      // Double the distance between pointers (100 -> 200)
      dispatch('pointermove', 2, 300, 100);
      expect(transform.scale).toBe(2);

      // Halve the distance from the gesture start (100 -> 50)
      dispatch('pointermove', 2, 150, 100);
      expect(transform.scale).toBe(0.5);

      dispatch('pointerup', 2, 150, 100);
      dispatch('pointerup', 1, 100, 100);
      expect(transform.pinching).toBe(false);
      expect(transform.dragging).toBe(false);
    });

    it('should keep the pinch midpoint anchored while zooming', async () => {
      const { context, transform, dispatch } = await setup({ mode: 'canvas' });
      const { padding } = context;

      dispatch('pointerdown', 1, 100, 200);
      dispatch('pointerdown', 2, 300, 200);
      // Midpoint (200, 200), distance 200
      dispatch('pointermove', 1, 50, 200);
      dispatch('pointermove', 2, 350, 200);
      // Midpoint (200, 200), distance 300

      expect(transform.scale).toBe(1.5);
      // The point under the midpoint should remain under the midpoint after scaling
      // (chart coordinates are relative to padding)
      expect(transform.translate.x).toBeCloseTo((200 - padding.left) * (1 - 1.5), 5);
      expect(transform.translate.y).toBeCloseTo((200 - padding.top) * (1 - 1.5), 5);
    });

    it('should pan when both pointers move together', async () => {
      const { transform, dispatch } = await setup({ mode: 'canvas' });

      dispatch('pointerdown', 1, 100, 100);
      dispatch('pointerdown', 2, 200, 100);

      dispatch('pointermove', 1, 130, 150);
      dispatch('pointermove', 2, 230, 150);

      expect(transform.scale).toBe(1);
      expect(transform.translate).toEqual({ x: 30, y: 50 });
    });

    it('should respect scaleExtent', async () => {
      const { transform, dispatch } = await setup({ mode: 'canvas', scaleExtent: [1, 2] });

      dispatch('pointerdown', 1, 100, 100);
      dispatch('pointerdown', 2, 200, 100);

      dispatch('pointermove', 2, 500, 100); // 4x
      expect(transform.scale).toBe(2);

      dispatch('pointermove', 2, 120, 100); // 0.2x
      expect(transform.scale).toBe(1);
    });

    it('should continue dragging with the remaining pointer without jumping', async () => {
      const { transform, dispatch } = await setup({ mode: 'canvas' });

      dispatch('pointerdown', 1, 100, 100);
      dispatch('pointerdown', 2, 200, 100);
      dispatch('pointermove', 2, 300, 100);

      const translateAfterPinch = { ...transform.translate };

      // Release the second pointer - the first should continue panning from its current position
      dispatch('pointerup', 2, 300, 100);
      expect(transform.pinching).toBe(false);

      dispatch('pointermove', 1, 140, 100);
      expect(transform.translate.x).toBeCloseTo(translateAfterPinch.x + 40, 5);
      expect(transform.scale).toBe(2);
    });

    it('should release cancelled pointers', async () => {
      const { transform, dispatch } = await setup({ mode: 'canvas' });

      dispatch('pointerdown', 1, 100, 100);
      dispatch('pointercancel', 1, 100, 100);
      expect(transform.moving).toBe(false);

      // Stale pointer should not be treated as part of a new gesture
      dispatch('pointerdown', 2, 100, 100);
      expect(transform.pinching).toBe(false);
    });

    it('should only use the horizontal distance in domain mode with `axis: x`', async () => {
      let chartContext: any;

      render(TransformTestHarness, {
        chartProps: {
          height: 300,
          data: [
            { date: 0, value: 1 },
            { date: 10, value: 2 },
          ],
          x: 'date',
          y: 'value',
          transform: { mode: 'domain' as const, axis: 'x' as const },
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());
      const element = await vi.waitFor(() => {
        const el = document.querySelector<HTMLElement>('.lc-transform-context');
        expect(el).not.toBeNull();
        return el!;
      });

      const rect = element.getBoundingClientRect();
      const dispatch = (type: string, pointerId: number, x: number, y: number) =>
        element.dispatchEvent(
          new PointerEvent(type, {
            pointerId,
            pointerType: 'touch',
            clientX: rect.left + x,
            clientY: rect.top + y,
            bubbles: true,
            cancelable: true,
          })
        );

      dispatch('pointerdown', 1, 100, 100);
      dispatch('pointerdown', 2, 200, 150);

      // Doubling the horizontal distance doubles the scale, regardless of vertical movement
      dispatch('pointermove', 2, 300, 250);

      expect(chartContext.transform.scale).toBe(2);
      expect(chartContext.transform.translate.y).toBe(0);
    });

    it('should not show the tooltip while pinching', async () => {
      let chartContext: any;

      render(TransformTestHarness, {
        chartProps: {
          height: 300,
          data: [
            { date: 0, value: 1 },
            { date: 10, value: 2 },
          ],
          x: 'date',
          y: 'value',
          transform: { mode: 'domain' as const, axis: 'x' as const },
          tooltipContext: { mode: 'bisect-x' as const },
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());
      const { transformEl, tooltipEl } = await vi.waitFor(() => {
        const transformEl = document.querySelector<HTMLElement>('.lc-transform-context');
        const tooltipEl = document.querySelector<HTMLElement>('.lc-tooltip-context');
        expect(transformEl).not.toBeNull();
        expect(tooltipEl).not.toBeNull();
        return { transformEl: transformEl!, tooltipEl: tooltipEl! };
      });

      const rect = transformEl.getBoundingClientRect();
      const dispatch = (el: HTMLElement, type: string, pointerId: number, x: number, y: number) =>
        el.dispatchEvent(
          new PointerEvent(type, {
            pointerId,
            pointerType: 'touch',
            clientX: rect.left + x,
            clientY: rect.top + y,
            bubbles: true,
            cancelable: true,
          })
        );

      // Sanity check - the tooltip shows on pointer move
      dispatch(tooltipEl, 'pointermove', 1, 100, 100);
      await vi.waitFor(() => expect(chartContext.tooltipState.data).not.toBeNull());

      // Start a pinch (events bubble from the tooltip area up to the transform context)
      dispatch(tooltipEl, 'pointerdown', 1, 100, 100);
      dispatch(tooltipEl, 'pointerdown', 2, 200, 100);
      expect(chartContext.transform.pinching).toBe(true);

      dispatch(tooltipEl, 'pointermove', 2, 300, 100);
      await vi.waitFor(() => expect(chartContext.tooltipState.data).toBeNull());
    });

    it('should not pinch when disabled', async () => {
      const { transform, dispatch } = await setup({ mode: 'canvas', pinch: false });

      dispatch('pointerdown', 1, 100, 100);
      dispatch('pointerdown', 2, 200, 100);
      dispatch('pointermove', 2, 300, 100);

      expect(transform.pinching).toBe(false);
      expect(transform.scale).toBe(1);
    });
  });

  describe('click after a drag', () => {
    /** Render the harness with a clickable child inside the transform context */
    async function setup(chartProps: Record<string, any>) {
      let chartContext: any;

      render(TransformTestHarness, {
        chartProps: { height: 300, ...chartProps },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext).toBeDefined());

      // TransformContext is lazy-loaded, so wait for it to render
      const element = await vi.waitFor(() => {
        const el = document.querySelector<HTMLElement>('.lc-transform-context');
        expect(el).not.toBeNull();
        return el!;
      });

      // Stands in for a mark (ex. a treemap node that zooms when clicked)
      const mark = document.createElement('div');
      element.append(mark);
      const onclick = vi.fn();
      mark.addEventListener('click', onclick);

      const rect = element.getBoundingClientRect();
      function dispatch(type: string, x: number, y: number, pointerId = 1) {
        mark.dispatchEvent(
          new PointerEvent(type, {
            pointerId,
            pointerType: 'mouse',
            clientX: rect.left + x,
            clientY: rect.top + y,
            bubbles: true,
            cancelable: true,
          })
        );
      }

      /** The `click` the browser fires after `pointerup` (`detail: 0` is a keyboard click) */
      function click(x: number, y: number, detail = 1) {
        mark.dispatchEvent(
          new MouseEvent('click', {
            clientX: rect.left + x,
            clientY: rect.top + y,
            detail,
            bubbles: true,
            cancelable: true,
          })
        );
      }

      /** Press, move, and release, followed by the browser's `click` */
      function drag(from: [number, number], to: [number, number]) {
        dispatch('pointerdown', ...from);
        dispatch('pointermove', ...to);
        dispatch('pointerup', ...to);
        click(...to);
      }

      return {
        get transform() {
          return chartContext.transform;
        },
        dispatch,
        click,
        drag,
        onclick,
      };
    }

    it('should not click what a pan is released over', async () => {
      const { transform, drag, onclick } = await setup({ transform: { mode: 'canvas' } });

      drag([100, 100], [150, 120]);

      expect(transform.translate).toEqual({ x: 50, y: 20 });
      expect(onclick).not.toHaveBeenCalled();
    });

    it('should not click what a rotate is released over', async () => {
      const { transform, drag, onclick } = await setup({
        view: isometric,
        transform: { mode: 'canvas', drag: 'rotate' },
      });
      await vi.waitFor(() => expect(transform.rotation).not.toBeNull());
      const before = { ...transform.rotation };

      drag([100, 100], [150, 100]);

      expect(transform.rotation.x).not.toBe(before.x);
      expect(onclick).not.toHaveBeenCalled();
    });

    it('should click when the pointer stays within `clickDistance`', async () => {
      const { drag, onclick } = await setup({ transform: { mode: 'canvas' } });

      drag([100, 100], [101, 101]);

      expect(onclick).toHaveBeenCalledOnce();
    });

    it('should click on the next press after a drag that ended without a click', async () => {
      const { dispatch, click, onclick } = await setup({ transform: { mode: 'canvas' } });

      // Released without the browser firing `click` (ex. over another element)
      dispatch('pointerdown', 100, 100);
      dispatch('pointermove', 150, 100);
      dispatch('pointerup', 150, 100);

      dispatch('pointerdown', 150, 100);
      dispatch('pointerup', 150, 100);
      click(150, 100);

      expect(onclick).toHaveBeenCalledOnce();
    });

    it('should only swallow the one click', async () => {
      const { drag, click, onclick } = await setup({ transform: { mode: 'canvas' } });

      drag([100, 100], [150, 100]);
      expect(onclick).not.toHaveBeenCalled();

      click(150, 100);
      expect(onclick).toHaveBeenCalledOnce();
    });

    it('should not swallow a keyboard click', async () => {
      const { dispatch, click, onclick } = await setup({ transform: { mode: 'canvas' } });

      dispatch('pointerdown', 100, 100);
      dispatch('pointermove', 150, 100);
      dispatch('pointerup', 150, 100);
      click(150, 100, 0);

      expect(onclick).toHaveBeenCalledOnce();
    });

    it('should not click what a pinch is released over', async () => {
      const { transform, dispatch, click, onclick } = await setup({
        transform: { mode: 'canvas' },
      });

      dispatch('pointerdown', 100, 100, 1);
      dispatch('pointerdown', 200, 100, 2);
      dispatch('pointermove', 300, 100, 2);
      dispatch('pointerup', 300, 100, 2);
      dispatch('pointerup', 100, 100, 1);
      click(100, 100);

      expect(transform.scale).toBe(2);
      expect(onclick).not.toHaveBeenCalled();
    });
  });
});
