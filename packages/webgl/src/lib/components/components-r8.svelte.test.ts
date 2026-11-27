import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Box3, Matrix4, type BufferGeometry, type InstancedMesh, type Mesh, type Object3D } from 'three';
import * as core from 'layerchart';
import type { BrushState, ChartState } from 'layerchart';

import * as webgl from '../index.js';
import type { SceneState } from '../contexts/scene.svelte.js';
import Components8 from './__fixtures__/Components8.svelte';

let chart: ChartState<any> | undefined;

async function renderMark(props: Omit<Parameters<typeof render<typeof Components8>>[1], 'onScene'>) {
  let scene: SceneState | undefined;
  const result = render(Components8, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return { scene: scene!, result };
}

function all<T extends Object3D>(scene: SceneState, is: (o: any) => boolean): T[] {
  const found: T[] = [];
  scene.root.traverse((o: Object3D) => {
    if (is(o)) found.push(o as T);
  });
  return found;
}

/** The bounds of the mesh vertices a mark drew, in the chart's pixels (`x` across, `z` down) */
function drawnBounds(scene: SceneState) {
  const box = new Box3();
  for (const mesh of all<Mesh>(scene, (o) => o.isMesh && !o.isInstancedMesh)) {
    const geometry = mesh.geometry as BufferGeometry;
    if (!geometry.getAttribute('position')?.count) continue;
    geometry.computeBoundingBox();
    box.union(geometry.boundingBox!);
  }
  return box;
}

describe('re-exports', () => {
  it("hands out LayerChart's contexts and layouts as they are", () => {
    expect(webgl.ChartGroup).toBe(core.ChartGroup);
    expect(webgl.Dodge).toBe(core.Dodge);
    expect(webgl.Point).toBe(core.Point);
    expect(webgl.Bounds).toBe(core.Bounds);
  });
});

describe('Waffle', () => {
  it('draws a cell for each unit, the last cut short at a fractional value', async () => {
    const { scene } = await renderMark({
      mark: 'waffle',
      data: [{ x: 'a', y: 2.5 }],
      markProps: { unit: 1, multiple: 1, gap: 0 },
    });
    let cells: InstancedMesh[] = [];
    await expect
      .poll(() => {
        cells = all<InstancedMesh>(scene, (o) => o.isInstancedMesh && o.count > 0);
        return cells[0]?.count ?? 0;
      })
      .toBe(3);
    const depths = [0, 1, 2].map((i) => {
      const m = new Matrix4();
      cells[0].getMatrixAt(i, m);
      // Scaled by each cell's depth (down the plot) along its third column
      return Math.hypot(m.elements[8], m.elements[9], m.elements[10]);
    });
    // 300 pixels for 100 units: 3 pixels a cell, the last half that
    expect(depths[0]).toBeCloseTo(3, 1);
    expect(depths[1]).toBeCloseTo(3, 1);
    expect(depths[2]).toBeCloseTo(1.5, 1);
  });

  it('draws rounded cells as shapes', async () => {
    const { scene } = await renderMark({
      mark: 'waffle',
      data: [{ x: 'a', y: 4 }],
      markProps: { unit: 1, multiple: 2, rx: '100%' },
    });
    await expect.poll(() => drawnBounds(scene).isEmpty()).toBe(false);
    expect(all<InstancedMesh>(scene, (o) => o.isInstancedMesh && o.count > 0)).toHaveLength(0);
  });
});

describe('GeoBin', () => {
  it("draws its cells together, in one mesh, each in its cell's color", async () => {
    const data = [
      { lon: 0, lat: 0 },
      { lon: 60, lat: 30 },
      { lon: -90, lat: -40 },
      { lon: 120, lat: 10 },
    ];
    const { scene } = await renderMark({ mark: 'geobin', data, markProps: { size: 30 } });
    const filled = () =>
      all<Mesh>(
        scene,
        (o) =>
          o.isMesh &&
          !o.isInstancedMesh &&
          !o.isLineSegments2 &&
          o.geometry.getAttribute('position')?.count > 0
      );
    await expect.poll(() => filled().length).toBe(1);
    const colors = filled()[0].geometry.getAttribute('color');
    // Four cells, each its own shape (several vertices each)
    expect(colors.count).toBeGreaterThanOrEqual(4 * 3);
  });
});

describe('Ellipse', () => {
  it('spans its `rx` across and `ry` down', async () => {
    const { scene } = await renderMark({
      mark: 'ellipse',
      markProps: { cx: 100, cy: 100, rx: 20, ry: 10, fill: 'red' },
    });
    await expect.poll(() => drawnBounds(scene).isEmpty()).toBe(false);
    const box = drawnBounds(scene);
    expect(box.max.x - box.min.x).toBeCloseTo(40, 0);
    expect(box.max.z - box.min.z).toBeCloseTo(20, 0);
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(100, 0);
  });

  it('turns by `rotate`', async () => {
    const { scene } = await renderMark({
      mark: 'ellipse',
      markProps: { cx: 100, cy: 100, rx: 20, ry: 10, rotate: 90, fill: 'red' },
    });
    await expect.poll(() => drawnBounds(scene).isEmpty()).toBe(false);
    const box = drawnBounds(scene);
    expect(box.max.x - box.min.x).toBeCloseTo(20, 0);
    expect(box.max.z - box.min.z).toBeCloseTo(40, 0);
  });
});

/** A 2 × 1 image */
function wideImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 20;
  canvas.height = 10;
  const context = canvas.getContext('2d')!;
  context.fillStyle = 'red';
  context.fillRect(0, 0, 20, 10);
  return canvas.toDataURL();
}

