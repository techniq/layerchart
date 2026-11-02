import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import {
  Matrix4,
  Quaternion,
  Ray,
  Vector3,
  type InstancedMesh,
  type Object3D,
  type PerspectiveCamera,
} from 'three';

import { geoIdentity } from 'd3-geo';
import type { ChartState } from 'layerchart';
import type { SceneState } from '../contexts/scene.svelte.js';
import { getSphere, globe } from '../utils/globe.js';
import { viewAngles } from '../utils/camera.js';
import { orthographic, perspective } from '../index.js';
import Marks from './__fixtures__/Marks.svelte';

/** Render, and wait for the marks to add their objects to the scene */
async function renderMarks(props: Omit<Parameters<typeof render<typeof Marks>>[1], 'onScene'>) {
  let scene: SceneState | undefined;
  render(Marks, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
      latest = s;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

let chart: ChartState<any> | undefined;
/** The scene most recently set up: a chart's lazily loaded transform remounts its layers */
let latest: SceneState | undefined;

/** The scene once the chart's transform has loaded (and remounted the layer), with its marks */
async function withTransform() {
  await expect.poll(() => chart?.transformState).toBeTruthy();
  await expect.poll(() => latest?.root.children.length ?? 0).toBeGreaterThan(0);
  return latest!;
}

/** `read()` once it stops changing (ex. the camera, once the chart has laid out and fitted it) */
async function settled(read: () => number) {
  let last = NaN;
  await expect
    .poll(
      () => {
        const value = read();
        const same = Math.abs(value - last) < 1e-6;
        last = value;
        return same;
      },
      { interval: 50 }
    )
    .toBe(true);
  return read();
}

/** How far a perspective camera is from what it looks at (its near plane is a hundredth of it) */
const reach = (scene: SceneState) => (scene.camera as PerspectiveCamera).near * 100;

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

describe('Surface', () => {
  it("widens the chart's `z` domain to its values", async () => {
    await renderMarks({
      mark: 'surface',
      chart: { xDomain: [0, 1], yDomain: [0, 1] },
      surface: { value: (x: number, y: number) => 10 + 30 * x * y, pixelSize: 20 },
    });
    await expect.poll(() => chart?.zScale.domain()[1]).toBeGreaterThan(35);
  });

  it('eases to a new function with `motion`, rather than jumping', async () => {
    let scene: SceneState | undefined;
    const props = (value: (x: number, y: number) => number) => ({
      mark: 'surface' as const,
      chart: { xDomain: [0, 1], yDomain: [0, 1], zDomain: [0, 10], zRange: [0, 100] },
      surface: { value, pixelSize: 40, motion: { type: 'tween' as const, duration: 400 } },
      onScene: (s: SceneState) => (scene = s),
    });
    // Taking both `x` and `y`, so they're sampled as functions
    const { rerender } = render(
      Marks,
      props((x, _y) => x)
    );
    /** The surface's highest point */
    const top = () => {
      const mesh = scene?.root.children.find((o: any) => o.isMesh) as any;
      const position = mesh?.geometry.getAttribute('position');
      if (!position) return NaN;
      let max = -Infinity;
      for (let i = 0; i < position.count; i++) max = Math.max(max, position.getY(i));
      return max;
    };
    await expect.poll(() => top() > 0).toBe(true);
    const start = top();

    await rerender(props((x, _y) => x * 10));
    // On its way up...
    await expect.poll(() => top() > start * 1.5 && top() < start * 9.5).toBe(true);
    // ...and there
    await expect.poll(top).toBeCloseTo(start * 10);
  });

  it('draws many contour lines without overflowing the stack', async () => {
    const scene = await renderMarks({
      mark: 'surface',
      chart: { xDomain: [-1, 1], yDomain: [-1, 1] },
      // Rings packed tight, as `sin(x² + y²)` draws them
      surface: {
        value: (x: number, y: number) => Math.sin((x * x + y * y) * Math.PI * 6),
        pixelSize: 2,
        contours: 20,
      },
    });
    const lines = scene.root.children.find((o: any) => o.isLineSegments) as any;
    await expect
      .poll(() => lines.geometry.getAttribute('position')?.count ?? 0)
      .toBeGreaterThan(50_000);
  });

  it('leaves holes where values are missing', async () => {
    const scene = await renderMarks({
      mark: 'surface',
      chart: { xDomain: [0, 1], yDomain: [0, 1] },
      // Two parameters, as a function sampled across the plot (as `Raster` reads `value`)
      surface: { value: (x: number, _y: number) => (x < 0.5 ? NaN : 1), pixelSize: 20 },
    });
    const mesh = scene.root.children.find((o: any) => o.isMesh) as any;
    await expect.poll(() => mesh.geometry.index?.count ?? 0).toBeGreaterThan(0);
    // Only the cells with all four corners in the right half are drawn
    const positions = mesh.geometry.getAttribute('position');
    const used = new Set<number>(Array.from(mesh.geometry.index.array as ArrayLike<number>));
    for (const k of used) expect(positions.getX(k)).toBeGreaterThan(400 * 0.45);
  });
});

describe('GeoPath', () => {
  it('extrudes features by `z`, through the chart’s projection', async () => {
    const square = {
      type: 'Feature' as const,
      properties: { height: 20 },
      // Clockwise, as d3-geo reads an outside ring
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [10, 10],
            [10, 100],
            [100, 100],
            [100, 10],
            [10, 10],
          ],
        ],
      },
    };
    const scene = await renderMarks({
      mark: 'geopath',
      chart: { geo: { projection: geoIdentity } },
      geopath: { geojson: square, z: 20 },
    });
    const mesh = scene.root.children.find((o: any) => o.isMesh) as any;
    await expect.poll(() => mesh.geometry.getAttribute('position')?.count ?? 0).toBeGreaterThan(0);
    mesh.geometry.computeBoundingBox();
    expect(mesh.geometry.boundingBox.max.y).toBeCloseTo(20);
  });
});

