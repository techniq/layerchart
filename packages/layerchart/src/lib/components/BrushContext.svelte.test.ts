import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';

import Chart from "./Chart/Chart.svelte";
import BrushTestHarness from './tests/BrushTestHarness.svelte';

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
  { x: 2, y: 30 },
  { x: 3, y: 40 },
  { x: 4, y: 50 },
  { x: 5, y: 60 },
  { x: 6, y: 70 },
  { x: 7, y: 80 },
  { x: 8, y: 90 },
  { x: 9, y: 100 },
];

const defaultChartProps = {
  data,
  x: 'x',
  y: 'y',
  xDomain: [0, 10] as [number, number],
  yDomain: [0, 100] as [number, number],
  height: 200,
};

function getBrushElements(container: HTMLElement) {
  return {
    context: container.querySelector('.lc-brush-context') as HTMLElement | null,
    range: container.querySelector('.lc-brush-range') as HTMLElement | null,
    handles: container.querySelectorAll('.lc-brush-handle'),
  };
}

// BrushContext is lazy-loaded inside Chart, so tests that enable brush must
// wait for the dynamic import to resolve before querying brush DOM.
async function awaitBrushReady(container: HTMLElement) {
  await vi.waitFor(() => {
    expect(container.querySelector('.lc-brush-context')).not.toBeNull();
  });
}

