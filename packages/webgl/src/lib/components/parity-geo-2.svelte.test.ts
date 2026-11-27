import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { geoIdentity, geoMercatorRaw, geoProjection, type GeoRawProjection } from 'd3-geo';
import { Color, Matrix4, Quaternion, Vector3, type InstancedMesh, type Object3D } from 'three';
import type { ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import Geo2 from './__fixtures__/Geo2.svelte';

type Props = Omit<Parameters<typeof render<typeof Geo2>>[1], 'onScene'>;

let chart: ChartState<any> | undefined;

/** Render, and wait for the marks to add their objects to the scene */
async function renderGeo(props: Props) {
  let scene: SceneState | undefined;
  render(Geo2, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

/** Every object under the scene's root */
function all(scene: SceneState) {
  const found: Object3D[] = [];
  scene.root.traverse((o) => void (o !== scene.root && found.push(o)));
  return found;
}
const instanced = (scene: SceneState) =>
  all(scene).filter((o) => (o as any).isInstancedMesh && (o as any).count > 0) as InstancedMesh[];
/** Outlines with segments drawn */
const outlines = (scene: SceneState) =>
  all(scene).filter(
    (o) =>
      (o as any).isLineSegments2 &&
      o.visible &&
      ((o as any).geometry.attributes.instanceStart?.count ?? 0) > 0
  );
const fills = (scene: SceneState) =>
  all(scene).filter(
    (o) => (o as any).isMesh && !(o as any).isInstancedMesh && !(o as any).isLineSegments2
  ) as any[];

/** An instance's center on the plot (across, down, and up), through the groups it's in */
function placed(mesh: InstancedMesh, i = 0, scene?: SceneState) {
  const matrix = new Matrix4();
  mesh.getMatrixAt(i, matrix);
  // Through the groups between it and the scene's root
  mesh.updateWorldMatrix(true, false);
  matrix.premultiply(mesh.matrixWorld);
  if (scene) matrix.premultiply(scene.root.matrixWorld.clone().invert());
  const position = new Vector3();
  const size = new Vector3();
  matrix.decompose(position, new Quaternion(), size);
  return { x: position.x, y: position.z, z: position.y, r: size.x };
}

const geo = { geo: { projection: geoIdentity } };

describe('GeoPoint', () => {
  it('draws a circle at its point through the projection', async () => {
    const scene = await renderGeo({
      mark: 'geopoint',
      chart: geo,
      geopoint: { lat: 50, long: 100, r: 5 },
    });
    await expect.poll(() => instanced(scene).length).toBeGreaterThan(0);
    const at = placed(instanced(scene)[0], 0, scene);
    const [px, py] = chart!.geo.projection!([100, 50])!;
    expect([at.x, at.y]).toEqual([expect.closeTo(px), expect.closeTo(py)]);
  });

  it('places its `children` at its point, as in an `Svg` layer', async () => {
    const scene = await renderGeo({
      mark: 'geopoint-children',
      chart: geo,
      geopoint: { lat: 50, long: 100 },
    });
    await expect.poll(() => instanced(scene).length).toBeGreaterThan(0);
    const at = placed(instanced(scene)[0], 0, scene);
    const [px, py] = chart!.geo.projection!([100, 50])!;
    expect([at.x, at.y]).toEqual([expect.closeTo(px), expect.closeTo(py)]);
  });
});

describe('Hull', () => {
  it('outlines its rows on a map', async () => {
    const scene = await renderGeo({
      mark: 'hull',
      chart: {
        ...geo,
        x: 'long',
        y: 'lat',
        data: [
          { long: 10, lat: 10 },
          { long: 40, lat: 10 },
          { long: 30, lat: 40 },
        ],
      },
      hull: { stroke: 'red' },
    });
    await expect.poll(() => outlines(scene).length).toBeGreaterThan(0);
  });
});

describe('GeoPath', () => {
  const square = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [10, 10],
        [10, 50],
        [50, 50],
        [50, 10],
        [10, 10],
      ],
    ],
  };

  it('draws no outline for a class of `stroke: none`', async () => {
    const scene = await renderGeo({
      mark: 'geopath',
      chart: geo,
      geopath: { geojson: square, class: 'geo2-fill-red geo2-stroke-none' },
    });
    await expect.poll(() => fills(scene).length).toBeGreaterThan(0);
    expect(outlines(scene)).toHaveLength(0);
  });

  it('stops at a point the projection can’t place, as an SVG path does', async () => {
    // A raw Mercator, with no clip extent, sends the pole off to infinity
    const scene = await renderGeo({
      mark: 'geopath',
      chart: {
        geo: {
          projection: () => geoProjection(geoMercatorRaw as unknown as GeoRawProjection).scale(30),
        },
      },
      geopath: {
        geojson: {
          type: 'Polygon',
          coordinates: [
            [
              [-20, -60],
              [20, -60],
              [20, -90],
              [-20, -60],
            ],
          ],
        },
        fill: 'red',
      },
    });
    await expect.poll(() => fills(scene).length).toBeGreaterThan(0);
    const positions = Array.from(
      fills(scene)[0].geometry.attributes.position.array as Float32Array
    );
    expect(positions.every(Number.isFinite)).toBe(true);
  });
});

