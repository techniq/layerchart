import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import IsometricSceneHarness from '$lib/tests/IsometricSceneHarness.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { applyMatrix, invertMatrix } from '$lib/utils/isometric.js';

const data = [
  { x: 1, y: 1, z: 2 },
  { x: 5, y: 5, z: 9 },
  { x: 9, y: 2, z: 5 },
  // The far corner, raised to the top — above everything the floor covers on screen
  { x: 10, y: 10, z: 10 },
];

const cube = {
  data,
  x: 'x',
  y: 'y',
  z: 'z',
  xDomain: [0, 10],
  yDomain: [0, 10],
  zDomain: [0, 10],
  isometric: true,
};

async function renderScene(
  chartProps: Record<string, any> = {},
  circleProps = {},
  highlights: Record<string, any>[] = []
) {
  let ctx: ChartState<any, any, any> = null!;
  const screen = render(IsometricSceneHarness, {
    chartProps: { ...cube, ...chartProps },
    circleProps,
    highlights,
    oncontext: (c: any) => (ctx = c),
  });
  await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
  const root = () => ctx.containerRef!;
  return { ctx, root, screen };
}

/** Where a datum is drawn: on the floor at its x / y, raised by its z */
function drawnAt(ctx: ChartState<any, any, any>, d: (typeof data)[number]) {
  const lift = ctx.isometricLift!;
  const z = ctx.zScale(d.z);
  const p = applyMatrix(ctx.isometricMatrix!, {
    x: ctx.xScale(d.x) + lift.x * z,
    y: ctx.yScale(d.y) + lift.y * z,
  });
  return { x: p.x + ctx.padding.left, y: p.y + ctx.padding.top };
}

