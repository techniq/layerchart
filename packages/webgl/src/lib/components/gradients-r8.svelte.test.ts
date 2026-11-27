import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Color, SRGBColorSpace, type Object3D } from 'three';
import type { ChartState } from 'layerchart';

import type { SceneState } from '../contexts/scene.svelte.js';
import { gradientAffine, paintOf, type LinearGradientPaint } from '../utils/paint.svelte.js';
import { ShapeContext } from '../utils/shapes.js';
import Paints from './__fixtures__/Paints.svelte';

let chart: ChartState<any> | undefined;

async function renderPaints(props: Omit<Parameters<typeof render<typeof Paints>>[1], 'onScene'>) {
  let scene: SceneState | undefined;
  render(Paints, {
    ...(props as any),
    onScene: (s: SceneState, c: ChartState<any>) => {
      scene = s;
      chart = c;
    },
  });
  await expect.poll(() => scene?.root.children.length ?? 0).toBeGreaterThan(0);
  return scene!;
}

function all(scene: SceneState, is: (o: any) => boolean) {
  const found: any[] = [];
  scene.root.traverse((o: Object3D) => {
    if (is(o)) found.push(o);
  });
  return found;
}

/** The merged meshes' vertices that have any, as `[x, y (down the plot), r, g, b, a]` (sRGB) */
function vertices(scene: SceneState) {
  const out: number[][] = [];
  const srgb = { r: 0, g: 0, b: 0 };
  for (const mesh of all(
    scene,
    (o) => o.isMesh && !o.isInstancedMesh && o.geometry.attributes.color?.itemSize === 4
  )) {
    const position = mesh.geometry.attributes.position;
    const color = mesh.geometry.attributes.color;
    for (let i = 0; i < position.count; i++) {
      new Color(color.getX(i), color.getY(i), color.getZ(i)).getRGB(srgb, SRGBColorSpace);
      out.push([position.getX(i), position.getZ(i), srgb.r, srgb.g, srgb.b, color.getW(i)]);
    }
  }
  return out;
}

const close = (a: number, b: number) => Math.abs(a - b) < 0.02;

