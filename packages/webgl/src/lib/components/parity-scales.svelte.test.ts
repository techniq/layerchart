import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { scaleBand } from 'd3-scale';
import { curveCatmullRomClosed } from 'd3-shape';
import { geoIdentity, geoMercator } from 'd3-geo';
import { Color, type Object3D } from 'three';
import type { ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import Marks from './__fixtures__/Marks.svelte';
import ParityScales from './__fixtures__/ParityScales.svelte';

let chart: ChartState<any> | undefined;

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

/** As `renderMarks`, for the marks `Marks.svelte` has no case for (`Grid`, `Raster`, ...) */
async function renderOthers(
  props: Omit<Parameters<typeof render<typeof ParityScales>>[1], 'onScene'>
) {
  let scene: SceneState | undefined;
  render(ParityScales, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

/** The objects marks put in the scene, looking through each mark's own layer */
const layered = (scene: SceneState) =>
  scene.root.children.flatMap((o) => (o.userData.layer ? o.children : [o]));

/** Everything in the scene that `is` */
function all(scene: SceneState, is: (o: any) => boolean) {
  const found: any[] = [];
  scene.root.traverse((o: Object3D) => {
    if (is(o)) found.push(o);
  });
  return found;
}
const visibleLines = (scene: SceneState) =>
  all(scene, (o) => o.isLineSegments2 && o.visible && o.geometry.attributes.instanceStart);

const square = {
  type: 'Feature' as const,
  properties: {},
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

describe('Contour', () => {
  it('fades raised lines by `strokeOpacity` and `opacity`, and blurs the grid by `blur`', async () => {
    const segmentsOf = async (blur: number) => {
      const scene = await renderMarks({
        mark: 'contour',
        chart: { xDomain: [0, 1], yDomain: [0, 1] },
        contour: {
          // A ridge, which a blur spreads (and so moves its lines)
          value: (x: number, _y: number) => (Math.abs(x - 0.5) < 0.05 ? 1 : 0),
          thresholds: [0.5],
          z: 2,
          stroke: 'black',
          strokeOpacity: 0.5,
          opacity: 0.5,
          blur,
        },
      });
      await expect.poll(() => visibleLines(scene).length).toBeGreaterThan(0);
      const [lines] = visibleLines(scene);
      expect(lines.material.opacity).toBeCloseTo(0.25);
      return Array.from(lines.geometry.attributes.instanceStart.data.array as Float32Array);
    };
    const sharp = await segmentsOf(0);
    const blurred = await segmentsOf(4);
    expect(blurred).not.toEqual(sharp);
  });

  it('raises lines by a function of the band, through the `z` scale', async () => {
    const scene = await renderMarks({
      mark: 'contour',
      chart: { xDomain: [0, 1], yDomain: [0, 1], zDomain: [0, 10], zRange: [0, 100] },
      contour: {
        value: (x: number, _y: number) => x,
        thresholds: [0.5],
        z: (band: { value: number }) => band.value * 10,
        stroke: 'black',
      },
    });
    await expect.poll(() => visibleLines(scene).length).toBeGreaterThan(0);
    const [lines] = visibleLines(scene);
    const start = lines.geometry.attributes.instanceStart.data.array as Float32Array;
    // `[x, height, y]`: 0.5 × 10 through the `z` scale, a pixel off the floor
    expect(start[1]).toBeCloseTo(51);
  });
});

describe('GeoPath', () => {
  const meshOf = (scene: SceneState) => layered(scene).find((o: any) => o.isMesh) as any;
  const linesOf = (scene: SceneState) => layered(scene).find((o: any) => o.isLineSegments2) as any;

  it('fades its fill by `fillOpacity` and its outlines by `strokeOpacity`', async () => {
    const scene = await renderMarks({
      mark: 'geopath',
      chart: { geo: { projection: geoIdentity } },
      geopath: {
        geojson: square,
        fill: 'gray',
        stroke: 'black',
        fillOpacity: 0.5,
        strokeOpacity: 0.25,
        opacity: 0.8,
      },
    });
    await expect.poll(() => meshOf(scene)?.material.opacity).toBeCloseTo(0.4);
    expect(linesOf(scene).material.opacity).toBeCloseTo(0.2);
  });

  it('draws through `geoTransform` and `curve`, as the core `GeoPath`', async () => {
    const extent = async (props: Record<string, any>) => {
      const scene = await renderMarks({
        mark: 'geopath',
        chart: { geo: { projection: geoIdentity } },
        geopath: { geojson: square, stroke: 'black', ...props },
      });
      await expect.poll(() => linesOf(scene)?.visible).toBe(true);
      const positions = linesOf(scene).geometry.attributes.instanceStart.data.array;
      const xs = Array.from(positions as Float32Array).filter((_, i) => i % 3 === 0);
      return { min: Math.min(...xs), count: xs.length };
    };
    const plain = await extent({});
    const moved = await extent({
      // The methods of a `geoTransform`, as the core `GeoPath` takes them
      geoTransform: (projection: any) => ({
        point(this: any, x: number, y: number) {
          const [px, py] = projection([x, y]);
          this.stream.point(px + 50, py);
        },
      }),
    });
    expect(moved.min - plain.min).toBeCloseTo(50);
    // A curve's outline follows it in many short lines, rather than the square's four
    const curved = await extent({ curve: curveCatmullRomClosed });
    expect(curved.count).toBeGreaterThan(plain.count * 4);
  });

  it('calls `onclick` with the path generator and the feature', async () => {
    const calls: any[] = [];
    const scene = await renderMarks({
      mark: 'geopath',
      chart: { geo: { projection: geoIdentity } },
      geopath: {
        geojson: square,
        fill: 'gray',
        onclick: (_e: MouseEvent, geoPath: any, feature: any) => calls.push([geoPath, feature]),
      },
    });
    await expect.poll(() => scene.pickables.size).toBeGreaterThan(0);
    // The handler the mark registers, as the pointer calls it with the feature it's over
    const [pickable] = [...scene.pickables];
    pickable.events?.()?.onclick?.(new MouseEvent('click'), { data: square });
    expect(calls).toHaveLength(1);
    expect(typeof calls[0][0]).toBe('function');
    expect(calls[0][0](square)).toMatch(/^M/);
    expect(calls[0][1]).toBe(square);
  });

  it('draws `children` in its place, given the path generator', async () => {
    const children = createRawSnippet((args: () => { geoPath: any }) => ({
      render: () => `<i data-parity-geopath="${args().geoPath ? 'yes' : 'no'}"></i>`,
    }));
    const scene = await renderMarks({
      mark: 'geopath',
      chart: { geo: { projection: geoIdentity } },
      geopath: { geojson: square, fill: 'gray', children },
    });
    await expect
      .poll(() =>
        document.querySelector('[data-parity-geopath]')?.getAttribute('data-parity-geopath')
      )
      .toBe('yes');
    expect(meshOf(scene).geometry.getAttribute('position')?.count ?? 0).toBe(0);
  });
});

describe('GeoTile', () => {
  const solid = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'rgb(10, 200, 30)';
    context.fillRect(0, 0, 256, 256);
    return canvas.toDataURL();
  };
  const image = solid();
  const area = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-10, -10],
          [-10, 10],
          [10, 10],
          [10, -10],
          [-10, -10],
        ],
      ],
    },
  };
  const meshes = (scene: SceneState) =>
    all(scene, (o) => o.isMesh && !o.userData.backdrop && o.material?.map);

  it('fades its tiles with its `group`', async () => {
    const scene = await renderMarks({
      mark: 'geotile',
      chart: { geo: { projection: geoMercator, fitGeojson: area } },
      geotile: { url: () => image, group: { opacity: 0.5 } },
    });
    await expect.poll(() => meshes(scene).length).toBeGreaterThan(0);
    await expect.poll(() => meshes(scene)[0].material.opacity).toBeCloseTo(0.5);
  });

  it('draws `children` in place of the tiles, given them', async () => {
    const children = createRawSnippet((args: () => { tiles: any[] }) => ({
      render: () => `<i data-parity-tiles="${args().tiles.length}"></i>`,
    }));
    const scene = await renderMarks({
      mark: 'geotile',
      chart: { geo: { projection: geoMercator, fitGeojson: area } },
      geotile: { url: () => image, children },
    });
    await expect
      .poll(() =>
        Number(document.querySelector('[data-parity-tiles]')?.getAttribute('data-parity-tiles'))
      )
      .toBeGreaterThan(0);
    expect(meshes(scene)).toHaveLength(0);
  });
});