describe('3D scatter on an isometric floor', () => {
  it('floats each circle at its `z`, painted back to front', async () => {
    const { ctx, root } = await renderScene();
    const circles = [...root().querySelectorAll<SVGCircleElement>('circle.lc-circle')];
    expect(circles).toHaveLength(4);

    // Each drawn circle sits where its datum floats
    const drawn = circles.map((c) => {
      const m = c.getCTM()!;
      const x = +c.getAttribute('cx')!;
      const y = +c.getAttribute('cy')!;
      const container = root().getBoundingClientRect();
      const screen = c.ownerSVGElement!.getBoundingClientRect();
      return {
        x: m.a * x + m.c * y + m.e + screen.x - container.x,
        y: m.b * x + m.d * y + m.f + screen.y - container.y,
      };
    });
    for (const d of data) {
      const expected = drawnAt(ctx, d);
      expect(drawn.some((p) => Math.hypot(p.x - expected.x, p.y - expected.y) < 0.5)).toBe(true);
    }
  });

  it('keeps `viewport` circles round', async () => {
    const { root } = await renderScene({}, { viewport: true });
    const m = root().querySelector<SVGCircleElement>('circle.lc-circle')!.getScreenCTM()!;
    expect(m.a).toBeCloseTo(1);
    expect(m.b).toBeCloseTo(0);
    expect(m.c).toBeCloseTo(0);
    expect(m.d).toBeCloseTo(1);
  });

  it('stands two back walls, gridlined, and an axis up the back corner', async () => {
    const { root } = await renderScene();
    expect(root().querySelectorAll('.lc-frame-wall')).toHaveLength(2);
    expect(root().querySelectorAll('.lc-grid-z-rule').length).toBeGreaterThan(0);
    expect(root().querySelectorAll('.placement-back .lc-axis-tick-label').length).toBeGreaterThan(
      1
    );
  });

  it('turns the walls with the view', async () => {
    const before = (await renderScene({ isometric: { rotate: -30 } })).root();
    const walls = (el: HTMLElement) =>
      [...el.querySelectorAll('.lc-frame-wall')].map((w) => w.getAttribute('d')).join();
    const a = walls(before);
    const after = (await renderScene({ isometric: { rotate: 120 } })).root();
    expect(walls(after)).not.toEqual(a);
  });

  it('draws no walls, wall gridlines, or back axis without a `z`', async () => {
    const { root } = await renderScene({ z: undefined });
    expect(root().querySelectorAll('.lc-frame-wall')).toHaveLength(0);
    expect(root().querySelectorAll('.lc-grid-z-rule')).toHaveLength(0);
    expect(root().querySelectorAll('.placement-back')).toHaveLength(0);
  });

  it('finds a point where it floats, even over no part of the floor', async () => {
    const { ctx } = await renderScene({ tooltipContext: { mode: 'quadtree', radius: 10 } });
    const tallest = data[3];
    const { x, y } = drawnAt(ctx, tallest);

    // Under the pointer is no part of the floor
    const floor = applyMatrix(invertMatrix(ctx.isometricMatrix!)!, {
      x: x - ctx.padding.left,
      y: y - ctx.padding.top,
    });
    const onFloor = floor.x >= 0 && floor.x <= ctx.width && floor.y >= 0 && floor.y <= ctx.height;
    expect(onFloor).toBe(false);

    const rect = ctx.containerRef!.getBoundingClientRect();
    const e = new PointerEvent('pointermove', {
      bubbles: true,
      clientX: rect.x + x,
      clientY: rect.y + y,
    });
    Object.defineProperty(e, 'target', { value: ctx.containerRef });
    await vi.waitFor(() => {
      ctx.tooltip.show(e);
      expect(ctx.tooltip.data).toEqual(tallest);
    });
  });

  it('floats a `Highlight` at the row, and pins it to the floor with `z`', async () => {
    const row = data[1];
    const { ctx, root } = await renderScene({}, {}, [
      { data: row, points: { class: 'floating' } },
      { data: row, z: () => 0, points: { class: 'shadow' } },
    ]);
    const centre = (selector: string) => {
      const box = root().querySelector(selector)!.getBoundingClientRect();
      const container = root().getBoundingClientRect();
      return { x: box.x + box.width / 2 - container.x, y: box.y + box.height / 2 - container.y };
    };

    await vi.waitFor(() =>
      expect(root().querySelector('.lc-highlight-point.floating')).not.toBeNull()
    );
    const floating = centre('.lc-highlight-point.floating');
    const expected = drawnAt(ctx, row);
    expect(floating.x).toBeCloseTo(expected.x, 0);
    expect(floating.y).toBeCloseTo(expected.y, 0);

    const shadow = centre('.lc-highlight-point.shadow');
    const floor = drawnAt(ctx, { ...row, z: 0 });
    expect(shadow.x).toBeCloseTo(floor.x, 0);
    expect(shadow.y).toBeCloseTo(floor.y, 0);
  });

  it("traces a `Highlight`'s lines on all three grids", async () => {
    const row = data[1];
    const { ctx, root } = await renderScene({}, {}, [{ data: row, lines: true, axis: 'both' }]);
    await vi.waitFor(() =>
      expect(root().querySelectorAll('.lc-highlight-line').length).toBeGreaterThan(0)
    );
    // On the floor at its x and y, then on each of the two back walls: up it, and across at height
    expect(root().querySelectorAll('.lc-highlight-line')).toHaveLength(2 + 2 * 2);

    // The lines across the walls sit at the row's height
    const lift = ctx.isometricLift!;
    const height = ctx.zScale(row.z);
    const wallLines = [...root().querySelectorAll<SVGLineElement>('.lc-highlight-line')].slice(2);
    const atHeight = wallLines.filter((l) => {
      const [x1, y1] = [+l.getAttribute('x1')!, +l.getAttribute('y1')!];
      // Back on the floor, a line across a wall starts on the wall's edge (x or y at the floor's limit)
      const fx = x1 - lift.x * height;
      const fy = y1 - lift.y * height;
      const onEdge = (v: number, max: number) => Math.abs(v) < 0.5 || Math.abs(v - max) < 0.5;
      return onEdge(fx, ctx.width) && onEdge(fy, ctx.height);
    });
    expect(atHeight).toHaveLength(2);
  });

  it("lays a `Highlight`'s shadows on the floor and both back walls, level with the point", async () => {
    const row = data[1];
    const { ctx, root } = await renderScene({}, {}, [{ data: row, shadows: true }]);
    await vi.waitFor(() => expect(root().querySelectorAll('.lc-highlight-shadow')).toHaveLength(3));
    const [floor, ...walls] = [
      ...root().querySelectorAll<SVGEllipseElement>('.lc-highlight-shadow'),
    ];

    // On the floor, right beneath the point
    expect(+floor.getAttribute('cx')!).toBeCloseTo(ctx.xScale(row.x));
    expect(+floor.getAttribute('cy')!).toBeCloseTo(ctx.yScale(row.y));

    // On each wall, raised to the point's height off the wall's edge
    const lift = ctx.isometricLift!;
    const height = ctx.zScale(row.z);
    for (const wall of walls) {
      const fx = +wall.getAttribute('cx')! - lift.x * height;
      const fy = +wall.getAttribute('cy')! - lift.y * height;
      const onEdge = (v: number, max: number) => Math.abs(v) < 0.5 || Math.abs(v - max) < 0.5;
      expect(onEdge(fx, ctx.width) || onEdge(fy, ctx.height)).toBe(true);
    }
  });
});