describe('LinearGradient', () => {
  it('paints a rect from its first stop to its last across its own box', async () => {
    const scene = await renderPaints({ mark: 'rect', rect: { x: 50, width: 100 } });
    await expect.poll(() => vertices(scene).length).toBeGreaterThan(0);
    const points = vertices(scene);
    const left = points.filter((p) => close(p[0], 50));
    const right = points.filter((p) => close(p[0], 150));
    expect(left.length).toBeGreaterThan(0);
    expect(right.length).toBeGreaterThan(0);
    for (const p of left) expect([p[2], p[4]].map((v) => Math.round(v))).toEqual([1, 0]);
    for (const p of right) expect([p[2], p[4]].map((v) => Math.round(v))).toEqual([0, 1]);
    // Halfway, halfway between them (in sRGB, as SVG blends)
    const middle = points.filter((p) => close(p[0], 100));
    expect(middle.length).toBeGreaterThan(0);
    for (const p of middle) expect(close(p[2], 0.5) && close(p[4], 0.5)).toBe(true);
  });

  it('cuts a shape at a hard stop, each side in its own color (`userSpaceOnUse`)', async () => {
    const scene = await renderPaints({
      mark: 'rect',
      rect: { x: 0, y: 0, width: 100, height: 300 },
      gradient: {
        stops: [
          [0.5, 'rgb(255, 0, 0)'],
          [0.5, 'rgb(0, 0, 255)'],
        ],
        vertical: true,
        units: 'userSpaceOnUse',
      },
    });
    await expect.poll(() => vertices(scene).length).toBeGreaterThan(0);
    const points = vertices(scene);
    // Half the chart's height, as SVG's percentages of its viewport
    const cut = chart!.containerHeight / 2;
    const atCut = points.filter((p) => close(p[1], cut));
    expect(atCut.some((p) => p[2] > 0.99 && p[4] < 0.01)).toBe(true);
    expect(atCut.some((p) => p[4] > 0.99 && p[2] < 0.01)).toBe(true);
    for (const p of points.filter((p) => p[1] < cut - 1)) expect(p[2]).toBeGreaterThan(0.99);
    for (const p of points.filter((p) => p[1] > cut + 1)) expect(p[4]).toBeGreaterThan(0.99);
  });

  it("turns by `rotate` in its box's own space, as SVG's `gradientTransform`", () => {
    const paint = {
      type: 'linear',
      stops: [],
      classes: undefined,
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
      rotate: 90,
      units: 'objectBoundingBox',
      viewport: { width: 400, height: 300 },
    } satisfies LinearGradientPaint;
    const [a, b, c] = gradientAffine(paint, { x: 10, y: 20, width: 100, height: 200 });
    // Turned a quarter, it runs down the box: 0 at its top, 1 at its bottom
    expect(a).toBeCloseTo(0);
    expect(b * 20 + c).toBeCloseTo(0);
    expect(b * 220 + c).toBeCloseTo(1);
  });

  it("strokes a line with its stops' colors and alphas along it", async () => {
    const scene = await renderPaints({
      mark: 'spline',
      gradient: { stops: ['rgb(255 0 0 / 0.5)', 'rgb(0 0 255)'] },
    });
    await expect
      .poll(() => all(scene, (o) => o.isLine2 && o.geometry.attributes.instanceAlphaStart).length)
      .toBe(1);
    const [line] = all(scene, (o) => o.isLine2);
    const start = line.geometry.attributes.instanceColorStart;
    const alpha = line.geometry.attributes.instanceAlphaStart;
    // Red and half clear at its start, blue and opaque at its end
    expect(start.getX(0)).toBeGreaterThan(0.99);
    expect(alpha.getX(0)).toBeCloseTo(0.5);
    const end = line.geometry.attributes.instanceColorEnd;
    const last = end.count - 1;
    expect(end.getZ(last)).toBeGreaterThan(0.99);
    expect(line.geometry.attributes.instanceAlphaEnd.getX(last)).toBeGreaterThan(0.99);
  });

  it('strokes each run of rows a `stroke` function gives a gradient across its own bounds', async () => {
    const scene = await renderPaints({
      mark: 'spline',
      // The first stretch (row 0 to 1) red to blue, the next (row 1 to 2) plain green
      spline: { stroke: (d: { x: number }) => (d.x === 0 ? 'url(#run)' : 'rgb(0, 255, 0)') },
      gradient: { id: 'run' },
    });
    await expect
      .poll(() => all(scene, (o) => o.isLine2 && o.geometry.attributes.instanceAlphaStart).length)
      .toBe(1);
    const [line] = all(scene, (o) => o.isLine2);
    const start = line.geometry.attributes.instanceColorStart;
    const end = line.geometry.attributes.instanceColorEnd;
    const last = end.count - 1;
    // Red at its start, blue where the run ends (at row 1, not the line's end), then green
    expect(start.getX(0)).toBeGreaterThan(0.99);
    const at = line.geometry.attributes.instanceStart;
    const row1 = chart!.xScale(1);
    const before = [...Array(end.count).keys()].filter((k) => at.getX(k) < row1 - 0.5);
    expect(end.getZ(before[before.length - 1])).toBeGreaterThan(0.99);
    expect(end.getY(last)).toBeGreaterThan(0.99);
    expect(end.getX(last)).toBeLessThan(0.01);
  });

  it("fills an area and strokes its line across each's bounds", async () => {
    const scene = await renderPaints({ mark: 'area', gradient: { vertical: true } });
    await expect.poll(() => vertices(scene).length).toBeGreaterThan(0);
    const points = vertices(scene);
    const top = Math.min(...points.map((p) => p[1]));
    const bottom = Math.max(...points.map((p) => p[1]));
    for (const p of points.filter((p) => close(p[1], top))) expect(p[2]).toBeGreaterThan(0.99);
    for (const p of points.filter((p) => close(p[1], bottom))) expect(p[4]).toBeGreaterThan(0.99);
    const outlines = all(
      scene,
      (o) => o.isLineSegments2 && o.geometry.attributes.instanceAlphaStart
    );
    expect(outlines.length).toBe(1);
  });
});

describe('Pattern', () => {
  it('fills a rect with its tile, repeating from the plot origin', async () => {
    const scene = await renderPaints({
      mark: 'pattern',
      pattern: { size: 8, lines: { rotate: 45, color: 'red' }, background: 'white' },
    });
    await expect
      .poll(() => all(scene, (o) => o.isMesh && o.material.map && o.visible).length)
      .toBe(1);
    const [mesh] = all(scene, (o) => o.isMesh && o.material.map);
    const image = mesh.material.map.image as HTMLCanvasElement;
    expect(image.width).toBe(image.height);
    expect(image.width / 8).toBeGreaterThanOrEqual(2);
    // Each vertex's place in the tiles: its pixels over the tile's size
    const position = mesh.geometry.attributes.position;
    const uv = mesh.geometry.attributes.uv;
    for (let i = 0; i < position.count; i++) {
      expect(uv.getX(i)).toBeCloseTo(position.getX(i) / 8);
      expect(uv.getY(i)).toBeCloseTo(position.getZ(i) / 8);
    }
  });
});

describe('Pay only when used', () => {
  it('looks up no paint for a plain color, and draws a plain rect as an instance', async () => {
    const scene = await renderPaints({ mark: 'plain-rect' });
    expect(paintOf(scene, 'red')).toBeNull();
    expect(paintOf(scene, 'var(--color-primary)')).toBeNull();
    await expect.poll(() => all(scene, (o) => o.isInstancedMesh && o.count > 0).length).toBe(1);
    expect(vertices(scene).length).toBe(0);
  });
});

describe('ShapeContext', () => {
  it("outlines an arc the short way round a canvas' `arc` goes, across ±π", () => {
    // A rounded corner's arc (as `d3.arc` draws one), from just under π to just over -π
    const context = new ShapeContext();
    context.arc(0, 0, 10, Math.PI - 0.2, -Math.PI + 0.2);
    const [line] = context.lines;
    // All of it about the left of the circle, not most of a turn round through its right
    for (const [x] of line) expect(x).toBeLessThan(-9);
  });
});