describe('BrushContext', () => {
  describe('rendering', () => {
    it('should not render brush UI when brush is disabled', async () => {
      const { container } = render(Chart, {
        ...defaultChartProps,
        brush: false,
      });

      await tick();

      const { context } = getBrushElements(container);
      expect(context).toBeNull();
    });

    it('should render brush context when brush is enabled', async () => {
      const { container } = render(Chart, {
        ...defaultChartProps,
        brush: true,
      });

      await awaitBrushReady(container);

      const { context } = getBrushElements(container);
      expect(context).not.toBeNull();
    });

    it('should not render range or handles initially', async () => {
      const { container } = render(Chart, {
        ...defaultChartProps,
        brush: true,
      });

      await awaitBrushReady(container);

      const { range, handles } = getBrushElements(container);
      expect(range).toBeNull();
      expect(handles.length).toBe(0);
    });
  });

  describe('programmatic control', () => {
    it('should show brush when moved programmatically via context', async () => {
      let chartContext: any;

      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          brush: true,
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext?.brush).not.toBeNull());

      let { range } = getBrushElements(container);
      expect(range).toBeNull();

      chartContext.brush.move({ x: [2, 8] });
      await tick();

      ({ range } = getBrushElements(container));
      expect(range).not.toBeNull();
      expect(range!.style.width).not.toBe('0px');
    });

    it('should compute correct pixel width for brush.move()', async () => {
      let chartContext: any;

      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          brush: true,
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext?.brush).not.toBeNull());

      chartContext.brush.move({ x: [2, 5] });
      await tick();

      const { range } = getBrushElements(container);
      expect(range).not.toBeNull();

      const brushContext = container.querySelector('.lc-brush-context') as HTMLElement;
      const contextWidth = brushContext.getBoundingClientRect().width;

      // 3 units out of 10 total → 30% of width
      const expectedWidth = (3 / 10) * contextWidth;
      const actualWidth = parseFloat(range!.style.width);
      expect(Math.abs(actualWidth - expectedWidth)).toBeLessThan(1);
    });

    it('should update width when brush.move() is called again', async () => {
      let chartContext: any;

      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          brush: true,
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext?.brush).not.toBeNull());

      chartContext.brush.move({ x: [2, 5] });
      await tick();

      let { range } = getBrushElements(container);
      const firstWidth = parseFloat(range!.style.width);

      chartContext.brush.move({ x: [2, 8] });
      await tick();

      ({ range } = getBrushElements(container));
      const secondWidth = parseFloat(range!.style.width);

      expect(secondWidth).toBeGreaterThan(firstWidth);
    });

    it('should clear brush when reset programmatically', async () => {
      let chartContext: any;

      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          brush: true,
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext?.brush).not.toBeNull());

      chartContext.brush.move({ x: [2, 8] });
      await tick();

      let { range } = getBrushElements(container);
      expect(range).not.toBeNull();

      chartContext.brush.reset();
      await tick();

      ({ range } = getBrushElements(container));
      expect(range).toBeNull();
    });

    it('should select full domain with selectAll', async () => {
      let chartContext: any;

      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          brush: true,
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext?.brush).not.toBeNull());

      chartContext.brush.selectAll();
      await tick();

      const { range } = getBrushElements(container);
      expect(range).not.toBeNull();

      const brushContext = container.querySelector('.lc-brush-context') as HTMLElement;
      const contextWidth = brushContext.getBoundingClientRect().width;
      const rangeWidth = parseFloat(range!.style.width);

      expect(Math.abs(rangeWidth - contextWidth)).toBeLessThan(1);
    });

    it('should move only y when x is not specified', async () => {
      let chartContext: any;

      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          brush: { axis: 'both' as const },
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext?.brush).not.toBeNull());

      chartContext.brush.move({ y: [20, 80] });
      await tick();

      const { range } = getBrushElements(container);
      expect(range).not.toBeNull();
      expect(chartContext.brush.x).toEqual([null, null]);
      expect(chartContext.brush.y).toEqual([20, 80]);
    });
  });

  describe('zoomOnBrush with onBrushEnd', () => {
    it('should pass brush domain values to onBrushEnd before resetting', async () => {
      let chartContext: any;
      let receivedX: any = null;

      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          brush: {
            zoomOnBrush: true,
            onBrushEnd: (e: any) => {
              receivedX = [...e.brush.x];
            },
          },
        },
        oncontext: (ctx: any) => {
          chartContext = ctx;
        },
      });

      await vi.waitFor(() => expect(chartContext?.brush).not.toBeNull());

      const brushEl = container.querySelector('.lc-brush-context') as HTMLElement;
      const rect = brushEl.getBoundingClientRect();

      // Simulate a brush drag: pointerdown → pointermove → pointerup
      // All dispatched on the brush element so e.target has classList/getBoundingClientRect.
      const startX = rect.left + rect.width * 0.2;
      const endX = rect.left + rect.width * 0.8;
      const y = rect.top + rect.height / 2;

      brushEl.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: startX, clientY: y, bubbles: true })
      );
      brushEl.dispatchEvent(
        new PointerEvent('pointermove', { clientX: endX, clientY: y, bubbles: true })
      );
      brushEl.dispatchEvent(
        new PointerEvent('pointerup', { clientX: endX, clientY: y, bubbles: true })
      );
      await tick();

      // The user's onBrushEnd callback should have received domain values before reset
      expect(receivedX).not.toBeNull();
      expect(receivedX[0]).not.toBeNull();
      expect(receivedX[1]).not.toBeNull();
      expect(receivedX[0]).toBeLessThan(receivedX[1]);

      // After the enhanced handler runs, brush should be reset
      expect(chartContext.brush.x).toEqual([null, null]);
    });
  });

  describe('external sync (x/y props)', () => {
    it('should show brush when x prop is provided with a sub-domain', async () => {
      const { container } = render(Chart, {
        ...defaultChartProps,
        brush: {
          x: [3, 7],
        },
      });

      await awaitBrushReady(container);

      const { range } = getBrushElements(container);
      expect(range).not.toBeNull();
    });

    it('should not show brush when x prop matches full domain', async () => {
      const { container } = render(Chart, {
        ...defaultChartProps,
        brush: {
          x: [0, 10],
        },
      });

      await awaitBrushReady(container);

      const { range } = getBrushElements(container);
      expect(range).toBeNull();
    });

    it('should not show brush when x prop is null', async () => {
      const { container } = render(Chart, {
        ...defaultChartProps,
        brush: {
          x: null as any,
        },
      });

      await awaitBrushReady(container);

      const { range } = getBrushElements(container);
      expect(range).toBeNull();
    });

    it('should update brush width when x prop changes', async () => {
      const props = $state({
        ...defaultChartProps,
        brush: {
          x: [2, 5] as any,
        },
      });

      const { container } = render(Chart, props);

      await awaitBrushReady(container);

      let { range } = getBrushElements(container);
      expect(range).not.toBeNull();
      const initialWidth = parseFloat(range!.style.width);

      props.brush = { x: [1, 8] };
      await tick();

      ({ range } = getBrushElements(container));
      expect(range).not.toBeNull();
      const updatedWidth = parseFloat(range!.style.width);

      expect(updatedWidth).toBeGreaterThan(initialWidth);
    });

    it('should clear brush when x prop changes to [null, null]', async () => {
      const props = $state({
        ...defaultChartProps,
        brush: {
          x: [2, 5] as any,
        },
      });

      const { container } = render(Chart, props);

      await awaitBrushReady(container);

      let { range } = getBrushElements(container);
      expect(range).not.toBeNull();

      props.brush = { x: [null, null] };
      await tick();

      ({ range } = getBrushElements(container));
      expect(range).toBeNull();
    });
  });
});
