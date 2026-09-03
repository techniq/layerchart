import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';

import Chart from './Chart/Chart.svelte';
import BrushTestHarness from '$lib/tests/BrushTestHarness.svelte';
import BrushContextAccessHarness from '$lib/tests/BrushContextAccessHarness.svelte';

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

    it('should not throw when children read context.brush before it lazy-loads', async () => {
      // `BrushContext` is lazy-loaded, so a `children` snippet reading
      // `context.brush.active` runs before the brush state is bound. `context.brush`
      // must fall back to a safe object rather than null (regression: previously
      // threw "Cannot read properties of null (reading 'active')").
      const { container } = render(BrushContextAccessHarness, {
        chartProps: defaultChartProps,
      });

      // Rendered synchronously without throwing, before the brush DOM exists.
      expect(getBrushElements(container).context).toBeNull();

      // Still safe once the lazy-loaded BrushContext mounts.
      await awaitBrushReady(container);
      expect(getBrushElements(container).context).not.toBeNull();
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

      await awaitBrushReady(container);

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

      await awaitBrushReady(container);

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

      await awaitBrushReady(container);

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

      await awaitBrushReady(container);

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

      await awaitBrushReady(container);

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

      await awaitBrushReady(container);

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

      await awaitBrushReady(container);

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

  describe('adjusting an existing selection', () => {
    /** Drag from one client x to another, on whichever element is under the first point */
    function dragFrom(el: Element, fromX: number, toX: number, y: number) {
      for (const [type, clientX] of [
        ['pointerdown', fromX],
        ['pointermove', toX],
        ['pointerup', toX],
      ] as const) {
        el.dispatchEvent(new PointerEvent(type, { clientX, clientY: y, bubbles: true }));
      }
    }

    async function renderWithSelection() {
      let ctx: any;
      const { container } = render(BrushTestHarness, {
        chartProps: { ...defaultChartProps, brush: true },
        oncontext: (c: any) => (ctx = c),
      });
      await awaitBrushReady(container);

      const brushEl = container.querySelector('.lc-brush-context') as HTMLElement;
      const rect = brushEl.getBoundingClientRect();
      const y = rect.top + rect.height / 2;
      dragFrom(brushEl, rect.left + rect.width * 0.3, rect.left + rect.width * 0.6, y);
      await tick();

      return { container, ctx: () => ctx, rect, y };
    }

    it('moves the selection rather than starting a new one', async () => {
      const { container, ctx, rect, y } = await renderWithSelection();
      const before = [...ctx().brush.x];
      const range = ctx().brush.range;

      // grab the middle of the selection and drag right
      const selection = container.querySelector('.lc-brush-range') as HTMLElement;
      const middle = rect.left + range.x + range.width / 2;
      dragFrom(selection, middle, middle + 60, y);
      await tick();

      const after = [...ctx().brush.x];
      // shifted, keeping its width — a new selection would have started at the grab point
      expect(after[0]).toBeGreaterThan(before[0] as number);
      expect((after[1] as number) - (after[0] as number)).toBeCloseTo(
        (before[1] as number) - (before[0] as number),
        6
      );
    });

    it('resizes from a handle, anchored to the opposite edge', async () => {
      const { container, ctx, rect, y } = await renderWithSelection();
      const before = [...ctx().brush.x];

      // the handles are only a few pixels wide, so they measure against the root rather than
      // against themselves
      const right = container.querySelector('[data-position="right"]') as HTMLElement;
      const handle = right.getBoundingClientRect();
      dragFrom(right, handle.left + handle.width / 2, handle.left + handle.width / 2 + 60, y);
      await tick();

      const after = [...ctx().brush.x];
      expect(after[0]).toBe(before[0]);
      expect(after[1]).toBeGreaterThan(before[1] as number);
    });

    it('clears on double-clicking the selection', async () => {
      const { container, ctx, rect, y } = await renderWithSelection();
      expect(ctx().brush.active).toBe(true);

      // The root takes a double-click as "select all", so the selection's own handler has to stop
      // the event — otherwise the clear is immediately undone
      const selection = container.querySelector('.lc-brush-range') as HTMLElement;
      const range = ctx().brush.range;
      selection.dispatchEvent(
        new MouseEvent('dblclick', {
          clientX: rect.left + range.x + range.width / 2,
          clientY: y,
          bubbles: true,
        })
      );
      await tick();

      expect(ctx().brush.active).toBeFalsy();
    });

    it('reports the cleared selection to `onChange`, as double-clicking does', async () => {
      const onChange = vi.fn();
      let ctx: any;
      const { container } = render(BrushTestHarness, {
        chartProps: { ...defaultChartProps, brush: { onChange } },
        oncontext: (c: any) => (ctx = c),
      });
      await awaitBrushReady(container);

      const brushEl = container.querySelector('.lc-brush-context') as HTMLElement;
      const rect = brushEl.getBoundingClientRect();
      const y = rect.top + rect.height / 2;
      dragFrom(brushEl, rect.left + rect.width * 0.3, rect.left + rect.width * 0.6, y);
      await tick();
      expect(ctx.brush.active).toBe(true);
      onChange.mockClear();

      // A click produces no `pointermove`, so nothing else would report the selection emptying
      const x = rect.left + rect.width * 0.05;
      for (const type of ['pointerdown', 'pointerup'] as const) {
        brushEl.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true }));
      }
      await tick();

      expect(ctx.brush.active).toBeFalsy();
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.at(-1)?.[0].brush.active).toBeFalsy();
    });

    it('clears on clicking the region without dragging', async () => {
      const { container, ctx, rect, y } = await renderWithSelection();
      expect(ctx().brush.active).toBe(true);

      // No `pointermove` at all — the selection is unchanged, so a size check would miss this
      const brushEl = container.querySelector('.lc-brush-context') as HTMLElement;
      const x = rect.left + rect.width * 0.05;
      for (const type of ['pointerdown', 'pointerup'] as const) {
        brushEl.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true }));
      }
      await tick();

      expect(ctx().brush.active).toBeFalsy();
    });
  });

  describe('facets', () => {
    const facetData = [
      { g: 'a', x: 0, y: 10 },
      { g: 'a', x: 9, y: 100 },
      { g: 'b', x: 0, y: 10 },
      { g: 'b', x: 9, y: 100 },
    ];

    /** Drag across the middle of a panel, from 20% to 80% of its width */
    function dragPanel(
      container: HTMLElement,
      panel: { x: number; y: number; width: number; height: number }
    ) {
      // prettier-ignore
      const brushEl = container.querySelector('.lc-brush-context') as HTMLElement;
      const rect = brushEl.getBoundingClientRect();
      const startX = rect.left + panel.x + panel.width * 0.2;
      const endX = rect.left + panel.x + panel.width * 0.8;
      const y = rect.top + panel.y + panel.height / 2;

      for (const [type, clientX] of [
        ['pointerdown', startX],
        ['pointermove', endX],
        ['pointerup', endX],
      ] as const) {
        brushEl.dispatchEvent(new PointerEvent(type, { clientX, clientY: y, bubbles: true }));
      }
    }

    async function renderFaceted() {
      let ctx: any;
      const { container } = render(BrushTestHarness, {
        chartProps: {
          ...defaultChartProps,
          data: facetData,
          fx: 'g',
          width: 400,
          padding: 0,
          brush: true,
        },
        oncontext: (c: any) => (ctx = c),
      });
      await awaitBrushReady(container);
      return { container, ctx: () => ctx };
    }

    it('brushes the panel it started in, giving the same domain from either panel', async () => {
      const { container, ctx } = await renderFaceted();
      expect(ctx().facet.panels.length).toBe(2);

      dragPanel(container, ctx().facet.panels[0]);
      await tick();
      const first = [...ctx().brush.x];

      dragPanel(container, ctx().facet.panels[1]);
      await tick();
      const second = [...ctx().brush.x];

      // 20%-80% of a panel is the same slice of the shared domain wherever it's dragged
      expect(first[0]).toBeCloseTo(second[0] as number, 5);
      expect(first[1]).toBeCloseTo(second[1] as number, 5);
      expect(first[0]).toBeGreaterThan(0);
      expect(first[1]).toBeLessThan(10);
    });

    it('draws the selection in every panel', async () => {
      const { container, ctx } = await renderFaceted();

      dragPanel(container, ctx().facet.panels[1]);
      await tick();

      expect(container.querySelectorAll('.lc-brush-range').length).toBe(2);
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