describe('Bin', () => {
  // Five rows in one corner, one in the other
  const rows = [...Array.from({ length: 5 }, () => ({ x: 1, y: 1 })), { x: 9, y: 9 }];

  it('stands a prism per cell, as tall as `z` puts its count', async () => {
    const scene = await renderMarks({
      mark: 'bin',
      chart: { data: rows, x: 'x', y: 'y', xDomain: [0, 10], yDomain: [0, 10], zRange: [0, 100] },
      bin: { size: 40, z: 'count' },
    });
    await expect
      .poll(() => (children(scene, 'isInstancedMesh')[0] as InstancedMesh)?.count)
      .toBe(2);
    const mesh = children(scene, 'isInstancedMesh')[0] as InstancedMesh;
    const heights = [0, 1].map((i) => {
      const matrix = new Matrix4();
      mesh.getMatrixAt(i, matrix);
      return new Vector3().setFromMatrixScale(matrix).y;
    });
    // The `z` domain reaches the fullest cell, five
    expect(Math.max(...heights)).toBeCloseTo(100);
    expect(Math.min(...heights)).toBeCloseTo(20);
  });
});

describe('Points hover', () => {
  it('keeps a whole rewrite whole when a hover lands before it is drawn', async () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({ x: i % 5, y: Math.floor(i / 5) }));
    let scene: SceneState | undefined;
    let ctx: ChartState<any> | undefined;
    const props = (r: number) => ({
      mark: 'points' as const,
      chart: { data: rows, x: 'x', y: 'y', xDomain: [0, 5], yDomain: [0, 5], tooltipContext: true },
      points: { r, tooltip: true },
      onScene: (s: SceneState, c: ChartState<any>) => {
        scene = s;
        ctx = c;
      },
    });
    const { rerender } = render(Marks, props(2) as any);
    await expect.poll(() => scene && children(scene, 'isInstancedMesh').length).toBe(1);
    const mesh = () => children(scene!, 'isInstancedMesh')[0] as InstancedMesh;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Every row rewritten (a new size), and a hover, before the next frame draws
    rerender(props(3) as any);
    const rect = ctx!.containerRef!.getBoundingClientRect();
    const e = new PointerEvent('pointermove', { clientX: rect.x + 10, clientY: rect.y + 10 });
    Object.defineProperty(e, 'target', { value: ctx!.containerRef });
    ctx!.tooltip.show(e, rows[7]);
    await Promise.resolve();
    await Promise.resolve();

    // The whole buffer goes to the GPU, not only the hovered rows
    expect(ctx!.tooltip.data).toBe(rows[7]);
    expect(mesh().instanceMatrix.updateRanges).toHaveLength(0);
  });
});

