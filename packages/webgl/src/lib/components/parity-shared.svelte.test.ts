import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
  Matrix4,
  OrthographicCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type InstancedMesh,
  type Mesh,
  type Object3D,
} from 'three';

import type { ChartState } from 'layerchart';
import type { SceneState } from '../contexts/scene.svelte.js';
import { contourSegments } from '../utils/contours.js';
import { perspective } from '../index.js';
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

/** The planes labels lying on the surface are painted on */
const planes = (scene: SceneState) => {
  const found: Mesh[] = [];
  scene.root.traverse((o: any) => {
    if (o.isMesh && o.material?.map) found.push(o);
  });
  return found;
};

/** The most opaque pixel painted on a label's plane (0 to 255) */
function peakAlpha(plane: Mesh) {
  const canvas = (plane.material as any).map.image as HTMLCanvasElement;
  const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
  let peak = 0;
  for (let i = 3; i < pixels.length; i += 4) peak = Math.max(peak, pixels[i]);
  return peak;
}

describe('Text, with the core `Text`’s opacities', () => {
  it('fades a `viewport` label’s letters, halo, and the whole of it', async () => {
    const { scene } = await renderMarks({
      mark: 'text',
      chart: {},
      text: {
        x: 100,
        y: 50,
        value: 'faded',
        viewport: true,
        stroke: 'white',
        fillOpacity: 0.4,
        strokeOpacity: 0.25,
        opacity: 0.8,
      },
    });
    await expect.poll(() => scene.labelSets.flat().length).toBe(1);
    const [label] = scene.labelSets.flat();
    expect([label.fillOpacity, label.strokeOpacity, label.opacity]).toEqual([0.4, 0.25, 0.8]);

    const element = () =>
      [...document.querySelectorAll<HTMLElement>('.lc-webgl-label')].find(
        (e) => e.textContent?.trim() === 'faded'
      );
    await expect.poll(() => element()).toBeTruthy();
    const style = element()!.style;
    expect(style.opacity).toBe('0.8');
    expect(style.getPropertyValue('-webkit-text-fill-color')).toContain('40%');
    expect(style.getPropertyValue('-webkit-text-stroke')).toContain('25%');
  });

  it('takes them per row, as functions of it', async () => {
    const { scene } = await renderMarks({
      mark: 'text',
      chart: { xDomain: [0, 100], yDomain: [0, 100] },
      text: {
        data: [
          { x: 10, y: 10, o: 0.2 },
          { x: 50, y: 50, o: 0.6 },
        ],
        x: (d: any) => d.x,
        y: (d: any) => d.y,
        value: (d: any) => String(d.o),
        viewport: true,
        opacity: (d: any) => d.o,
      },
    });
    await expect.poll(() => scene.labelSets.flat().length).toBe(2);
    expect(scene.labelSets.flat().map((l) => l.opacity)).toEqual([0.2, 0.6]);
  });

  it('leaves a label without them as it was', async () => {
    const { scene } = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 100, y: 50, value: 'plain', viewport: true },
    });
    await expect.poll(() => scene.labelSets.flat().length).toBe(1);
    const [label] = scene.labelSets.flat();
    expect([label.fillOpacity, label.strokeOpacity, label.opacity]).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('paints a label lying on the surface at `fillOpacity`, and fades its plane by `opacity`', async () => {
    const solid = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 100, y: 50, value: 'solid', fill: 'black' },
    });
    await expect.poll(() => planes(solid.scene).length).toBe(1);
    const [plain] = planes(solid.scene);
    expect(peakAlpha(plain)).toBeGreaterThan(250);
    expect((plain.material as any).opacity).toBe(1);

    const { scene } = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 100, y: 50, value: 'faded', fill: 'black', fillOpacity: 0.5, opacity: 0.4 },
    });
    await expect.poll(() => planes(scene).length).toBe(1);
    const [plane] = planes(scene);
    // Its letters painted half opaque, and the plane drawn at 0.4
    expect(peakAlpha(plane)).toBeGreaterThan(110);
    expect(peakAlpha(plane)).toBeLessThan(145);
    expect((plane.material as any).opacity).toBeCloseTo(0.4);
  });
});

