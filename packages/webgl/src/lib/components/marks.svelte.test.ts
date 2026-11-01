import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import {
  Matrix4,
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
import { perspective } from '../index.js';
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

describe('Light', () => {
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
    const scene = await renderMarks({
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
    // The transform loads lazily
    await expect.poll(() => chart?.transformState).toBeTruthy();
    const canvas = document.querySelector('.lc-layout-webgl canvas')!;
    const wheel = (metaKey: boolean) =>
      canvas.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -200, metaKey, bubbles: true, cancelable: true })
      );

    const distance = () => scene.camera!.position.length();
    const before = distance();

    wheel(false);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(chart!.transform.scale).toBe(1);
    expect(distance()).toBeCloseTo(before);

    wheel(true);
    await expect.poll(() => chart!.transform.scale).toBeGreaterThan(1);
    await expect.poll(distance).toBeLessThan(before * 0.95);
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
    const angles = viewAngles(turned.camera!.position.clone().sub(new Vector3(0, 0, 0)));
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
    const scene = await renderMarks({
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
    // The transform loads lazily
    await expect.poll(() => chart?.transformState).toBeTruthy();
    const distance = () => scene.camera!.position.length();
    const start = distance();

    chart!.transform.zoomIn();
    // Dollied in, as orbit controls zoom a perspective camera
    await expect.poll(distance).toBeLessThan(start * 0.85);

    chart!.transform.reset();
    await expect.poll(() => Math.round(distance())).toBe(Math.round(start));
  });

  it('turns about where the view has been panned to', async () => {
    const scene = await renderMarks({
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
    // The transform loads lazily
    await expect.poll(() => chart?.transformState).toBeTruthy();
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
    const fitted = scene!.camera!.position.length();
    chart!.transform.zoomIn();
    await expect.poll(() => scene!.camera!.position.length()).toBeLessThan(fitted * 0.85);
    const zoomed = scene!.camera!.position.length();

    // A taller box refits the camera farther out, still zoomed in by as much
    await rerender(props([0, 140]));
    await expect.poll(() => scene!.camera!.position.length()).toBeGreaterThan(zoomed * 1.05);
    expect(scene!.camera!.position.length()).toBeLessThan(fitted);
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
