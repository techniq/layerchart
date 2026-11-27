import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Object3D } from 'three';
import { isometric, type ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import Marks from './__fixtures__/Marks.svelte';

type Props = Omit<Parameters<typeof render<typeof Marks>>[1], 'onScene'>;

/** Render, and wait for the marks to add their objects to the scene */
async function renderMarks(props: Props) {
  let scene: SceneState | undefined;
  render(Marks, {
    ...(props as any),
    onScene: (s: SceneState, _c: ChartState<any>) => {
      scene = s;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

/** Classes for these tests, as Tailwind's would set them */
let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = `
    .t-red { color: rgb(255, 0, 0); }
    .t-none { fill: none; }
    .t-stroke-none { stroke: none; }
  `;
  document.head.append(style);
});
afterAll(() => style.remove());

/** The planes labels lying on the surface are painted on, in the order they're drawn */
const planes = (scene: SceneState) => {
  const found: any[] = [];
  scene.root.traverse((o: any) => {
    if (o.isMesh && o.material?.map) found.push(o);
  });
  return found;
};

/** Whether a label's painted canvas has a pixel mostly of `channel` (`0` red, `2` blue, ...) */
function painted(plane: any, test: (r: number, g: number, b: number, a: number) => boolean) {
  const image = plane.material.map.image as HTMLCanvasElement;
  const pixels = image.getContext('2d')!.getImageData(0, 0, image.width, image.height).data;
  for (let i = 0; i < pixels.length; i += 4) {
    if (test(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])) return true;
  }
  return false;
}

/** The objects marks put in the scene, looking through each mark's own layer */
const layered = (scene: SceneState) =>
  scene.root.children.flatMap((o) => (o.userData.layer ? o.children : [o]));

describe('Text, as the core `Text`', () => {
  it('starts at its point by default (`textAnchor` `start`)', async () => {
    const scene = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 100, y: 50, value: 'hello', fontSize: 12 },
    });
    await expect.poll(() => planes(scene).length).toBe(1);
    // Its plane's middle to the right of its point, not centered on it
    expect(planes(scene)[0].position.x).toBeGreaterThan(110);
  });

  it('draws no halo with a `stroke-none` class, over its `stroke` prop (as CSS does)', async () => {
    const blue = (r: number, g: number, b: number, a: number) => b > 200 && r < 60 && a > 100;
    const haloed = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 100, y: 50, value: 'hello', fontSize: 12, stroke: 'blue', strokeWidth: 4 },
    });
    await expect.poll(() => planes(haloed).length).toBe(1);
    expect(painted(planes(haloed)[0], blue)).toBe(true);

    const plain = await renderMarks({
      mark: 'text',
      chart: {},
      text: {
        x: 100,
        y: 50,
        value: 'hello',
        fontSize: 12,
        stroke: 'blue',
        strokeWidth: 4,
        class: 't-stroke-none',
      },
    });
    await expect.poll(() => planes(plain).length).toBe(1);
    expect(painted(planes(plain)[0], blue)).toBe(false);
  });

  it('shares one painting between labels a little apart in size, each shrunk to its own', async () => {
    const label = async (fontSize: number) => {
      const scene = await renderMarks({
        mark: 'text',
        chart: {},
        text: { x: 100, y: 50, value: 'shared', fontSize },
      });
      await expect.poll(() => planes(scene).length).toBe(1);
      return planes(scene)[0];
    };
    const a = await label(12);
    // A size changing a little (ex. fitted to a box as the view turns) paints nothing anew
    const b = await label(12.4);
    expect(b.material.map.image).toBe(a.material.map.image);
    expect(b.scale.x / a.scale.x).toBeCloseTo(12.4 / 12);
    // One a step apart is painted at its own size
    const c = await label(24);
    expect(c.material.map.image).not.toBe(a.material.map.image);
  });

  it('lays `segments` from its point, each in its own class’s text color', async () => {
    const scene = await renderMarks({
      mark: 'text',
      chart: {},
      text: {
        x: 100,
        y: 50,
        fontSize: 12,
        segments: [{ value: 'Hello', class: 't-red' }, { value: ' world' }],
      },
    });
    await expect.poll(() => planes(scene).length).toBe(2);
    const [hello, world] = planes(scene);
    expect(hello.position.x).toBeGreaterThan(100);
    expect(world.position.x).toBeGreaterThan(hello.position.x);
    const red = (r: number, g: number, b: number, a: number) => a > 200 && r > 200 && g < 60;
    expect(painted(hello, red)).toBe(true);
    expect(painted(world, red)).toBe(false);
  });

  it('wraps on an explicit newline, starting at its point', async () => {
    const scene = await renderMarks({
      mark: 'text',
      chart: {},
      text: { x: 0, y: 0, value: 'March\n2025', verticalAnchor: 'start', fontSize: 12 },
    });
    await expect.poll(() => planes(scene).length).toBe(1);
    const plane = planes(scene)[0];
    const image = plane.material.map.image as HTMLCanvasElement;
    // Two lines tall, and all of it right of `x` (not cut off at the plot's left edge)
    expect(image.height).toBeGreaterThan(image.width / 3);
    expect(plane.position.x).toBeGreaterThan(0);
  });
});