describe('Highlight', () => {
  const data = [
    { x: 'a', y: 3 },
    { x: 'b', y: 5 },
  ];
  const chartProps = { data, x: 'x', y: 'y', xScale: scaleBand(), yDomain: [0, 10] };

  it('draws the row’s `bar`, calling `onBarClick` with it', async () => {
    const calls: any[] = [];
    const scene = await renderMarks({
      mark: 'highlight',
      chart: chartProps,
      highlight: {
        data: data[1],
        bar: { fill: 'red' },
        onBarClick: (_e: MouseEvent, detail: { data: any }) => calls.push(detail.data),
      },
    });
    await expect.poll(() => scene.pickables.size).toBeGreaterThan(0);
    const [pickable] = [...scene.pickables].filter((p) => p.events?.()?.onclick);
    pickable.events!()!.onclick!(new MouseEvent('click'), { data: data[1] });
    expect(calls).toEqual([data[1]]);
  });
});

describe('Highlight area', () => {
  const data = [
    { x: 'a', y: 3 },
    { x: 'b', y: 5 },
  ];

  it('calls `onAreaClick` with the highlighted row', async () => {
    const calls: any[] = [];
    const scene = await renderMarks({
      mark: 'highlight',
      chart: { data, x: 'x', y: 'y', xScale: scaleBand(), yDomain: [0, 10] },
      highlight: {
        data: data[0],
        area: true,
        onAreaClick: (_e: MouseEvent, detail: { data: any }) => calls.push(detail.data),
      },
    });
    await expect
      .poll(() => [...scene.pickables].filter((p) => p.events?.()?.onclick).length)
      .toBeGreaterThan(0);
    const [pickable] = [...scene.pickables].filter((p) => p.events?.()?.onclick);
    pickable.events!()!.onclick!(new MouseEvent('click'), { data: undefined });
    expect(calls).toEqual([data[0]]);
  });
});