describe('Vector', () => {
  it('takes a `class` of the row', async () => {
    const scene = await renderGeo({
      mark: 'vector',
      chart: { xDomain: [0, 10], yDomain: [0, 10] },
      vector: {
        data: [
          { x: 2, y: 5, party: 'a' },
          { x: 8, y: 5, party: 'b' },
        ],
        x: 'x',
        y: 'y',
        length: 30,
        shape: 'arrow-filled',
        class: (d: any) => (d.party === 'a' ? 'geo2-fill-red' : 'geo2-fill-blue'),
      },
    });
    const colors = () => {
      const mesh = fills(scene)[0];
      const color = mesh?.geometry.attributes.color;
      if (!color) return [];
      const seen = new Set<string>();
      for (let i = 0; i < color.count; i++) {
        seen.add(new Color(color.getX(i), color.getY(i), color.getZ(i)).getHexString());
      }
      return [...seen].sort();
    };
    await expect.poll(colors).toEqual(['0000ff', 'ff0000']);
  });
});

describe('Circle', () => {
  it('draws no ring for a `stroke` of `none`', async () => {
    const scene = await renderGeo({
      mark: 'circle',
      chart: {},
      circle: { cx: 100, cy: 50, r: 10, stroke: 'none' },
    });
    await expect.poll(() => instanced(scene).length).toBe(1);
  });

  it('is raised by the chart’s `z` in data mode, as the core `Circle`', async () => {
    const scene = await renderGeo({
      mark: 'circle',
      chart: {
        data: [{ x: 5, y: 5, z: 10 }],
        x: 'x',
        y: 'y',
        z: 'z',
        xDomain: [0, 10],
        yDomain: [0, 10],
        zDomain: [0, 10],
        zRange: [0, 100],
      },
      circle: { cx: 'x', cy: 'y', r: 4 },
    });
    await expect.poll(() => instanced(scene).length).toBeGreaterThan(0);
    expect(placed(instanced(scene)[0], 0, scene).z).toBeCloseTo(100);
  });
});

describe('Points', () => {
  it('draws a point at each value of an `x` of several, as the core `Points`', async () => {
    const scene = await renderGeo({
      mark: 'points',
      chart: {
        data: [
          { start: 2, end: 6, name: 'a' },
          { start: 4, end: 9, name: 'b' },
        ],
        x: ['start', 'end'],
        y: 'name',
        xDomain: [0, 10],
      },
      points: {},
    });
    await expect.poll(() => instanced(scene)[0]?.count).toBe(4);
    const across = [0, 1, 2, 3].map((i) => placed(instanced(scene)[0], i, scene).x);
    expect(across).toEqual([2, 6, 4, 9].map((v) => expect.closeTo(chart!.xScale(v))));
  });
});
