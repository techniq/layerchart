import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import type { InstancedMesh, Object3D } from 'three';

import type { SceneState } from '../contexts/scene.svelte.js';
import Marks from './__fixtures__/Marks.svelte';

/** Render, and wait for the marks to add their objects to the scene */
async function renderMarks(props: Omit<Parameters<typeof render<typeof Marks>>[1], 'onScene'>) {
  let scene: SceneState | undefined;
  render(Marks, { ...(props as any), onScene: (s: SceneState) => (scene = s) });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

const children = (scene: SceneState, is: 'isLine2' | 'isInstancedMesh') =>
  scene.root.children.filter((o: Object3D) => (o as any)[is]);

const lines = ['a', 'b', 'c'].flatMap((key, i) =>
  Array.from({ length: 5 }, (_, t) => ({ key, t, value: t + i }))
);

describe('Spline', () => {
  it("draws a line per value of the chart's `c`, as LayerChart's `Spline` does", async () => {
    const scene = await renderMarks({
      mark: 'spline',
      chart: {
        data: lines,
        x: 't',
        y: 'value',
        c: 'key',
        cScale: scaleOrdinal(),
        cRange: ['red', 'green', 'blue'],
      },
    });
    await expect.poll(() => children(scene, 'isLine2').length).toBe(3);
  });

  it('draws a line per value of the data key `stroke` names', async () => {
    const scene = await renderMarks({
      mark: 'spline',
      chart: { data: lines, x: 't', y: 'value' },
      spline: { stroke: 'key' },
    });
    await expect.poll(() => children(scene, 'isLine2').length).toBe(3);
  });
});

describe('Points', () => {
  it('skips rows outside a band scale, keeping the rest pickable', async () => {
    const scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [
          { x: 1, day: 'Mon' },
          { x: 2, day: 'Tue' },
          { x: 3, day: 'Someday' },
        ],
        x: 'x',
        y: 'day',
        yScale: scaleBand(),
        yDomain: ['Mon', 'Tue'],
      },
    });
    const [mesh] = children(scene, 'isInstancedMesh') as InstancedMesh[];
    await expect.poll(() => mesh.count).toBe(2);
    expect(Number.isFinite(mesh.boundingSphere?.radius)).toBe(true);
    expect(Number.isFinite(mesh.boundingSphere?.center.x)).toBe(true);
  });

  it("keeps a translucent color's alpha", async () => {
    const scene = await renderMarks({
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      points: { fill: 'rgb(255 0 0 / 0.3)' },
    });
    const [mesh] = children(scene, 'isInstancedMesh') as InstancedMesh[];
    await expect.poll(() => (mesh.material as any).transparent).toBe(true);
    expect(mesh.geometry.getAttribute('instanceOpacity').getX(0)).toBeCloseTo(0.3, 1);
  });
});
