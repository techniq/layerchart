import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import { Matrix4, Ray, Vector3, type InstancedMesh, type Object3D } from 'three';

import { geoIdentity } from 'd3-geo';
import type { ChartState } from 'layerchart';
import type { SceneState } from '../contexts/scene.svelte.js';
import { getSphere, globe } from '../utils/globe.js';
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

describe('Scene', () => {
  it('only takes a WebGL context near the screen', async () => {
    let scene: SceneState | undefined;
    const { container } = render(Marks, {
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      offset: 5000,
      onScene: (s: SceneState) => (scene = s),
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(container.querySelector('.lc-scene canvas')).toBeNull();

    container.querySelector('.lc-scene')!.scrollIntoView();
    await expect.poll(() => container.querySelector('.lc-scene canvas')).toBeTruthy();
    await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  });

  it('only zooms with `scrollActivationKey` held', async () => {
    const scene = await renderMarks({
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      scene: { controls: true, scrollActivationKey: 'meta' },
    });
    await expect.poll(() => scene.camera?.position.length() ?? 0).toBeGreaterThan(0);
    const canvas = document.querySelector('.lc-scene canvas')!;
    const distance = () => scene.camera!.position.length();
    const before = distance();
    const wheel = (metaKey: boolean) =>
      canvas.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 200, metaKey, bubbles: true, cancelable: true })
      );

    wheel(false);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(distance()).toBeCloseTo(before);

    wheel(true);
    await expect.poll(distance).not.toBeCloseTo(before);
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

describe('zoom and reset', () => {
  it('moves the camera in, and back to where it started', async () => {
    const scene = await renderMarks({
      mark: 'points',
      chart: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      scene: { controls: true },
    });
    await expect.poll(() => scene.camera?.position.length() ?? 0).toBeGreaterThan(0);
    const distance = () => scene.camera!.position.distanceTo(scene.root.position);
    const start = distance();

    scene.zoomBy(0.5, false);
    expect(distance()).toBeLessThan(start * 0.8);

    // Eased back
    scene.resetView();
    await expect.poll(() => Math.round(distance())).toBe(Math.round(start));
  });

  it('keeps a zoom when the plot box changes', async () => {
    let scene: SceneState | undefined;
    const { rerender } = render(Marks, {
      mark: 'points',
      chart: { data: [{ x: 1, y: 1, z: 1 }], x: 'x', y: 'y', z: 'z', zRange: [0, 100] },
      scene: { controls: true },
      onScene: (s: SceneState) => (scene = s),
    });
    await expect.poll(() => scene?.camera?.position.length() ?? 0).toBeGreaterThan(0);
    const camera = () => scene!.camera!;
    const fittedAt = () => camera().position.distanceTo(scene!.root.position);

    scene!.zoomBy(0.5, false);
    const zoomed = fittedAt();
    // A taller box refits the camera, still zoomed in by as much
    await rerender({
      chart: { data: [{ x: 1, y: 1, z: 1 }], x: 'x', y: 'y', z: 'z', zRange: [0, 140] },
    });
    await expect.poll(fittedAt).not.toBeCloseTo(zoomed, 0);
    scene!.resetView();
    await new Promise((resolve) => setTimeout(resolve, 700));
    // Reset is farther than the zoomed view at either height
    expect(fittedAt()).toBeGreaterThan(zoomed * 1.4);
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