describe('Arc, as the core `Arc`', () => {
  it('leaves a `fill-none` track unfilled', async () => {
    const meshes = (scene: SceneState) =>
      layered(scene).filter((o: Object3D) => (o as any).isMesh && (o as any).visible !== false);
    const filled = await renderMarks({
      mark: 'arc',
      chart: {},
      arc: { value: 0, outerRadius: 80, innerRadius: 70, track: { class: 't-none' } },
    });
    // Only drawn where there's something to draw
    await expect.poll(() => filled.root.children.length).toBeGreaterThan(0);
    const triangles = meshes(filled).reduce(
      (sum, mesh: any) => sum + (mesh.geometry?.attributes?.position?.count ?? 0),
      0
    );
    expect(triangles).toBe(0);
  });
});

describe('Contour, as the core `Contour`', () => {
  // A cone: a ring of each threshold, closing along the grid's edges at the lowest
  const size = 20;
  const values = Array.from({ length: size * size }, (_, k) => {
    const [i, j] = [k % size, Math.floor(k / size)];
    return 100 - Math.hypot(i - size / 2, j - size / 2) * 5;
  });
  const lines = (scene: SceneState) =>
    layered(scene).find((o: any) => o.isLineSegments2 && o.visible) as any;

  it('draws raised unfilled bands as lines in their colors, through the grid’s edges', async () => {
    const scene = await renderMarks({
      mark: 'contour',
      chart: { zDomain: [0, 100], zRange: [0, 50], view: isometric() },
      contour: { data: values, width: size, height: size, z: 'value', fill: 'none' },
    });
    await expect.poll(() => !!lines(scene)).toBe(true);
    const segments = lines(scene);
    expect(segments.material.vertexColors).toBe(true);
    expect(segments.geometry.attributes.instanceColorStart).toBeTruthy();
    // Its lowest ring runs along the plot's left edge (`x` 0)
    const start = segments.geometry.attributes.instanceStart;
    const xs = Array.from({ length: start.count }, (_, i) => start.getX(i));
    expect(Math.min(...xs)).toBeCloseTo(0, 0);
  });

  it('keeps a `stroke` it is given, in one color', async () => {
    const scene = await renderMarks({
      mark: 'contour',
      chart: { zDomain: [0, 100], zRange: [0, 50], view: isometric() },
      contour: {
        data: values,
        width: size,
        height: size,
        z: 'value',
        fill: 'none',
        stroke: 'red',
      },
    });
    await expect.poll(() => !!lines(scene)).toBe(true);
    expect(lines(scene).material.vertexColors).toBe(false);
  });
});