describe('Points glow and image', () => {
  it('draws glowing points unlit, in their own color', async () => {
    const scene = await renderMarks({
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      points: { glow: true },
    });
    const [mesh] = children(scene, 'isInstancedMesh') as InstancedMesh[];
    await expect.poll(() => (mesh.material as any).isMeshBasicMaterial).toBe(true);
  });

  it('wraps rows with an image in it, each its own sphere, and the rest as instances', async () => {
    // A canvas, drawn already, so nothing has to load
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 4;
    const scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [
          { x: 1, y: 1, image: canvas },
          { x: 2, y: 2 },
        ],
        x: 'x',
        y: 'y',
      },
      points: { image: (d: { image?: HTMLCanvasElement }) => d.image, r: 10, tilt: 30 },
    });
    const meshes = () =>
      scene.root.children.filter((o: any) => o.isMesh && !o.isInstancedMesh && o.material?.map);
    await expect.poll(() => meshes().length).toBe(1);
    const [sphere] = meshes() as any[];
    expect(sphere.scale.x).toBeCloseTo(10);
    // Leaning 30° from upright
    const axis = new Vector3(0, 1, 0).applyQuaternion(sphere.quaternion);
    expect((Math.acos(axis.y) * 180) / Math.PI).toBeCloseTo(30);
    const [instanced] = children(scene, 'isInstancedMesh') as InstancedMesh[];
    await expect.poll(() => instanced.count).toBe(1);
  });
});

describe('placed as LayerChart places its namesakes', () => {
  const rows = [
    { x: 2, y: 8, h: 5, name: 'a' },
    { x: 6, y: 4, h: 0, name: 'b' },
  ];
  const chartProps = {
    data: rows,
    x: 'x',
    y: 'y',
    xDomain: [0, 10],
    yDomain: [0, 10],
    zDomain: [0, 10],
    zRange: [0, 100],
    view: perspective,
  };

  it("labels each row through the chart's scales with `Text`, facing the viewer with `viewport`", async () => {
    const scene = await renderMarks({
      mark: 'text',
      chart: chartProps,
      text: { data: rows, x: 'x', y: 'y', z: 'h', value: 'name', viewport: true },
    });
    await expect.poll(() => scene.labelSets.flat().length).toBe(2);
    const [a, b] = scene.labelSets.flat();
    expect([a.text, b.text]).toEqual(['a', 'b']);
    expect(a.x).toBeCloseTo(chart!.xScale(2));
    expect(a.y).toBeCloseTo(chart!.yScale(8));
    expect(a.z).toBeCloseTo(50);
    // Numbers are pixels
    expect(b.z).toBe(0);
  });

  it("lays `Text` on the surface without `viewport`, labelling the chart's rows", async () => {
    // `x` / `y` reading rows, so it labels the chart's
    const scene = await renderMarks({
      mark: 'text',
      chart: chartProps,
      text: { x: 'x', y: 'y', value: 'name' },
    });
    await expect
      .poll(() => {
        let planes = 0;
        scene.root.traverse((o) => {
          if ((o as any).isMesh && (o as any).material?.map) planes++;
        });
        return planes;
      })
      .toBe(2);
    expect(scene.labelSets.flat()).toHaveLength(0);
    // Each at its row's place, `z` through the chart's `z` scale (the chart's `z` is unset: 0)
    const planes: Object3D[] = [];
    scene.root.traverse((o) => {
      if ((o as any).isMesh && (o as any).material?.map) planes.push(o);
    });
    const [a] = planes;
    expect(a.position.x).toBeCloseTo(chart!.xScale(2));
    expect(a.position.z).toBeCloseTo(chart!.yScale(8));
    expect(a.position.y).toBeLessThan(1);
  });

  it('stands a `Rect` between its sides through the scales, floated by a `z` pair', async () => {
    const scene = await renderMarks({
      mark: 'rect',
      chart: chartProps,
      rect: {
        data: [{ x0: 1, x1: 3, y0: 6, y1: 8, depth: 2 }],
        x0: 'x0',
        x1: 'x1',
        y0: 'y0',
        y1: 'y1',
        z: (d: any) => [d.depth, d.depth + 1],
      },
    });
    const [mesh] = children(scene, 'isInstancedMesh') as InstancedMesh[];
    const matrix = new Matrix4();
    mesh.getMatrixAt(0, matrix);
    const position = new Vector3();
    const size = new Vector3();
    matrix.decompose(position, new Quaternion(), size);
    expect(position.x).toBeCloseTo(chart!.xScale(1));
    expect(position.z).toBeCloseTo(chart!.yScale(8));
    expect(size.x).toBeCloseTo(chart!.xScale(3) - chart!.xScale(1));
    expect(size.z).toBeCloseTo(chart!.yScale(6) - chart!.yScale(8));
    // Floats from 2 to 3 of the `z` domain's 10
    expect(position.y).toBeCloseTo(20);
    expect(size.y).toBeCloseTo(10);
  });

  it('draws a `Link` from `x1` / `y1` up to `z2`, its end defaulting to its start', async () => {
    const scene = await renderMarks({
      mark: 'link',
      chart: chartProps,
      link: { data: rows, x1: 'x', y1: 'y', z2: 'h' },
    });
    const segments = scene.root.children.find((o) => (o as any).isLineSegments2) as any;
    const ends = Array.from(segments.geometry.attributes.instanceStart.data.array as Float32Array);
    expect(ends.slice(0, 6).map((v) => Math.round(v))).toEqual([
      Math.round(chart!.xScale(2)),
      0,
      Math.round(chart!.yScale(8)),
      Math.round(chart!.xScale(2)),
      50,
      Math.round(chart!.yScale(8)),
    ]);
  });

  it("links a hierarchy's `source` and `target` nodes at their pixels", async () => {
    const scene = await renderMarks({
      mark: 'link',
      chart: chartProps,
      link: { data: [{ source: { x: 10, y: 20 }, target: { x: 30, y: 40 } }] },
    });
    const segments = scene.root.children.find((o) => (o as any).isLineSegments2) as any;
    const ends = Array.from(segments.geometry.attributes.instanceStart.data.array as Float32Array);
    expect(ends.slice(0, 6)).toEqual([10, 0, 20, 30, 0, 40]);
  });
});

