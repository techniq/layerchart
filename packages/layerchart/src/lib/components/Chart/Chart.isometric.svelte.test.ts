import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TooltipTestHarness from '$lib/tests/TooltipTestHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { applyMatrix, invertMatrix } from '$lib/utils/isometric.js';

// Sorted by `x` for `bisect-x`, and inside the domain so none sits on the floor's edge
const data = [
  { x: 1, y: 1 },
  { x: 3, y: 8 },
  { x: 7, y: 9 },
  { x: 9, y: 2 },
];

/** Render an isometric chart and resolve once its context (and scales) are ready */
async function renderChart(chartProps: Record<string, any> = {}) {
  let ctx: ChartState<any, any, any> = null!;

  render(TooltipTestHarness, {
    chartProps: {
      data,
      x: 'x',
      y: 'y',
      xDomain: [0, 10],
      yDomain: [0, 10],
      width: 400,
      height: 300,
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
      isometric: true,
      ...chartProps,
    },
    oncontext: (c: any) => (ctx = c),
  });

  await vi.waitFor(() => {
    expect(ctx?.width).toBeGreaterThan(0);
  });

  return ctx;
}

/** Container-relative position a data point is drawn at, through the isometric view */
function screenPoint(ctx: ChartState<any, any, any>, d: (typeof data)[number]) {
  const { x, y } = applyMatrix(ctx.isometricMatrix!, { x: ctx.xScale(d.x), y: ctx.yScale(d.y) });
  return { x: x + ctx.padding.left, y: y + ctx.padding.top };
}

/** A pointer event positioned at container-relative `{ x, y }`, targeting the chart root */
function pointerEventAt(ctx: ChartState<any, any, any>, x: number, y: number) {
  const rect = ctx.containerRef!.getBoundingClientRect();
  const e = new PointerEvent('pointermove', {
    bubbles: true,
    clientX: rect.x + x,
    clientY: rect.y + y,
  });
  // `showTooltip` reads `e.target.closest('.lc-root-container')`, which an undispatched event
  // does not have
  Object.defineProperty(e, 'target', { value: ctx.containerRef });
  return e;
}