/** An instance's center (across, down the plot) and radius */
function placed(mesh: InstancedMesh, i = 0) {
  const matrix = new Matrix4();
  mesh.getMatrixAt(i, matrix);
  const position = new Vector3();
  const size = new Vector3();
  matrix.decompose(position, new Quaternion(), size);
  return { x: position.x, y: position.z, r: size.x };
}

/**
 * Which of `samples` points round a ring (at its radius, clockwise as the plot is seen from its
 * rightmost point) are drawn, rendered from above on its own
 */
function ringCoverage(ring: InstancedMesh, samples: number) {
  const { x, y, r } = placed(ring);
  const scene = new Scene();
  scene.add(ring);
  ring.updateMatrixWorld();
  const size = 128;
  const half = r * 1.25;
  const camera = new OrthographicCamera(-half, half, half, -half, 0.1, 1000);
  // Looking straight down, the plot's `y` (the scene's `z`) running down the screen
  camera.position.set(x, 100, y);
  camera.up.set(0, 0, -1);
  camera.lookAt(x, 0, y);
  const renderer = new WebGLRenderer();
  const target = new WebGLRenderTarget(size, size);
  renderer.setRenderTarget(target);
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);
  const pixels = new Uint8Array(size * size * 4);
  renderer.readRenderTargetPixels(target, 0, 0, size, size, pixels);
  renderer.setRenderTarget(null);
  renderer.dispose();
  target.dispose();
  return Array.from({ length: samples }, (_, k) => {
    const angle = ((k + 0.5) / samples) * Math.PI * 2;
    // Down the screen is up the rows read back
    const px = Math.round(size / 2 + ((Math.cos(angle) * r) / half) * (size / 2));
    const py = Math.round(size / 2 - ((Math.sin(angle) * r) / half) * (size / 2));
    return { angle, drawn: pixels[(py * size + px) * 4 + 3] > 0 };
  });
}

describe('dashed rings, as the core `Circle`’s `dashArray`', () => {
  it('dashes a `Circle`’s ring from its rightmost point, clockwise', async () => {
    const { scene } = await renderMarks({
      mark: 'circle',
      chart: {},
      circle: {
        cx: 100,
        cy: 80,
        r: 40,
        fill: 'none',
        stroke: 'black',
        strokeWidth: 4,
        dashArray: '10 30',
      },
    });
    await expect.poll(() => instanced(scene)[0]?.count ?? 0).toBe(1);
    const [ring] = instanced(scene);
    const material = ring.material as any;
    await expect.poll(() => material.defines.LC_RING_DASH).toBe('');
    const [dash, gap] = material.userData.ringDash.value.toArray();
    expect(gap / dash).toBeCloseTo(3);

    const { r } = placed(ring);
    const samples = ringCoverage(ring, 180);
    const expected = (around: number) => around % (dash + gap) <= dash;
    // Where its dashes fall, going clockwise from the rightmost point, and not the other way
    const clockwise = samples.filter((s) => s.drawn === expected(s.angle * r)).length;
    const counter = samples.filter((s) => s.drawn === expected((Math.PI * 2 - s.angle) * r)).length;
    expect(clockwise / samples.length).toBeGreaterThan(0.9);
    expect(counter).toBeLessThan(clockwise);
    // About a quarter of it drawn
    const share = samples.filter((s) => s.drawn).length / samples.length;
    expect(share).toBeGreaterThan(0.15);
    expect(share).toBeLessThan(0.35);
  });

  it('draws a ring without one whole, compiled without dashes', async () => {
    const { scene } = await renderMarks({
      mark: 'circle',
      chart: {},
      circle: { cx: 100, cy: 80, r: 40, fill: 'none', stroke: 'black', strokeWidth: 4 },
    });
    await expect.poll(() => instanced(scene)[0]?.count ?? 0).toBe(1);
    const [ring] = instanced(scene);
    expect((ring.material as any).defines.LC_RING_DASH).toBeUndefined();
    const samples = ringCoverage(ring, 90);
    expect(samples.every((s) => s.drawn)).toBe(true);
  });

  it('dashes `Points`’ rings, and stops when it’s taken away', async () => {
    const rows = [
      { x: 2, y: 2 },
      { x: 7, y: 6 },
    ];
    const chartProps = { data: rows, x: 'x', y: 'y', xDomain: [0, 10], yDomain: [0, 10] };
    const { scene, rerender } = await renderMarks({
      mark: 'points',
      chart: chartProps,
      points: { r: 8, stroke: 'black', dashArray: [4, 2] },
    });
    await expect.poll(() => instanced(scene).length).toBe(2);
    const ring = instanced(scene)[1];
    const material = ring.material as any;
    await expect.poll(() => material.defines.LC_RING_DASH).toBe('');
    const [dash, gap] = material.userData.ringDash.value.toArray();
    expect(dash / gap).toBeCloseTo(2);
    // The points' discs aren't dashed
    expect((instanced(scene)[0].material as any).defines?.LC_RING_DASH).toBeUndefined();

    await rerender({ points: { r: 8, stroke: 'black' } });
    await expect.poll(() => material.defines.LC_RING_DASH).toBeUndefined();
  });
});