describe('Image', () => {
  it('fits the image in its box, as `preserveAspectRatio="xMidYMid meet"`', async () => {
    const { scene } = await renderMark({
      mark: 'image',
      markProps: { href: wideImage(), x: 100, y: 100, width: 40, height: 40 },
    });
    await expect.poll(() => drawnBounds(scene).isEmpty()).toBe(false);
    const box = drawnBounds(scene);
    expect(box.max.x - box.min.x).toBeCloseTo(40, 1);
    expect(box.max.z - box.min.z).toBeCloseTo(20, 1);
  });

  it('fills its circle `r`, as `preserveAspectRatio="xMidYMid slice"`', async () => {
    const { scene } = await renderMark({
      mark: 'image',
      markProps: { href: wideImage(), x: 100, y: 100, r: 15, preserveAspectRatio: 'xMidYMid slice' },
    });
    await expect.poll(() => drawnBounds(scene).isEmpty()).toBe(false);
    const box = drawnBounds(scene);
    expect(box.max.x - box.min.x).toBeCloseTo(30, 0);
    expect(box.max.z - box.min.z).toBeCloseTo(30, 0);
  });
});

describe('Brush', () => {
  it('brushes a selection by dragging over the scene', async () => {
    let brush: BrushState | undefined;
    const { result } = await renderMark({ mark: 'brush', onBrush: (b: BrushState | undefined) => (brush = b) });
    await expect.poll(() => brush).toBeDefined();
    const container = result.container.querySelector('.lc-root-container') as HTMLElement | null;
    const target = (container ?? chart!.containerRef)!;
    const rect = target.getBoundingClientRect();
    const at = (type: string, x: number) =>
      new PointerEvent(type, {
        clientX: rect.left + x,
        clientY: rect.top + 150,
        bubbles: true,
        pointerId: 1,
        buttons: type === 'pointerup' ? 0 : 1,
      });
    chart!.containerRef!.querySelector('canvas')!.dispatchEvent(at('pointerdown', 100));
    window.dispatchEvent(at('pointermove', 200));
    window.dispatchEvent(at('pointerup', 200));
    await expect.poll(() => brush?.active).toBe(true);
    // 400 pixels for 0 to 10
    expect(Number(brush!.x[0])).toBeCloseTo(2.5, 1);
    expect(Number(brush!.x[1])).toBeCloseTo(5, 1);
  });
});
