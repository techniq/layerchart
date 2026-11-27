import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Object3D } from 'three';
import type { ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import SplineArea from './__fixtures__/SplineArea.svelte';

type Props = Omit<Parameters<typeof render<typeof SplineArea>>[1], 'onScene'>;

/** Render, and wait for the marks to add their objects to the scene */
async function renderMarks(props: Props) {
  let scene: SceneState | undefined;
  let chart: ChartState<any> | undefined;
  render(SplineArea, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return { scene: scene!, chart: chart! };
}

/** Every object in the scene */
const all = (scene: SceneState) => {
  const out: Object3D[] = [];
  scene.root.traverse((o) => out.push(o));
  return out;
};
/** The scene's lines (a `Spline`'s, each a `Line2`) */
const lines = (scene: SceneState) => all(scene).filter((o) => (o as any).isLine2) as any[];
/** A line's points, as `[x, y]` across and down the plot */
const pointsOf = (line: any): [number, number][] => {
  const start = line.geometry.attributes.instanceStart;
  const end = line.geometry.attributes.instanceEnd;
  const out: [number, number][] = [];
  for (let i = 0; i < start.count; i++) out.push([start.getX(i), start.getZ(i)]);
  if (start.count) out.push([end.getX(start.count - 1), end.getZ(start.count - 1)]);
  return out;
};

const radial = {
  radial: true,
  x: 'x',
  y: 'y',
  xDomain: [0, 4],
  xRange: [0, 2 * Math.PI],
  yDomain: [0, 10],
  yRange: [0, 100],
};

describe('Spline and Area, as the core marks', () => {
  it("lays a `radial` chart's line out by angle and radius about the center", async () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 5 },
      { x: 2, y: 10 },
    ];
    const { scene } = await renderMarks({ chart: { ...radial, data }, spline: {} });
    await expect.poll(() => lines(scene).length).toBe(1);
    const points = pointsOf(lines(scene)[0]);
    // Up at 12 o'clock, right at 3, and down at 6, as `lineRadial` puts them
    expect(points[0][0]).toBeCloseTo(0);
    expect(points[0][1]).toBeCloseTo(-100);
    expect(points[1][0]).toBeCloseTo(50);
    expect(points[1][1]).toBeCloseTo(0);
    expect(points[2][0]).toBeCloseTo(0);
    expect(points[2][1]).toBeCloseTo(100);
  });

  it("fills a `radial` chart's area between its radii", async () => {
    const data = [0, 1, 2, 3].map((x) => ({ x, lo: 4, hi: 8 }));
    const { scene } = await renderMarks({
      chart: { ...radial, data },
      area: { y0: 'lo', y1: 'hi' },
    });
    const mesh = () => all(scene).find((o) => (o as any).isMesh && !(o as any).isLine2) as any;
    await expect.poll(() => mesh()?.geometry.attributes.position?.count ?? 0).toBeGreaterThan(0);
    const array = mesh().geometry.attributes.position.array as Float32Array;
    const radii: number[] = [];
    for (let i = 0; i < array.length; i += 3) radii.push(Math.hypot(array[i], array[i + 2]));
    expect(Math.min(...radii)).toBeCloseTo(40);
    expect(Math.max(...radii)).toBeCloseTo(80);
  });

  it('splits a line into runs by a `class` function, dashing the dashed ones', async () => {
    const data = [0, 1, 2, 3, 4].map((x) => ({ x, y: x, gap: x === 2 }));
    const { scene } = await renderMarks({
      chart: { data, x: 'x', y: 'y' },
      spline: {
        class: (d: any) => (d.gap ? 'test-wide test-dashed' : 'test-wide'),
      },
    });
    // Solid to the gap's row, dashed across to the next, then solid again
    await expect.poll(() => lines(scene).length).toBe(3);
    const runs = lines(scene);
    expect(runs.map((l) => l.material.dashed)).toEqual([false, true, false]);
    expect(runs.map((l) => pointsOf(l).length)).toEqual([3, 2, 2]);
    expect(runs.every((l) => l.material.linewidth === 2)).toBe(true);
  });

  it("draws a line all the way with `draw`, past its first frame's length", async () => {
    const data = Array.from({ length: 20 }, (_, x) => ({ x, y: x % 3 }));
    const { scene } = await renderMarks({
      chart: { data, x: 'x', y: 'y' },
      spline: { draw: { duration: 300 } },
    });
    await expect.poll(() => lines(scene).length).toBe(1);
    const line = lines(scene)[0];
    await expect.poll(() => pointsOf(line).length).toBe(20);
    // three draws no more of a line's segments than it first drew, unless told it may
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(line.geometry._maxInstanceCount ?? Infinity).toBeGreaterThanOrEqual(19);
  });

  it('stacks an `Area` with no edges of its own, as the core `Area` registers', async () => {
    const data = ['a', 'b'].flatMap((name, k) =>
      [0, 1, 2].map((x) => ({ x, value: 10 + k, name }))
    );
    const { chart } = await renderMarks({
      chart: { data, x: 'x', y: 'value', c: 'name', seriesLayout: 'stack' },
      area: {},
    });
    await expect.poll(() => chart.isStacked).toBe(true);
    await expect.poll(() => Math.max(...(chart.yDomain as number[]))).toBe(21);
  });
});