describe('Axis', () => {
  const flat = { data: [{ x: 1, y: 1 }], x: 'x', y: 'y', xDomain: [0, 10], yDomain: [0, 10] };
  const viewportLabels = (scene: SceneState) => scene.labelSets.flat();

  it('places its `label` by `labelPlacement`', async () => {
    const xOf = async (labelPlacement: 'start' | 'middle' | 'end') => {
      const scene = await renderMarks({
        mark: 'axis',
        chart: flat,
        axis: {
          placement: 'bottom',
          ticks: [],
          label: 'x',
          labelPlacement,
          labelProps: { viewport: true },
        },
      });
      await expect.poll(() => viewportLabels(scene).length).toBe(1);
      return viewportLabels(scene)[0].x;
    };
    expect(await xOf('start')).toBeCloseTo(0);
    expect(await xOf('middle')).toBeCloseTo(chart!.width / 2);
    expect(await xOf('end')).toBeCloseTo(chart!.width);
  });

  it('ticks its own `domain`, and moves with `x` / `y` as a `Group`', async () => {
    const scene = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: {
        placement: 'left',
        domain: [0, 100],
        ticks: 2,
        tickLabelProps: { viewport: true },
        x: 20,
      },
    });
    await expect.poll(() => viewportLabels(scene).map((l) => l.text)).toContain('100');
    // On the left edge, moved 20 pixels across
    expect(Math.round(viewportLabels(scene)[0].x)).toBe(20);
  });

  it('draws its tick marks in `stroke`, and tick labels through `tickLabel`', async () => {
    const tickLabel = createRawSnippet((args: () => { props: any; index: number }) => ({
      render: () => `<i data-parity-tick="${args().props.value}"></i>`,
    }));
    const scene = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: { placement: 'bottom', ticks: [0, 5, 10], stroke: 'rgb(255, 0, 0)', tickLabel },
    });
    await expect
      .poll(() =>
        [...document.querySelectorAll('[data-parity-tick]')].map((e) =>
          e.getAttribute('data-parity-tick')
        )
      )
      .toEqual(['0', '5', '10']);
    const red = new Color('rgb(255, 0, 0)');
    await expect
      .poll(() => visibleLines(scene).some((l) => l.material.color.equals(red)))
      .toBe(true);
  });

  it('dashes its `grid` lines by their `dashArray`', async () => {
    const scene = await renderMarks({
      mark: 'axis',
      chart: flat,
      axis: { placement: 'left', ticks: [0, 5, 10], grid: { dashArray: 4 } },
    });
    await expect.poll(() => visibleLines(scene).some((l) => l.material.dashed)).toBe(true);
  });
});

