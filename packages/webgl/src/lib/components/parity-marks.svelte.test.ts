import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Color, Matrix4, Quaternion, Vector3, type InstancedMesh, type Object3D } from 'three';

import type { ChartState } from 'layerchart';
import type { SceneState } from '../contexts/scene.svelte.js';
import Marks from './__fixtures__/Marks.svelte';

let chart: ChartState<any> | undefined;

/** Render, and wait for the marks to add their objects to the scene */
async function renderMarks(props: Omit<Parameters<typeof render<typeof Marks>>[1], 'onScene'>) {
  let scene: SceneState | undefined;
  const result = render(Marks, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return { scene: scene!, rerender: result.rerender };
}

/** The objects marks put in the scene, looking through each mark's own layer */
const layered = (scene: SceneState) =>
  scene.root.children.flatMap((o) => (o.userData.layer ? o.children : [o]));

const instanced = (scene: SceneState) =>
  layered(scene).filter((o: Object3D) => (o as any).isInstancedMesh) as InstancedMesh[];

/** The merged meshes marks fill (not their outlines, nor instanced marks) */
const fills = (scene: SceneState) =>
  layered(scene).filter(
    (o) => (o as any).isMesh && !(o as any).isInstancedMesh && !(o as any).isLineSegments2
  ) as any[];

const outlines = (scene: SceneState) =>
  layered(scene).filter((o) => (o as any).isLineSegments2) as any[];

/** An instance's center (across, down the plot) and radius */
function placed(mesh: InstancedMesh, i = 0) {
  const matrix = new Matrix4();
  mesh.getMatrixAt(i, matrix);
  const position = new Vector3();
  const size = new Vector3();
  matrix.decompose(position, new Quaternion(), size);
  return { x: position.x, y: position.z, r: size.x };
}

const tween = { type: 'tween' as const, duration: 400 };

/** Two series, each with rows of its own, side by side (not stacked) */
const seriesChart = {
  x: 'x',
  y: 'v',
  xDomain: [0, 10],
  yDomain: [0, 10],
  seriesLayout: 'overlap' as const,
  series: [
    {
      key: 'a',
      color: 'rgb(255, 0, 0)',
      value: 'v',
      data: [
        { x: 0, v: 2 },
        { x: 10, v: 2 },
      ],
    },
    {
      key: 'b',
      color: 'rgb(0, 0, 255)',
      value: 'v',
      data: [
        { x: 0, v: 8 },
        { x: 10, v: 8 },
      ],
    },
  ],
};

describe('Circle, with the core `Circle`’s props', () => {
  it('eases in from `initialCx` and `initialR` with `motion`', async () => {
    const { scene } = await renderMarks({
      mark: 'circle',
      chart: {},
      circle: { cx: 100, cy: 50, r: 20, initialCx: 0, initialR: 0, motion: tween },
    });
    const now = () => placed(instanced(scene)[0]);
    // On its way...
    await expect.poll(() => now().r > 1 && now().r < 19).toBe(true);
    expect(now().x).toBeLessThan(99);
    // ...and there
    await expect.poll(() => now().r).toBeCloseTo(20);
    expect(now().x).toBeCloseTo(100);
    expect(now().y).toBeCloseTo(50);
  });

  it('eases only the props its `motion` names', async () => {
    const { scene } = await renderMarks({
      mark: 'circle',
      chart: {},
      circle: { cx: 100, cy: 50, r: 20, initialCx: 0, initialR: 0, motion: { r: tween } },
    });
    const now = () => placed(instanced(scene)[0]);
    await expect.poll(() => now().r > 1 && now().r < 19).toBe(true);
    // Straight to its place, growing there
    expect(now().x).toBeCloseTo(100);
  });

  it('draws its ring at `strokeOpacity`', async () => {
    const { scene } = await renderMarks({
      mark: 'circle',
      chart: {},
      circle: { cx: 100, cy: 50, r: 10, stroke: 'black', strokeOpacity: 0.25 },
    });
    await expect.poll(() => instanced(scene).length).toBe(2);
    const [fill, ring] = instanced(scene);
    expect((fill.material as any).opacity).toBe(1);
    expect((ring.material as any).opacity).toBeCloseTo(0.25);
  });
});

describe('Points, with the props the core `Points` takes from `Circle`', () => {
  const rows = [
    { x: 2, y: 2 },
    { x: 7, y: 6 },
  ];
  const chartProps = { data: rows, x: 'x', y: 'y', xDomain: [0, 10], yDomain: [0, 10] };

  it('grows each point in from `initialR` with `motion`', async () => {
    const { scene } = await renderMarks({
      mark: 'points',
      chart: chartProps,
      points: { r: 8, initialR: 0, motion: tween },
    });
    const mesh = () => instanced(scene)[0];
    await expect.poll(() => mesh()?.count).toBe(2);
    await expect.poll(() => placed(mesh(), 1).r > 0.5 && placed(mesh(), 1).r < 7.5).toBe(true);
    await expect.poll(() => placed(mesh(), 1).r).toBeCloseTo(8);
    expect(placed(mesh(), 1).x).toBeCloseTo(chart!.xScale(7));
  });

  it('eases each point to its new place by its `key`', async () => {
    const { scene, rerender } = await renderMarks({
      mark: 'points',
      chart: chartProps,
      points: { data: [{ id: 'a', x: 2, y: 5 }], key: (d: any) => d.id, motion: tween },
    });
    const across = () => placed(instanced(scene)[0]).x;
    await expect.poll(across).toBeCloseTo(chart!.xScale(2));
    await rerender({
      points: { data: [{ id: 'a', x: 8, y: 5 }], key: (d: any) => d.id, motion: tween },
    });
    await expect.poll(() => across() > chart!.xScale(2) + 1).toBe(true);
    expect(across()).toBeLessThan(chart!.xScale(8) - 1);
    await expect.poll(across).toBeCloseTo(chart!.xScale(8));
  });

  it('draws its `seriesKey`’s rows, in its color', async () => {
    const { scene } = await renderMarks({
      mark: 'points',
      chart: seriesChart,
      points: { seriesKey: 'b' },
    });
    const mesh = () => instanced(scene)[0];
    await expect.poll(() => mesh()?.count).toBe(2);
    expect(placed(mesh()).y).toBeCloseTo(chart!.yScale(8));
    const color = new Color();
    mesh().getColorAt(0, color);
    expect([color.r, color.b]).toEqual([expect.closeTo(0), expect.closeTo(1)]);
  });
});

describe('Spline and Area, with `seriesKey`', () => {
  it('draws a `Spline` of its series’ rows, in its color, faded while another is highlighted', async () => {
    const { scene } = await renderMarks({
      mark: 'spline',
      chart: seriesChart,
      spline: { seriesKey: 'b' },
    });
    const line = () => layered(scene).find((o) => (o as any).isLine2) as any;
    await expect.poll(() => line()).toBeTruthy();
    const geometry = line().geometry;
    expect(geometry.attributes.instanceStart.getZ(0)).toBeCloseTo(chart!.yScale(8));
    expect(geometry.attributes.instanceColorStart.getX(0)).toBeCloseTo(0);
    expect(geometry.attributes.instanceColorStart.getZ(0)).toBeCloseTo(1);
    expect(line().material.opacity).toBe(1);

    chart!.series.highlightKey = 'a';
    await expect.poll(() => line().material.opacity).toBeCloseTo(0.1);
    chart!.series.highlightKey = null;
    await expect.poll(() => line().material.opacity).toBe(1);
  });

  it('fills an `Area` from its series’ rows, in its color', async () => {
    const { scene } = await renderMarks({
      mark: 'area',
      chart: seriesChart,
      area: { seriesKey: 'b' },
    });
    const mesh = () => fills(scene).find((m) => m.geometry.attributes.position?.count > 0);
    await expect.poll(() => mesh()).toBeTruthy();
    const positions = mesh().geometry.attributes.position.array as Float32Array;
    const downs = Array.from({ length: positions.length / 3 }, (_, i) => positions[i * 3 + 2]);
    // From its top (its series' value) down to the plot's bottom
    expect(Math.min(...downs)).toBeCloseTo(chart!.yScale(8));
    expect(Math.max(...downs)).toBeCloseTo(Math.max(...chart!.yRange));
    const colors = mesh().geometry.attributes.color.array as Float32Array;
    expect([colors[0], colors[2]]).toEqual([expect.closeTo(0), expect.closeTo(1)]);
  });
});

describe('Area, with the core `Area`’s `stroke` and `pathData`', () => {
  const chartProps = {
    data: [
      { x: 0, y: 4 },
      { x: 10, y: 6 },
    ],
    x: 'x',
    y: 'y',
    xDomain: [0, 10],
    yDomain: [0, 10],
  };

  it('outlines each area with `stroke`, around its top, its base, and its ends', async () => {
    const { scene } = await renderMarks({ mark: 'area', chart: chartProps, area: {} });
    await expect.poll(() => fills(scene).length).toBeGreaterThan(0);
    expect(outlines(scene).every((o) => !o.visible)).toBe(true);

    const outlined = await renderMarks({
      mark: 'area',
      chart: chartProps,
      area: { stroke: 'rgb(255, 0, 0)' },
    });
    const lines = () => outlines(outlined.scene).find((o) => o.visible);
    await expect.poll(() => lines()?.geometry.attributes.instanceStart.count).toBe(4);
    const colors = lines().geometry.attributes.instanceColorStart;
    expect([colors.getX(0), colors.getY(0)]).toEqual([expect.closeTo(1), expect.closeTo(0)]);
  });

  it('fills explicit `pathData` in place of its rows', async () => {
    const { scene } = await renderMarks({
      mark: 'area',
      chart: chartProps,
      area: { pathData: 'M10,10L110,10L110,60L10,60Z', fill: 'rgb(0, 255, 0)' },
    });
    const filled = () => fills(scene).filter((m) => m.geometry.attributes.position?.count > 0);
    await expect.poll(() => filled().length).toBe(1);
    const positions = filled()[0].geometry.attributes.position.array as Float32Array;
    const across = Array.from({ length: positions.length / 3 }, (_, i) => positions[i * 3]);
    expect([Math.min(...across), Math.max(...across)]).toEqual([
      expect.closeTo(10),
      expect.closeTo(110),
    ]);
  });
});

describe('Arc, with the core `Arc`’s `fillOpacity` and `strokeOpacity`', () => {
  it('draws its fill and its outline each at its own opacity, under `opacity`', async () => {
    const { scene } = await renderMarks({
      mark: 'arc',
      chart: {},
      arc: {
        value: 50,
        stroke: 'black',
        opacity: 0.5,
        fillOpacity: 0.5,
        strokeOpacity: 0.4,
      },
    });
    const mesh = () => fills(scene).find((m) => m.geometry.attributes.position?.count > 0);
    await expect.poll(() => mesh()?.material.opacity).toBeCloseTo(0.25);
    const outline = outlines(scene).find((o) => o.visible);
    expect(outline.material.opacity).toBeCloseTo(0.2);
  });
});

describe('Rule, with `seriesKey`', () => {
  it('fades while another series is highlighted, and hides with its series', async () => {
    const { scene } = await renderMarks({
      mark: 'rule',
      chart: seriesChart,
      rule: { y: 5, seriesKey: 'b' },
    });
    const line = () => outlines(scene)[0];
    await expect.poll(() => line()?.visible).toBe(true);
    expect(line().material.opacity).toBe(1);

    chart!.series.highlightKey = 'a';
    await expect.poll(() => line().material.opacity).toBeCloseTo(0.1);
    chart!.series.highlightKey = null;

    chart!.series.selectedKeys.current = ['a'];
    await expect.poll(() => line().visible).toBe(false);
  });
});

describe('Text, with the core `Text`’s props', () => {
  /** The planes labels lying on the surface are painted on, in the order they're drawn */
  const planes = (scene: SceneState) => {
    const found: any[] = [];
    scene.root.traverse((o: any) => {
      if (o.isMesh && o.material?.map) found.push(o);
    });
    return found;
  };

  it('eases in from `initialX` with `motion`', async () => {
    const { scene } = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 100, y: 50, initialX: 0, value: 'hi', viewport: true, motion: tween },
    });
    const label = () => scene.labelSets.flat()[0];
    await expect.poll(() => label()?.x > 1 && label()?.x < 99).toBe(true);
    await expect.poll(() => label().x).toBeCloseTo(100);
    expect(label().y).toBeCloseTo(50);
  });

  it('tweens a numeric `value` with a motion `{ type }`', async () => {
    const { scene, rerender } = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 100, y: 50, value: 0, format: 'integer', viewport: true, motion: tween },
    });
    const text = () => Number(scene.labelSets.flat()[0]?.text.replace(/,/g, ''));
    await expect.poll(text).toBe(0);
    await rerender({
      text: { x: 100, y: 50, value: 1000, format: 'integer', viewport: true, motion: tween },
    });
    await expect.poll(() => text() > 0 && text() < 1000).toBe(true);
    await expect.poll(text).toBe(1000);
  });

  it('draws `segments` facing the viewer side by side, each in its own classes', async () => {
    const { scene } = await renderMarks({
      mark: 'text',
      chart: {},
      text: {
        x: 100,
        y: 50,
        segments: [{ value: 'Hello ' }, { value: 'world', class: 'font-bold' }],
        textAnchor: 'start',
        viewport: true,
      },
    });
    await expect.poll(() => scene.labelSets.flat().length).toBe(2);
    const [hello, world] = scene.labelSets.flat();
    expect([hello.text, world.text]).toEqual(['Hello', 'world']);
    expect(world.class).toContain('font-bold');
    expect(hello.dx).toBe(0);
    // Past `Hello ` (its space too)
    expect(world.dx!).toBeGreaterThan(20);
    expect([hello.textAnchor, world.textAnchor]).toEqual(['start', 'start']);
  });

  it('lays `segments` on the surface along one baseline', async () => {
    const { scene } = await renderMarks({
      mark: 'text',
      chart: {},
      text: {
        x: 100,
        y: 50,
        segments: [{ value: 'Hello ' }, { value: 'world' }],
        fontSize: 12,
      },
    });
    await expect.poll(() => planes(scene).length).toBe(2);
    const [hello, world] = planes(scene);
    // Centered on the point as a whole (`textAnchor` `middle`), one after the other
    expect(hello.position.x).toBeLessThan(100);
    expect(world.position.x).toBeGreaterThan(100);
    expect(world.position.z).toBeCloseTo(hello.position.z);
  });

  it('places a label lying on the surface by its `capHeight`', async () => {
    const at = async (capHeight?: string) => {
      const { scene } = await renderMarks({
        mark: 'text',
        chart: {},
        text: { x: 100, y: 50, value: 'cap', fontSize: 12, verticalAnchor: 'start', capHeight },
      });
      await expect.poll(() => planes(scene).length).toBe(1);
      return planes(scene)[0].position.z as number;
    };
    const natural = await at();
    // Its cap height's top at its point: a taller cap height puts it further down
    expect(await at('20px')).toBeCloseTo(natural + 20 - 0.71 * 12);
  });
});