describe('Axis', () => {
  const chartProps = {
    data: [{ x: 1, y: 1, z: 1 }],
    x: 'x',
    y: 'y',
    z: 'z',
    xDomain: [0, 10],
    yDomain: [0, 10],
    zDomain: [0, 10],
    view: perspective,
    transform: { mode: 'domain' as const },
  };
  /** The labels lying in the scene, rather than over it */
  const planes = (scene: SceneState) => {
    const found: Object3D[] = [];
    scene.root.traverse((o) => {
      if ((o as any).isMesh && (o as any).material?.map) found.push(o);
    });
    return found;
  };

  it('lays the floor’s tick labels on it, as an `isometric` chart’s', async () => {
    const scene = await renderMarks({
      mark: 'axis',
      chart: chartProps,
      axis: { placement: 'bottom', ticks: [0, 5, 10], label: 'x' },
    });
    await expect.poll(() => planes(scene).length).toBe(4);
    expect(scene.labelSets.flat()).toHaveLength(0);
    // Beside the plot box, so not clipped to it in `domain` mode
    expect(planes(scene).every((p) => p.parent!.userData.unclipped)).toBe(true);
  });

  it('faces the viewer with `tickLabelProps` / `labelProps` `viewport`', async () => {
    let scene = await renderMarks({
      mark: 'axis',
      chart: chartProps,
      axis: {
        placement: 'left',
        ticks: [0, 10],
        label: 'y',
        tickLabelProps: { viewport: true },
        labelProps: { viewport: true },
      },
    });
    await expect.poll(() => scene.labelSets.flat().map((l) => l.text)).toEqual(['0', '10', 'y']);
    expect(planes(scene)).toHaveLength(0);
  });

  it('stands the height axis’ labels on the back wall, turning with it', async () => {
    const scene = await renderMarks({
      mark: 'axis',
      chart: chartProps,
      axis: { placement: 'back', ticks: [0, 10] },
    });
    await expect.poll(() => planes(scene).length).toBe(2);
    expect(scene.labelSets.flat()).toHaveLength(0);
    // Upright on the wall where the far side across meets the near side down the plot
    const far = scene.far.x === 'min' ? 0 : chart!.width;
    for (const plane of planes(scene)) {
      expect(Math.abs(plane.position.x - far)).toBeLessThan(1);
      // Facing across the plot (towards the near side), not up
      const normal = (plane as any).geometry.attributes.normal;
      expect(Math.abs(normal.getX(0))).toBeCloseTo(1);
      expect(normal.getY(0)).toBeCloseTo(0);
    }
    const heights = planes(scene).map((p) => Math.round(p.position.y));
    expect(heights).toEqual([0, Math.round(chart!.zDepth)]);
  });
});