describe('Grid', () => {
  const band = {
    data: [{ x: 'a' }, { x: 'b' }, { x: 'c' }],
    x: 'x',
    xScale: scaleBand().padding(0.2),
    yDomain: [0, 10],
  };
  /** Each visible line set's segment count */
  const xLineCount = (scene: SceneState) =>
    visibleLines(scene).map((l) => l.geometry.attributes.instanceStart.count);

  it('lines up with bands by `bandAlign`, one past the last between them', async () => {
    const center = await renderOthers({ mark: 'grid', chart: band, grid: { y: false, z: false } });
    await expect.poll(() => xLineCount(center)).toEqual([3]);
    const between = await renderOthers({
      mark: 'grid',
      chart: band,
      grid: { y: false, z: false, bandAlign: 'between' },
    });
    await expect.poll(() => xLineCount(between)).toEqual([4]);
  });

  it('styles each axis’ lines by its own props', async () => {
    const scene = await renderOthers({
      mark: 'grid',
      chart: { xDomain: [0, 10], yDomain: [0, 10] },
      grid: { x: { stroke: 'rgb(0, 0, 255)', strokeWidth: 3 }, y: true, z: false },
    });
    const blue = new Color('rgb(0, 0, 255)');
    await expect.poll(() => visibleLines(scene).length).toBe(2);
    const own = visibleLines(scene).find((l) => l.material.color.equals(blue));
    expect(own?.material.linewidth).toBe(3);
  });
});

describe('Raster', () => {
  it('blurs the image over `blur` cells', async () => {
    const pixelsOf = async (blur: number) => {
      const scene = await renderOthers({
        mark: 'raster',
        chart: { xDomain: [0, 1], yDomain: [0, 1] },
        raster: { data: [0, 0, 10, 0, 0], width: 5, height: 1, blur },
      });
      const mesh = () => all(scene, (o) => o.isMesh && o.material?.map)[0];
      await expect.poll(() => mesh()).toBeTruthy();
      return Array.from(mesh().material.map.image.data as Uint8Array);
    };
    const sharp = await pixelsOf(0);
    const blurred = await pixelsOf(1);
    expect(blurred).not.toEqual(sharp);
  });
});

describe('GeoRaster', () => {
  it('lays its image over `resolution` times as many points', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;
    const countOf = async (resolution: number) => {
      const scene = await renderOthers({
        mark: 'georaster',
        chart: { geo: { projection: geoIdentity, fitGeojson: square } },
        georaster: { image: canvas, resolution },
      });
      const mesh = () => all(scene, (o) => o.isMesh)[0];
      await expect
        .poll(() => mesh()?.geometry.getAttribute('position')?.count ?? 0)
        .toBeGreaterThan(0);
      return mesh().geometry.getAttribute('position').count;
    };
    const one = await countOf(1);
    const two = await countOf(2);
    expect(two / one).toBeGreaterThan(3);
  });
});
