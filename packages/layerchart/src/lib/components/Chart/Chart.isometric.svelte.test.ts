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

describe('Chart isometric with `transform={{ mode: "projection" }}`', () => {
  /** The view a layer draws at, read back from its matrix */
  function angles(ctx: ChartState<any, any, any>) {
    const m = ctx.layerMatrix()!;
    return {
      rotate: Math.round((Math.atan2(-m.c, m.a) * 180) / Math.PI),
      tilt: Math.round((Math.acos(Math.hypot(m.b, m.d)) * 180) / Math.PI),
    };
  }

  it("starts from the `isometric` prop's angles, then turns and tips with the transform", async () => {
    const ctx = await renderChart({
      isometric: { rotate: -30, tilt: 50 },
      transform: { mode: 'projection' },
    });
    expect(ctx.isometricTransform).toBe(true);
    await vi.waitFor(() => expect(ctx.transformState).toBeTruthy());
    await vi.waitFor(() => expect(angles(ctx)).toEqual({ rotate: -30, tilt: 50 }));

    // The transform's `x` / `y` are the turn and tilt — what a drag sets
    ctx.transform.setTranslate({ x: 20, y: 65 });
    await vi.waitFor(() => expect(angles(ctx)).toEqual({ rotate: 20, tilt: 65 }));
  });

  it('leaves a flat chart, and other transform modes, alone', async () => {
    expect(
      (await renderChart({ isometric: false, transform: { mode: 'projection' } }))
        .isometricTransform
    ).toBe(false);
    expect((await renderChart({ transform: { mode: 'canvas' } })).isometricTransform).toBe(false);
  });
});