describe('Highlight, with the core `Highlight`’s point events', () => {
  const row = { x: 4, y: 6 };
  const chartProps = { data: [row], x: 'x', y: 'y', xDomain: [0, 10], yDomain: [0, 10] };
  const marker = () => document.querySelector<SVGCircleElement>('.lc-webgl-markers circle');

  it('calls `onPointClick`, `onPointEnter`, and `onPointLeave` with its point and row', async () => {
    const calls: [string, any][] = [];
    await renderMarks({
      mark: 'highlight',
      chart: chartProps,
      highlight: {
        data: row,
        points: true,
        motion: 'none',
        onPointClick: (_e: MouseEvent, detail: any) => calls.push(['click', detail]),
        onPointEnter: (_e: MouseEvent, detail: any) => calls.push(['enter', detail]),
        onPointLeave: (_e: MouseEvent, detail: any) => calls.push(['leave', detail]),
      },
    });
    await expect.poll(() => marker()).toBeTruthy();
    // Taking the pointer, as a clickable point
    expect(marker()!.style.pointerEvents).toBe('auto');
    expect(marker()!.style.cursor).toBe('pointer');

    marker()!.dispatchEvent(new PointerEvent('pointerenter'));
    marker()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    marker()!.dispatchEvent(new PointerEvent('pointerleave'));
    expect(calls.map(([type]) => type)).toEqual(['enter', 'click', 'leave']);
    const [, { point, data }] = calls[1];
    expect(data).toBe(row);
    expect(point.x).toBeCloseTo(chart!.xScale(4));
    expect(point.y).toBeCloseTo(chart!.yScale(6));
    expect(point.data).toEqual({ x: 4, y: 6 });
  });

  it('lets the pointer through to the scene without them', async () => {
    await renderMarks({
      mark: 'highlight',
      chart: chartProps,
      highlight: { data: row, points: true, motion: 'none' },
    });
    await expect.poll(() => marker()).toBeTruthy();
    expect(marker()!.style.pointerEvents).toBe('');
    expect(getComputedStyle(marker()!).pointerEvents).toBe('none');
  });
});