describe('Light', () => {
  it('shines from a place in the plot as a point light', async () => {
    const scene = await renderMarks({
      mark: 'light',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      light: { type: 'point', x: 40, y: 60, z: 10, shadow: false },
    });
    const light = () => scene.root.children.find((o: any) => o.isPointLight) as any;
    await expect.poll(() => !!light()).toBe(true);
    expect(light().position.toArray()).toEqual([40, 10, 60]);
    // Not fading with distance
    expect(light().decay).toBe(0);
  });

  it("turns off the scene's own lights", async () => {
    const scene = await renderMarks({
      mark: 'light',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
    });
    expect(scene.lights).toBe(1);
  });
});

describe('WebGL', () => {
  it('only takes a WebGL context near the screen', async () => {
    let scene: SceneState | undefined;
    const { container } = render(Marks, {
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      offset: 5000,
      onScene: (s: SceneState) => (scene = s),
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(container.querySelector('.lc-layout-webgl canvas')).toBeNull();

    container.querySelector('.lc-layout-webgl')!.scrollIntoView();
    await expect.poll(() => container.querySelector('.lc-layout-webgl canvas')).toBeTruthy();
    await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  });

  it('only zooms with `scrollActivationKey` held', async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        view: perspective,
        transform: { mode: 'canvas', scrollMode: 'scale', scrollActivationKey: 'meta' },
      },
    });
    await expect.poll(() => scene.camera?.position.length() ?? 0).toBeGreaterThan(0);
    // The transform loads lazily, remounting the layer
    scene = await withTransform();
    const canvas = document.querySelector('.lc-layout-webgl canvas')!;
    const wheel = (metaKey: boolean) =>
      canvas.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -200, metaKey, bubbles: true, cancelable: true })
      );

    const distance = () => reach(scene);
    const before = await settled(distance);

    wheel(false);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(chart!.transform.scale).toBe(1);
    expect(distance()).toBeCloseTo(before);

    wheel(true);
    await expect.poll(() => chart!.transform.scale).toBeGreaterThan(1);
    // Dollied in by as much as the transform zoomed
    await expect.poll(() => distance() * chart!.transform.scale).toBeCloseTo(before, 0);
    expect(distance()).toBeLessThan(before);
  });
});

describe('tooltip', () => {
  const square = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [10, 10],
          [10, 100],
          [100, 100],
          [100, 10],
          [10, 10],
        ],
      ],
    },
  };

  it('is off by default, leaving the pointer to other marks', async () => {
    const scene = await renderMarks({
      mark: 'geopath',
      chart: { geo: { projection: geoIdentity } },
      geopath: { geojson: square },
    });
    expect(scene.pickables.size).toBe(0);
  });

  it('picks each line of a `Spline` when set', async () => {
    const scene = await renderMarks({
      mark: 'spline',
      chart: { data: lines, x: 't', y: 'key', yScale: scaleBand(), z: 'value', g: 'key' },
      spline: { tooltip: true },
    });
    await expect.poll(() => scene.pickables.size).toBe(3);
  });

  it('makes the mark pickable when set', async () => {
    const scene = await renderMarks({
      mark: 'geopath',
      chart: { geo: { projection: geoIdentity } },
      geopath: { geojson: square, tooltip: true },
    });
    await expect.poll(() => scene.pickables.size).toBe(1);
  });
});

