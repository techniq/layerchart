import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { scaleBand } from 'd3-scale';
import { Color, Matrix4, Quaternion, Vector3, type InstancedMesh, type Object3D } from 'three';

import type { ChartState } from 'layerchart';
import type { SceneState } from '../contexts/scene.svelte.js';
import Marks from './__fixtures__/Marks.svelte';

/** Render, and wait for the marks to add their objects to the scene */
async function renderMarks(props: Omit<Parameters<typeof render<typeof Marks>>[1], 'onScene'>) {
  let scene: SceneState | undefined;
  render(Marks, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

let chart: ChartState<any> | undefined;

/** The objects marks put in the scene, looking through each mark's own layer */
const layered = (scene: SceneState) =>
  scene.root.children.flatMap((o) => (o.userData.layer ? o.children : [o]));
const instanced = (scene: SceneState) =>
  layered(scene).filter((o: Object3D) => (o as any).isInstancedMesh) as InstancedMesh[];
/** The first mesh with instances drawn */
const drawn = (scene: SceneState) => instanced(scene).find((mesh) => mesh.count > 0);
/** The visible line segments' objects */
const lineSets = (scene: SceneState) =>
  layered(scene).filter((o: any) => o.isLineSegments2 && o.visible !== false) as any[];

/** Instance `i`'s corner and size, in the scene's axes */
function box(mesh: InstancedMesh, i: number) {
  const matrix = new Matrix4();
  mesh.getMatrixAt(i, matrix);
  const position = new Vector3();
  const size = new Vector3();
  matrix.decompose(position, new Quaternion(), size);
  return { position, size };
}

/**
 * Click the canvas over a point of the plot (in chart pixels) until `done`, as the scene takes a
 * frame or two to place its camera
 */
async function clickAt(scene: SceneState, x: number, y: number, done: () => boolean) {
  const canvas = document.querySelector('.lc-layout-webgl canvas') as HTMLCanvasElement;
  await expect
    .poll(() => {
      const at = scene.project(x, y, 0);
      if (at) {
        const rect = canvas.getBoundingClientRect();
        canvas.dispatchEvent(
          new MouseEvent('click', {
            clientX: rect.left + at.x,
            clientY: rect.top + at.y,
            bubbles: true,
          })
        );
      }
      return done();
    })
    .toBe(true);
}

const columns = {
  data: [
    { x: 'a', y: 4 },
    { x: 'b', y: 8 },
  ],
  x: 'x',
  xScale: scaleBand().padding(0.2),
  xDomain: ['a', 'b'],
  y: 'y',
  yDomain: [0, 10],
};

/** The middle of column `x`'s bar, from the baseline to `value`, in chart pixels */
const middleOf = (x: string, value: number) => {
  const xScale = chart!.xScale as any;
  return [xScale(x) + xScale.bandwidth() / 2, (chart!.yScale(0) + chart!.yScale(value)) / 2];
};

describe('Bars, as the core `Bars`', () => {
  it('calls `onclick` with the row of the bar clicked', async () => {
    const clicked: any[] = [];
    const scene = await renderMarks({
      mark: 'bars',
      chart: columns,
      bars: { onclick: (_e: MouseEvent, { data }: { data: any }) => clicked.push(data) } as any,
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    const [x, y] = middleOf('b', 8);
    await clickAt(scene, x, y, () => clicked.length > 0);
    expect(clicked[0]).toBe(columns.data[1]);
  });

  it('calls `onBarClick` with the row of the bar clicked', async () => {
    const clicked: any[] = [];
    const scene = await renderMarks({
      mark: 'bars',
      chart: columns,
      bars: { onBarClick: (_e: MouseEvent, { data }: { data: any }) => clicked.push(data) },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    const [x, y] = middleOf('a', 4);
    await clickAt(scene, x, y, () => clicked.length > 0);
    expect(clicked[0]).toBe(columns.data[0]);
  });

  it('makes nothing pickable without a handler (or `tooltip`)', async () => {
    const scene = await renderMarks({ mark: 'bars', chart: columns });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    expect(scene.pickables.size).toBe(0);
  });

  it('draws `fillOpacity` and `strokeOpacity` into the fill and outline', async () => {
    const scene = await renderMarks({
      mark: 'bars',
      chart: columns,
      bars: { fillOpacity: 0.4, strokeWidth: 1, strokeOpacity: 0.5, opacity: 0.5 },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    expect((drawn(scene)!.material as any).opacity).toBeCloseTo(0.2);
    await expect.poll(() => lineSets(scene)[0]?.material.opacity).toBeCloseTo(0.25);
  });

  it('eases a new bar in from `initialY` and `initialHeight` with `motion`', async () => {
    const scene = await renderMarks({
      mark: 'bars',
      chart: columns,
      // Slow enough to see where it starts
      bars: { motion: { type: 'tween', duration: 60_000 }, initialY: 10, initialHeight: 20 },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    const { position, size } = box(drawn(scene)!, 1);
    expect(position.z).toBeCloseTo(10, 0);
    expect(size.z).toBeCloseTo(20, 0);
  });

  it('takes a fixed `width`, centered in its band', async () => {
    const scene = await renderMarks({ mark: 'bars', chart: columns, bars: { width: 10 } });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    const xScale = chart!.xScale as any;
    const { position, size } = box(drawn(scene)!, 1);
    expect(size.x).toBeCloseTo(10);
    expect(position.x).toBeCloseTo(xScale('b') + xScale.bandwidth() / 2 - 5);
  });

  const fruit = {
    data: [
      { x: 'a', apples: 2, bananas: 3 },
      { x: 'b', apples: 4, bananas: 1 },
    ],
    x: 'x',
    xScale: scaleBand().padding(0.2),
    xDomain: ['a', 'b'],
    yDomain: [0, 10],
    series: [
      { key: 'apples', color: 'rgb(255, 0, 0)' },
      { key: 'bananas', color: 'rgb(0, 0, 255)' },
    ],
    seriesLayout: 'stack' as const,
  };

  it("reads a series' stacked values with `seriesKey`, spaced by `stackPadding`", async () => {
    const scene = await renderMarks({
      mark: 'bars',
      chart: fruit,
      bars: { seriesKey: 'bananas', stackPadding: 4 },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    const { position, size } = box(drawn(scene)!, 0);
    // On top of the apples, less half the padding beneath (the top of the stack keeps its edge)
    expect(position.z).toBeCloseTo(chart!.yScale(5));
    expect(size.z).toBeCloseTo(chart!.yScale(2) - chart!.yScale(5) - 2);
    // In the series' color
    const color = new Color();
    drawn(scene)!.getColorAt(0, color);
    expect(color.b).toBeGreaterThan(0.9);
    expect(color.r).toBeLessThan(0.1);
  });
});

describe('Bar, as the core `Bar`', () => {
  it('is pickable with an `onpointerenter`, as `Bars` with one', async () => {
    const scene = await renderMarks({
      mark: 'bars',
      chart: columns,
      bars: { onpointerenter: () => {} } as any,
    });
    await expect.poll(() => scene.pickables.size).toBe(1);
  });
});

describe('Rect, as the core `Rect`', () => {
  const rows = [
    { x0: 10, x1: 30, y0: 10, y1: 40 },
    { x0: 50, x1: 90, y0: 20, y1: 60 },
  ];
  const chartProps = { data: rows, xDomain: [0, 100], yDomain: [0, 100] };

  it('calls `onclick` with the row of the box clicked', async () => {
    const clicked: any[] = [];
    const scene = await renderMarks({
      mark: 'rect',
      chart: chartProps,
      rect: {
        x0: 'x0',
        x1: 'x1',
        y0: 'y0',
        y1: 'y1',
        onclick: (_e: MouseEvent, { data }: { data: any }) => clicked.push(data),
      },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    const x = (chart!.xScale(50) + chart!.xScale(90)) / 2;
    const y = (chart!.yScale(20) + chart!.yScale(60)) / 2;
    await clickAt(scene, x, y, () => clicked.length > 0);
    expect(clicked[0]).toBe(rows[1]);
  });

  it('calls a pixel-mode rect’s `onclick` without a row', async () => {
    const clicked: any[] = [];
    const scene = await renderMarks({
      mark: 'rect',
      chart: chartProps,
      rect: {
        x: 20,
        y: 20,
        width: 60,
        height: 40,
        onclick: (_e: MouseEvent, detail: { data: any }) => clicked.push(detail),
      },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(1);
    await clickAt(scene, 50, 40, () => clicked.length > 0);
    expect(clicked[0].data).toBeUndefined();
  });

  it('shrinks each box by its `insets`', async () => {
    const scene = await renderMarks({
      mark: 'rect',
      chart: chartProps,
      rect: { x: 20, y: 20, width: 60, height: 40, insets: { x: 5, top: 2 } },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(1);
    const { position, size } = box(drawn(scene)!, 0);
    expect(position.x).toBeCloseTo(25);
    expect(size.x).toBeCloseTo(50);
    expect(position.z).toBeCloseTo(22);
    expect(size.z).toBeCloseTo(38);
  });

  it('dashes its outline with `dashArray`, at `strokeOpacity`', async () => {
    const scene = await renderMarks({
      mark: 'rect',
      chart: chartProps,
      rect: {
        x: 20,
        y: 20,
        width: 60,
        height: 40,
        stroke: 'black',
        dashArray: '4 2',
        strokeOpacity: 0.5,
      },
    });
    await expect.poll(() => lineSets(scene)[0]?.material.dashed).toBe(true);
    expect(lineSets(scene)[0].material.opacity).toBeCloseTo(0.5);
  });

  it('draws its sides unlit with `shade={false}`', async () => {
    const scene = await renderMarks({
      mark: 'rect',
      chart: chartProps,
      rect: { x: 20, y: 20, width: 60, height: 40, z: 20, shade: false },
    });
    await expect.poll(() => (drawn(scene)?.material as any)?.isMeshBasicMaterial).toBe(true);
  });

  it('eases in from `initialWidth` and `initialHeight` with `motion` (pixel mode)', async () => {
    const scene = await renderMarks({
      mark: 'rect',
      chart: chartProps,
      rect: {
        x: 20,
        y: 20,
        width: 60,
        height: 40,
        initialWidth: 4,
        initialHeight: 6,
        motion: { type: 'tween', duration: 60_000 },
      },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(1);
    const { size } = box(drawn(scene)!, 0);
    expect(size.x).toBeCloseTo(4, 0);
    expect(size.z).toBeCloseTo(6, 0);
  });
});

describe('Bin, as the core `Bin`', () => {
  const rows = [...Array.from({ length: 5 }, () => ({ x: 1, y: 1 })), { x: 9, y: 9 }];
  const chartProps = { data: rows, x: 'x', y: 'y', xDomain: [0, 10], yDomain: [0, 10] };

  it('calls `onclick` with the cell clicked', async () => {
    const clicked: any[] = [];
    const scene = await renderMarks({
      mark: 'bin',
      chart: chartProps,
      bin: { size: 40, onclick: (_e: MouseEvent, cell: any) => clicked.push(cell) },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    const x = chart!.xScale(1);
    const y = chart!.yScale(1);
    await clickAt(scene, x, y, () => clicked.length > 0);
    expect(clicked[0].count).toBe(5);
  });

  it('draws `fillOpacity` into its cells', async () => {
    const scene = await renderMarks({
      mark: 'bin',
      chart: chartProps,
      bin: { size: 40, fillOpacity: 0.5, opacity: 0.8 },
    });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    expect((drawn(scene)!.material as any).opacity).toBeCloseTo(0.4);
  });

  it('outlines every cell of the plot with `grid`', async () => {
    const scene = await renderMarks({ mark: 'bin', chart: chartProps, bin: { size: 40 } });
    await expect.poll(() => drawn(scene)?.count).toBe(2);
    expect(lineSets(scene)).toHaveLength(0);

    const gridded = await renderMarks({
      mark: 'bin',
      chart: chartProps,
      bin: { size: 40, grid: { strokeOpacity: 0.5 } },
    });
    await expect
      .poll(() => lineSets(gridded)[0]?.geometry.attributes.instanceStart?.count ?? 0)
      .toBeGreaterThan(20);
  });

  it('hands `children` the cells to draw in their place', async () => {
    const children = createRawSnippet((props: () => { cells: any[] }) => ({
      render: () => `<span data-cells="${props().cells.length}"></span>`,
    }));
    const scene = await renderMarks({
      mark: 'bin',
      chart: chartProps,
      bin: { size: 40, children },
    });
    await expect
      .poll(() => document.querySelector('[data-cells]')?.getAttribute('data-cells'))
      .toBe('2');
    expect(instanced(scene).every((mesh) => mesh.count === 0)).toBe(true);
  });
});