describe('Axis, with the core `Axis`’ `tickOcclusion`', () => {
  const flat = { x: 'x', y: 'y', xDomain: [0, 10], yDomain: [0, 10] };
  const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const format = (d: number) => `Wednesday ${d}`;
  const texts = (scene: SceneState) => scene.labelSets.flat().map((l) => l.text);

  it('keeps every tick without it', async () => {
    const { scene } = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: { placement: 'bottom', ticks, format, tickLabelProps: { viewport: true } },
    });
    await expect.poll(() => texts(scene).length).toBe(11);
  });

  it('drops tick labels that would overlap, keeping the last (`end`) by default', async () => {
    const { scene } = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: {
        placement: 'bottom',
        ticks,
        format,
        tickOcclusion: true,
        tickLabelProps: { viewport: true },
      },
    });
    await expect.poll(() => texts(scene).length).toBeGreaterThan(1);
    const kept = texts(scene);
    expect(kept.length).toBeLessThan(11);
    expect(kept.at(-1)).toBe('Wednesday 10');
  });

  it('keeps the first with `priority: start`, and both ends with `start-end`', async () => {
    const start = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: {
        placement: 'bottom',
        ticks,
        format,
        tickOcclusion: { priority: 'start' },
        tickLabelProps: { viewport: true },
      },
    });
    await expect.poll(() => texts(start.scene).length).toBeGreaterThan(1);
    expect(texts(start.scene)[0]).toBe('Wednesday 0');
    expect(texts(start.scene).length).toBeLessThan(11);

    const ends = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: {
        placement: 'bottom',
        ticks,
        format,
        tickOcclusion: { priority: 'start-end' },
        tickLabelProps: { viewport: true },
      },
    });
    await expect.poll(() => texts(ends.scene).length).toBeGreaterThan(1);
    expect(texts(ends.scene)[0]).toBe('Wednesday 0');
    expect(texts(ends.scene).at(-1)).toBe('Wednesday 10');
  });

  it('drops the tick marks and labels lying on the floor with them', async () => {
    const { scene } = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: { placement: 'bottom', ticks, format, tickOcclusion: true },
    });
    await expect.poll(() => planes(scene).length).toBeGreaterThan(1);
    const labels = planes(scene).length;
    expect(labels).toBeLessThan(11);
    const marks = () => {
      const lines = layered(scene).filter((o) => (o as any).isLineSegments2) as any[];
      return Math.max(
        ...lines.map((l) => (l.visible ? l.geometry.attributes.instanceStart.count : 0))
      );
    };
    await expect.poll(marks).toBe(labels);
  });

  it('keeps every tick in a 3D view, whose labels turn with it', async () => {
    const { scene } = await renderMarks({
      mark: 'axis',
      chart: { ...flat, view: perspective },
      axis: {
        placement: 'bottom',
        ticks,
        format,
        tickOcclusion: true,
        tickLabelProps: { viewport: true },
      },
    });
    await expect.poll(() => texts(scene).length).toBe(11);
  });
});

describe('contourSegments, with `smooth`', () => {
  // A peak in the middle of a 4 × 4 grid
  const grid = {
    values: Float64Array.from([0, 0, 0, 0, 0, 3, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0]),
    columns: 4,
    rows: 4,
    left: 0,
    top: 0,
    right: 4,
    bottom: 4,
  };
  /** Each segment end across and down, in cells */
  const ends = (segments: number[]) =>
    segments.flatMap((_, i) => (i % 3 === 0 ? [segments[i], segments[i + 2]] : []));

  it('interpolates where lines cross between cells by default', () => {
    const smooth = ends(contourSegments(grid, [0, 3], [0.25], () => 0));
    expect(smooth.some((v) => !Number.isInteger(v * 2))).toBe(true);
  });

  it('runs them halfway between cells with `smooth: false`', () => {
    const crisp = ends(contourSegments(grid, [0, 3], [0.25], () => 0, { smooth: false }));
    expect(crisp.length).toBeGreaterThan(0);
    expect(crisp.every((v) => Number.isInteger(v * 2))).toBe(true);
  });
});