describe('globe', () => {
  const globeChart = {
    geo: { projection: globe, fitGeojson: { type: 'Sphere' } },
    data: [{ lon: 0, lat: 0 }],
    x: 'lon',
    y: 'lat',
  };

  it('lays longitude and latitude on a sphere standing on the floor', async () => {
    const scene = await renderMarks({ mark: 'points', chart: globeChart, points: { r: 2 } });
    const sphere = getSphere(chart!)!;
    expect(sphere).toBeTruthy();
    // 400 × 300: a radius of half the shorter side, in the middle of the floor
    expect(sphere.radius).toBeCloseTo(150);
    expect(sphere.center.map(Math.round)).toEqual([200, 150, 150]);

    // Longitude 0, latitude 0 faces the front of the plot
    const front = sphere.toScene(0, 0);
    expect(front[0]).toBeCloseTo(200);
    expect(front[1]).toBeCloseTo(150);
    expect(front[2]).toBeCloseTo(300);
    const [lon, lat] = sphere.fromScene(sphere.toScene(45, 30));
    expect(lon).toBeCloseTo(45);
    expect(lat).toBeCloseTo(30);

    // The point is on the surface there
    const [mesh] = children(scene, 'isInstancedMesh') as InstancedMesh[];
    const matrix = new Matrix4();
    mesh.getMatrixAt(0, matrix);
    const position = new Vector3().setFromMatrixPosition(matrix);
    expect(position.toArray().map((v) => Math.round(v))).toEqual([200, 150, 300]);
  });

  it('fits the camera on the sphere', async () => {
    const scene = await renderMarks({ mark: 'points', chart: globeChart, points: { r: 2 } });
    await expect.poll(() => scene.camera?.position.length() ?? 0).toBeGreaterThan(0);
    const camera = scene.camera!;
    camera.updateMatrixWorld();
    const ray = new Ray(camera.position, camera.getWorldDirection(new Vector3()));
    // The sphere's center, under the root that centers the floor
    expect(ray.distanceToPoint(new Vector3(0, 150, 0))).toBeLessThan(1);
  });
});