describe('Chart isometric', () => {
  it('draws the layers through the isometric matrix', async () => {
    const ctx = await renderChart();

    const g = ctx.containerRef!.querySelector('.lc-layout-svg-g-transform');
    expect(g?.getAttribute('transform')).toMatch(/^matrix\(/);
  });

  it('leaves room above the floor for a `zRange`, with or without a `z`', async () => {
    const flat = await renderChart();
    expect(flat.zDepth).toBe(0);
    const tall = await renderChart({ zRange: [0, 200] });
    expect(tall.zDepth).toBe(200);
    // The floor shrinks to make room
    expect(tall.width).toBeLessThan(flat.width);
  });

  it('leaves the chart flat without it', async () => {
    const ctx = await renderChart({ isometric: false });

    expect(ctx.isometricMatrix).toBeNull();
    const g = ctx.containerRef!.querySelector('.lc-layout-svg-g-transform');
    expect(g?.getAttribute('transform')).toBeNull();
  });

  it.each(['quadtree', 'bisect-x'] as const)(
    'resolves the point under the pointer in `%s` mode',
    async (mode) => {
      const ctx = await renderChart({ tooltipContext: { mode } });

      for (const d of data) {
        const { x, y } = screenPoint(ctx, d);
        // The quadtree is built once `d3-quadtree` has loaded
        await vi.waitFor(() => {
          ctx.tooltip.show(pointerEventAt(ctx, x, y));
          expect(ctx.tooltip.data).toEqual(d);
        });
      }
    }
  );

  it('resolves the point nearest on screen in `quadtree` mode, not nearest on the floor', async () => {
    // A grid dense enough that foreshortening changes which neighbour is nearest
    const grid = Array.from({ length: 81 }, (_, i) => ({
      x: 1 + (i % 9),
      y: 1 + Math.floor(i / 9),
    }));
    const ctx = await renderChart({ data: grid, tooltipContext: { mode: 'quadtree' } });
    const drawn = grid.map((d) => ({ d, ...screenPoint(ctx, d) }));

    await vi.waitFor(() => {
      const { x, y } = drawn[40];
      ctx.tooltip.show(pointerEventAt(ctx, x, y));
      expect(ctx.tooltip.data).toEqual(grid[40]);
    });

    const box = ctx.containerRef!.getBoundingClientRect();
    const inverse = invertMatrix(ctx.isometricMatrix!)!;
    let checked = 0;
    let disagreements = 0;
    for (let px = 60; px < box.width - 60; px += 17) {
      for (let py = 60; py < box.height - 60; py += 13) {
        // Off the floor the tooltip hides (after a delay), leaving the last point showing meanwhile
        const flat = applyMatrix(inverse, { x: px - ctx.padding.left, y: py - ctx.padding.top });
        if (flat.x < 0 || flat.x > ctx.width || flat.y < 0 || flat.y > ctx.height) continue;

        ctx.tooltip.show(pointerEventAt(ctx, px, py));

        const nearest = drawn.reduce((a, b) =>
          Math.hypot(a.x - px, a.y - py) <= Math.hypot(b.x - px, b.y - py) ? a : b
        );
        checked++;
        const shown = drawn.find((p) => p.d === ctx.tooltip.data)!;
        // Ties (equidistant neighbours) may resolve either way
        if (
          Math.abs(
            Math.hypot(shown.x - px, shown.y - py) - Math.hypot(nearest.x - px, nearest.y - py)
          ) > 0.5
        ) {
          disagreements++;
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
    expect(disagreements).toBe(0);
  });

  it('ignores a pointer off the floor', async () => {
    const ctx = await renderChart({ tooltipContext: { mode: 'quadtree', radius: Infinity } });

    // Once the quadtree has loaded, a point on the floor resolves...
    const { x, y } = screenPoint(ctx, data[0]);
    await vi.waitFor(() => {
      ctx.tooltip.show(pointerEventAt(ctx, x, y));
      expect(ctx.tooltip.data).toEqual(data[0]);
    });

    // ...but the plot area's top-left corner is inside the box but outside the diamond drawn in it
    ctx.tooltip.show(pointerEventAt(ctx, ctx.padding.left + 1, ctx.padding.top + 1));
    await vi.waitFor(() => expect(ctx.tooltip.data).toBeNull());
  });

  it('positions a tooltip shown by value where the point is drawn', async () => {
    const ctx = await renderChart({ tooltipContext: { mode: 'bisect-x' } });

    ctx.tooltip.show({ data: data[3] });

    const expected = screenPoint(ctx, data[3]);
    expect(ctx.tooltip.x).toBeCloseTo(expected.x, 5);
    expect(ctx.tooltip.y).toBeCloseTo(expected.y, 5);
  });
});

describe('Chart isometric with a transform', () => {
  /** The view a layer draws at, read back from its matrix */
  function angles(ctx: ChartState<any, any, any>) {
    const m = ctx.layerMatrix()!;
    return {
      rotate: Math.round((Math.atan2(-m.c, m.a) * 180) / Math.PI),
      tilt: Math.round((Math.acos(Math.hypot(m.b, m.d) / Math.hypot(m.a, m.c)) * 180) / Math.PI),
    };
  }

  /** Drag across the chart by `(dx, dy)`, holding `shift` or not */
  async function drag(ctx: ChartState<any, any, any>, dx: number, dy: number, shiftKey = false) {
    const el = ctx.containerRef!.querySelector('.lc-transform-context')!;
    const box = el.getBoundingClientRect();
    const at = (x: number, y: number) => ({
      bubbles: true,
      pointerId: 1,
      clientX: box.x + x,
      clientY: box.y + y,
      shiftKey,
    });
    el.dispatchEvent(new PointerEvent('pointerdown', at(100, 100)));
    el.dispatchEvent(new PointerEvent('pointermove', at(100 + dx / 2, 100 + dy / 2)));
    el.dispatchEvent(new PointerEvent('pointermove', at(100 + dx, 100 + dy)));
    el.dispatchEvent(new PointerEvent('pointerup', at(100 + dx, 100 + dy)));
  }

  async function renderTransformed(transform: Record<string, any>) {
    const ctx = await renderChart({ isometric: { rotate: -30, tilt: 50 }, transform });
    await vi.waitFor(() => expect(ctx.transformState).toBeTruthy());
    return ctx;
  }

  it("starts from the `isometric` prop's angles, then turns and tips with the rotation", async () => {
    const ctx = await renderTransformed({ mode: 'canvas' });
    expect(ctx.isometricTransform).toBe(true);
    expect(ctx.transform.rotation).toEqual({ x: -30, y: 50 });
    await vi.waitFor(() => expect(angles(ctx)).toEqual({ rotate: -30, tilt: 50 }));

    // The rotation's `x` / `y` are the turn and tilt
    ctx.transform.setRotation({ x: 20, y: 65 });
    await vi.waitFor(() => expect(angles(ctx)).toEqual({ rotate: 20, tilt: 65 }));
  });

  it('pans and zooms the turned view', async () => {
    const ctx = await renderTransformed({ mode: 'canvas' });
    ctx.transform.setRotation({ x: 20, y: 65 });
    ctx.transform.setScale(2);
    ctx.transform.setTranslate({ x: 30, y: -10 });
    await vi.waitFor(() => expect(ctx.layerMatrix()!.e).not.toBe(ctx.isometricMatrix!.e));
    // Zoomed twice as large, still at the turned angles
    const m = ctx.layerMatrix()!;
    const iso = ctx.isometricMatrix!;
    expect(m.a / iso.a).toBeCloseTo(2);
    expect(angles(ctx)).toEqual({ rotate: 20, tilt: 65 });
  });

  it('pans with a drag by default, and turns the view with shift held', async () => {
    const ctx = await renderTransformed({ mode: 'canvas' });
    await drag(ctx, 60, 20);
    expect(ctx.transform.translate).toEqual({ x: 60, y: 20 });
    expect(ctx.transform.rotation).toEqual({ x: -30, y: 50 });

    await drag(ctx, 60, 0, true);
    expect(ctx.transform.translate).toEqual({ x: 60, y: 20 });
    expect(ctx.transform.rotation!.x).toBeCloseTo(-60);
  });

  it('turns the view with a drag for `drag: "rotate"`, and pans with shift held', async () => {
    const ctx = await renderTransformed({ mode: 'canvas', drag: 'rotate' });
    await drag(ctx, 60, -20);
    expect(ctx.transform.translate).toEqual({ x: 0, y: 0 });
    expect(ctx.transform.rotation!.x).toBeCloseTo(-60);
    // Dragging up tips it towards edge on
    expect(ctx.transform.rotation!.y).toBeGreaterThan(50);

    await drag(ctx, 40, 10, true);
    expect(ctx.transform.translate).toEqual({ x: 40, y: 10 });
  });

  it('resets the rotation along with the pan and zoom', async () => {
    const ctx = await renderTransformed({ mode: 'canvas' });
    ctx.transform.setRotation({ x: 20, y: 65 });
    ctx.transform.setTranslate({ x: 30, y: 30 });
    ctx.transform.reset();
    await vi.waitFor(() => expect(ctx.transform.rotation).toEqual({ x: -30, y: 50 }));
    expect(ctx.transform.translate).toEqual({ x: 0, y: 0 });
  });

  it('has nothing to turn on a flat chart, so a rotating drag pans', async () => {
    const ctx = await renderChart({
      isometric: false,
      transform: { mode: 'canvas', drag: 'rotate' },
    });
    await vi.waitFor(() => expect(ctx.transformState).toBeTruthy());
    expect(ctx.isometricTransform).toBe(false);
    expect(ctx.transform.rotation).toBeNull();
    await drag(ctx, 30, 10);
    expect(ctx.transform.translate).toEqual({ x: 30, y: 10 });
  });

  it('leaves the view alone without a transform mode', async () => {
    expect((await renderChart({ transform: { mode: 'none' } })).isometricTransform).toBe(false);
  });
});

describe('Chart pan / zoom with `transform={{ mode: "canvas" }}`', () => {
  /** Where the plot's middle is drawn, from the plot area's top-left */
  function middle(ctx: ChartState<any, any, any>) {
    return applyMatrix(ctx.layerMatrix()!, { x: ctx.width / 2, y: ctx.height / 2 });
  }

  for (const isometric of [true, false]) {
    describe(isometric ? 'isometric' : 'flat', () => {
      async function renderZoomable() {
        const ctx = await renderChart({
          isometric,
          transform: { mode: 'canvas' },
          // Uneven, so the plot area's middle isn't the container's
          padding: { top: 10, right: 10, bottom: 40, left: 60 },
        });
        await vi.waitFor(() => expect(ctx.transformState).toBeTruthy());
        return ctx;
      }

      it('zooms about the middle of the plot area', async () => {
        const ctx = await renderZoomable();
        ctx.transform.zoomIn();
        await vi.waitFor(() => expect(ctx.transform.scale).toBeCloseTo(1.25));
        expect(middle(ctx).x).toBeCloseTo(ctx.box.width / 2);
        expect(middle(ctx).y).toBeCloseTo(ctx.box.height / 2);
      });

      it('centres the plot again, keeping the zoom', async () => {
        const ctx = await renderZoomable();
        ctx.transform.zoomIn();
        await vi.waitFor(() => expect(ctx.transform.scale).toBeCloseTo(1.25));
        ctx.transform.setTranslate({ x: 80, y: -30 });
        await vi.waitFor(() => expect(middle(ctx).x).not.toBeCloseTo(ctx.box.width / 2));

        ctx.transform.translateCenter();
        await vi.waitFor(() => expect(middle(ctx).x).toBeCloseTo(ctx.box.width / 2));
        expect(middle(ctx).y).toBeCloseTo(ctx.box.height / 2);
        expect(ctx.transform.scale).toBeCloseTo(1.25);
      });
    });
  }
});

describe('Chart switching `transform` mode', () => {
  it('switches in place, starting the new mode from its initial transform', async () => {
    let ctx: ChartState<any, any, any> = null!;
    const chartProps = (mode: string) => ({
      data,
      x: 'x',
      y: 'y',
      xDomain: [0, 10],
      yDomain: [0, 10],
      width: 400,
      height: 300,
      // Eased, which a switch must not do — one mode's translate means nothing to another
      transform: { mode, motion: { type: 'tween', duration: 500 } },
    });
    const screen = render(TooltipTestHarness, {
      chartProps: chartProps('canvas'),
      oncontext: (c: any) => (ctx = c),
    });
    await vi.waitFor(() => expect(ctx?.transformState).toBeTruthy());
    const root = ctx.containerRef;
    ctx.transform.setTranslate({ x: 40, y: 20 });

    await screen.rerender({ chartProps: chartProps('domain') });
    expect(ctx.transform.mode).toBe('domain');
    expect(ctx.containerRef).toBe(root);
  });
});

describe('Chart isometric `motion`', () => {
  async function renderEased(transform?: Record<string, any>) {
    let ctx: ChartState<any, any, any> = null!;
    const chartProps = (isometric: Record<string, any>) => ({
      data,
      x: 'x',
      y: 'y',
      xDomain: [0, 10],
      yDomain: [0, 10],
      width: 400,
      height: 300,
      isometric: { ...isometric, motion: { type: 'tween', duration: 300 } },
      transform,
    });
    const screen = render(TooltipTestHarness, {
      chartProps: chartProps({ rotate: -45, tilt: 60 }),
      oncontext: (c: any) => (ctx = c),
    });
    await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
    if (transform) await vi.waitFor(() => expect(ctx.transformState).toBeTruthy());
    return {
      ctx,
      turn: (isometric: Record<string, any>) =>
        screen.rerender({ chartProps: chartProps(isometric) }),
    };
  }

  it('eases the view to new angles', async () => {
    const { ctx, turn } = await renderEased();
    expect(ctx.isometricAngles).toEqual({ rotate: -45, tilt: 60 });

    await turn({ rotate: 0, tilt: 0 });
    // Partway there, then there
    await vi.waitFor(() => {
      const { tilt } = ctx.isometricAngles;
      expect(tilt).toBeGreaterThan(0);
      expect(tilt).toBeLessThan(60);
    });
    await vi.waitFor(() => expect(ctx.isometricAngles).toEqual({ rotate: 0, tilt: 0 }));
  });

  it('turns a transformed view along with the eased angles, keeping its pan', async () => {
    const { ctx, turn } = await renderEased({ mode: 'canvas' });
    ctx.transform.setTranslate({ x: 30, y: 10 });

    await turn({ rotate: 0, tilt: 0 });
    await vi.waitFor(() => expect(ctx.isometricAngles.tilt).toBeLessThan(60));
    // Following the eased angles exactly, rather than easing after them
    const { rotate, tilt } = ctx.isometricAngles;
    expect(ctx.transform.rotation).toEqual({ x: rotate, y: tilt });

    await vi.waitFor(() => expect(ctx.transform.rotation).toEqual({ x: 0, y: 0 }));
    expect(ctx.transform.translate).toEqual({ x: 30, y: 10 });
  });
});

describe('Chart isometric brush', () => {
  it('brushes across the floor, measuring the pointer back onto it', async () => {
    const ctx = await renderChart({ brush: { axis: 'x' } });
    await vi.waitFor(() => expect(ctx.brushState).toBeTruthy());
    const el = ctx.containerRef!.querySelector('.lc-brush-context') as HTMLElement;
    const rect = el.getBoundingClientRect();
    // Container-relative screen points of two places on the floor
    const at = (x: number) => {
      const p = applyMatrix(ctx.layerMatrix()!, { x: ctx.xScale(x), y: ctx.yScale(5) });
      return { clientX: rect.left + p.x, clientY: rect.top + p.y };
    };
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, ...at(2) }));
    window.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, pointerId: 1, ...at(5) })
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, pointerId: 1, ...at(8) })
    );
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, ...at(8) }));

    const [start, end] = ctx.brush.x as number[];
    expect(start).toBeCloseTo(2, 1);
    expect(end).toBeCloseTo(8, 1);
    // Drawn through the floor's matrix
    await vi.waitFor(() =>
      expect((el.querySelector('.lc-brush-plot') as HTMLElement | null)?.style.transform).toMatch(
        /^matrix\(/
      )
    );
  });
});