describe('view and transform', () => {
  it("looks from the view's angles, and straight down without one", async () => {
    const turned = await renderMarks({
      mark: 'points',
      chart: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        view: perspective({ rotate: 30, tilt: 40 }),
      },
    });
    await expect.poll(() => turned.camera?.position.length() ?? 0).toBeGreaterThan(0);
    const angles = viewAngles(turned.camera!.getWorldDirection(new Vector3()).negate());
    expect(angles.rotate).toBeCloseTo(30, 0);
    expect(angles.tilt).toBeCloseTo(40, 0);
    expect((turned.camera as any).isPerspectiveCamera).toBe(true);
  });

  it('draws flat, from directly above, without a view', async () => {
    const flat = await renderMarks({
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
    });
    await expect.poll(() => flat.camera?.position.length() ?? 0).toBeGreaterThan(0);
    expect((flat.camera as any).isOrthographicCamera).toBe(true);
    expect(viewAngles(flat.camera!.position).tilt).toBeLessThan(1);
  });

  it('lines up with flat layers without a view: each chart pixel where `Svg` would draw it', async () => {
    const scene = await renderMarks({
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y', padding: { left: 30, top: 10 } },
    });
    await expect.poll(() => scene.camera?.position.length() ?? 0).toBeGreaterThan(0);
    const at = scene.project(50, 20, 0)!;
    expect(at.x).toBeCloseTo(30 + 50, 0);
    expect(at.y).toBeCloseTo(10 + 20, 0);
  });

  it("moves the camera in with the chart's transform's zoom, and back on reset", async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        view: perspective,
        transform: { mode: 'canvas' },
      },
    });
    await expect.poll(() => scene.camera?.position.length() ?? 0).toBeGreaterThan(0);
    // The transform loads lazily, remounting the layer
    scene = await withTransform();
    const distance = () => reach(scene);
    const start = await settled(distance);

    chart!.transform.zoomIn();
    // Dollied in, as orbit controls zoom a perspective camera
    await expect.poll(distance).toBeLessThan(start * 0.85);

    chart!.transform.reset();
    await expect.poll(() => Math.round(distance())).toBe(Math.round(start));
  });

  it('clips to the plot box when the transform zooms the domain, as `Svg` does', async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        xDomain: [0, 10],
        yDomain: [0, 10],
        view: perspective,
        transform: { mode: 'domain' },
      },
    });
    scene = await withTransform();
    expect(scene.clip).toBe(true);
    expect(scene.plot).toEqual({ width: chart!.width, height: chart!.height });
    expect(scene.clipped(-5, 10)).toBe(true);
    expect(scene.clipped(10, chart!.height + 5)).toBe(true);
    expect(scene.clipped(10, 10)).toBe(false);
  });

  it("tells a `domain` transform where the floor is on screen, so it pans where it's dragged", async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        xDomain: [0, 10],
        yDomain: [0, 10],
        view: orthographic({ rotate: -30, tilt: 50 }),
        transform: { mode: 'domain' },
      },
    });
    scene = await withTransform();
    await expect.poll(() => chart!.viewFloorMatrix).toBeTruthy();
    // Orthographic lays the floor flat on screen, so the matrix holds across it
    const m = chart!.viewFloorMatrix!;
    const { left, top } = chart!.padding;
    for (const [x, y] of [
      [0, 0],
      [chart!.width, 30],
      [80, chart!.height],
    ]) {
      const drawn = scene.project(x, y, 0)!;
      expect(m.a * x + m.c * y + m.e + left).toBeCloseTo(drawn.x, 1);
      expect(m.b * x + m.d * y + m.f + top).toBeCloseTo(drawn.y, 1);
    }
  });

  it('draws shifted points where the scales put them, at every step of a pan and zoom', async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [
          { x: 2, y: 3 },
          { x: 8, y: 7 },
        ],
        x: 'x',
        y: 'y',
        xDomain: [0, 10],
        yDomain: [0, 10],
        transform: { mode: 'domain' },
      },
    });
    scene = await withTransform();
    const mesh = () => children(scene, 'isInstancedMesh')[0] as InstancedMesh;
    await new Promise((r) => setTimeout(r, 300));
    /** Where row `i` is drawn: placed, then shifted */
    const drawn = (i: number) => {
      const matrix = new Matrix4();
      mesh().getMatrixAt(i, matrix);
      const p = new Vector3().setFromMatrixPosition(matrix);
      const k = (mesh().material as any).userData.shift;
      return [p.x * k.x + k.y, p.z * k.z + k.w];
    };
    const steps: [number, { x: number; y: number }][] = [
      [1, { x: 30, y: 0 }],
      [2, { x: -50, y: 20 }],
      [1.5, { x: 10, y: -40 }],
    ];
    for (const [scale, translate] of steps) {
      chart!.transform.setScale(scale, { instant: true });
      chart!.transform.setTranslate(translate, { instant: true });
      await new Promise((r) => setTimeout(r, 30));
      for (const [i, d] of [
        [0, { x: 2, y: 3 }],
        [1, { x: 8, y: 7 }],
      ] as const) {
        const [x, y] = drawn(i);
        expect(x).toBeCloseTo(chart!.xScale(d.x), 0);
        expect(y).toBeCloseTo(chart!.yScale(d.y), 0);
      }
    }
  });

  it('moves points on the GPU as a linear domain pans, placing them again once it rests', async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: Array.from({ length: 50 }, (_, i) => ({ x: i % 10, y: Math.floor(i / 10) })),
        x: 'x',
        y: 'y',
        xDomain: [0, 10],
        yDomain: [0, 10],
        transform: { mode: 'domain' },
      },
    });
    scene = await withTransform();
    const mesh = () => children(scene, 'isInstancedMesh')[0] as InstancedMesh;
    const placed = () => mesh().instanceMatrix.version;
    // Settled first
    await new Promise((r) => setTimeout(r, 300));
    const before = placed();

    // A pan step: drawn shifted, the rows where they were placed
    chart!.transform.setTranslate({ x: 40, y: 0 }, { instant: true });
    await expect.poll(() => mesh().frustumCulled).toBe(false);
    expect(placed()).toBe(before);

    // At rest, placed again where the scales now put them
    await expect.poll(placed, { timeout: 2000 }).toBeGreaterThan(before);
    const matrix = new Matrix4();
    mesh().getMatrixAt(0, matrix);
    expect(new Vector3().setFromMatrixPosition(matrix).x).toBeCloseTo(chart!.xScale(0));
  });

  it('leaves other transforms unclipped (the camera moves instead), unless `clip` is set', async () => {
    const chartProps = {
      data: [{ x: 1, y: 1 }],
      x: 'x',
      y: 'y',
      view: perspective,
      transform: { mode: 'canvas' as const },
    };
    await renderMarks({ mark: 'points', chart: chartProps });
    expect((await withTransform()).clipped(-5, 10)).toBe(false);

    await renderMarks({ mark: 'points', chart: chartProps, scene: { clip: true } });
    expect((await withTransform()).clipped(-5, 10)).toBe(true);
  });

  it("stops the camera where the transform's `scaleExtent` stops its zoom", async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        view: perspective,
        transform: { mode: 'canvas', scaleExtent: [0.5, 2] },
      },
    });
    scene = await withTransform();
    const distance = () => reach(scene);
    const start = await settled(distance);

    for (let i = 0; i < 10; i++) chart!.transform.zoomIn();
    await expect.poll(() => chart!.transform.scale).toBe(2);
    await expect.poll(distance).toBeCloseTo(start / 2, 0);

    for (let i = 0; i < 10; i++) chart!.transform.zoomOut();
    await expect.poll(() => chart!.transform.scale).toBe(0.5);
    await expect.poll(distance).toBeCloseTo(start * 2, 0);
  });

  it('turns about where the view has been panned to', async () => {
    let scene = await renderMarks({
      mark: 'points',
      chart: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        view: perspective,
        transform: { mode: 'canvas', drag: 'rotate' },
      },
    });
    await expect.poll(() => scene.camera?.position.length() ?? 0).toBeGreaterThan(0);
    // The transform loads lazily, remounting the layer
    scene = await withTransform();
    const ray = () => {
      const camera = scene.camera!;
      camera.updateMatrixWorld();
      return new Ray(camera.position.clone(), camera.getWorldDirection(new Vector3()));
    };
    /** How near two rays pass each other */
    const between = (a: Ray, b: Ray) => {
      const normal = new Vector3().crossVectors(a.direction, b.direction);
      return Math.abs(b.origin.clone().sub(a.origin).dot(normal)) / normal.length();
    };

    chart!.transform.setTranslate({ x: 80, y: 0 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    const panned = ray();
    // Looking at somewhere other than the middle of the plot
    expect(panned.distanceToPoint(new Vector3(0, 0, 0))).toBeGreaterThan(10);

    chart!.transform.setRotation({ x: 0, y: 50 });
    await expect
      .poll(() => between(panned, ray()) < 1 && panned.direction.angleTo(ray().direction) > 0.2)
      .toBe(true);
    // Still looking at what was panned to, not the middle
    expect(ray().distanceToPoint(new Vector3(0, 0, 0))).toBeGreaterThan(10);
  });

  it('keeps a zoom when the plot box changes', async () => {
    let scene: SceneState | undefined;
    const props = (zRange: number[]) => ({
      mark: 'points' as const,
      chart: {
        data: [{ x: 1, y: 1, z: 1 }],
        x: 'x',
        y: 'y',
        z: 'z',
        zRange,
        view: perspective,
        transform: { mode: 'canvas' as const },
      },
      onScene: (s: SceneState, c: ChartState<any>) => {
        scene = s;
        chart = c;
      },
    });
    const { rerender } = render(Marks, props([0, 100]));
    await expect.poll(() => scene?.camera?.position.length() ?? 0).toBeGreaterThan(0);
    await expect.poll(() => chart?.transformState).toBeTruthy();
    const fitted = await settled(() => reach(scene!));
    chart!.transform.zoomIn();
    await expect.poll(() => reach(scene!)).toBeLessThan(fitted * 0.85);
    const scale = chart!.transform.scale;

    // A taller box refits the camera, still zoomed in by as much
    await rerender(props([0, 300]));
    await expect.poll(() => reach(scene!)).not.toBeCloseTo(fitted / scale, 0);
    const zoomed = reach(scene!);
    chart!.transform.reset();
    await expect.poll(() => chart!.transform.scale).toBe(1);
    await expect.poll(() => reach(scene!)).toBeCloseTo(zoomed * scale, 0);
  });
});

describe('GeoPath motion', () => {
  it('eases to a new height rather than jumping', async () => {
    const square = (height: number) => ({
      type: 'Feature' as const,
      properties: { height },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [10, 10],
            [10, 100],
            [100, 100],
            [100, 10],
            [10, 10],
          ],
        ],
      },
    });
    let scene: SceneState | undefined;
    const { rerender } = render(Marks, {
      mark: 'geopath',
      chart: { geo: { projection: geoIdentity as any } },
      geopath: { geojson: square(10), z: 10, motion: { type: 'tween', duration: 400 } },
      onScene: (s: SceneState) => (scene = s),
    });
    await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
    const top = () => {
      const mesh = scene!.root.children.find((o: any) => o.isMesh) as any;
      mesh.geometry.computeBoundingBox();
      return mesh.geometry.boundingBox?.max.y ?? 0;
    };
    await expect.poll(top).toBeCloseTo(10);

    await rerender({
      geopath: { geojson: square(40), z: 40, motion: { type: 'tween', duration: 400 } },
    });
    // Partway there, then all the way
    await expect.poll(top).toBeGreaterThan(11);
    expect(top()).toBeLessThan(39);
    await expect.poll(top).toBeCloseTo(40);
  });
});
