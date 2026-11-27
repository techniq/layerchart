import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Material, Mesh, Object3D, WebGLRenderer } from 'three';

import type { SceneState } from '../contexts/scene.svelte.js';
import Clips from './__fixtures__/Clips.svelte';

type Threlte = { scene: SceneState; render: () => void; renderer: WebGLRenderer };

/** Render a clip around a red rectangle filling the plot (and past it) */
async function renderClip(props: Omit<Parameters<typeof render<typeof Clips>>[1], 'onThrelte'>) {
  let threlte: Threlte | undefined;
  render(Clips, { ...(props as any), onThrelte: (t: Threlte) => (threlte = t) });
  await expect.poll(() => meshes(threlte?.scene).length).toBeGreaterThan(0);
  return threlte!;
}

function meshes(scene: SceneState | undefined) {
  const found: Mesh[] = [];
  scene?.root.traverse((o: Object3D) => {
    if ((o as Mesh).isMesh) found.push(o as Mesh);
  });
  return found;
}

/**
 * Whether the frame is painted at points of the chart (pixels across and down its 400 × 300),
 * drawn now and read before the browser shows it
 */
function painted(threlte: Threlte, points: [number, number][]) {
  threlte.render();
  const gl = threlte.renderer.getContext();
  const k = gl.drawingBufferWidth / 400;
  return points.map(([x, y]) => {
    const pixel = new Uint8Array(4);
    gl.readPixels(
      Math.round(x * k),
      Math.round(gl.drawingBufferHeight - y * k),
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixel
    );
    return pixel[3] > 128;
  });
}

/** Painted where expected, once the clip's ready (a mask's code loads first) */
async function expectPainted(threlte: Threlte, points: [number, number][], expected: boolean[]) {
  await expect.poll(() => painted(threlte, points)).toEqual(expected);
}

describe('RectClipPath', () => {
  it('clips to its rectangle with planes', async () => {
    const threlte = await renderClip({ clip: 'rect' });
    await expectPainted(
      threlte,
      [
        [50, 50],
        [150, 50],
        [50, 150],
        [300, 250],
      ],
      [true, false, false, false]
    );
    const material = meshes(threlte.scene)[0].material as Material;
    expect(material.clippingPlanes).toHaveLength(4);
    expect(material.userData.lcMask).toBeUndefined();
  });

  it('draws everything when `disabled`', async () => {
    const threlte = await renderClip({ clip: 'rect', disabled: true });
    await expectPainted(
      threlte,
      [
        [50, 50],
        [300, 250],
      ],
      [true, true]
    );
  });

  it('draws only outside its rectangle when `invert`', async () => {
    const threlte = await renderClip({ clip: 'rect', invert: true });
    await expectPainted(
      threlte,
      [
        [50, 50],
        [150, 50],
        [300, 250],
      ],
      [false, true, true]
    );
  });
});

describe('CircleClipPath', () => {
  it('clips to its circle, not its bounds', async () => {
    const threlte = await renderClip({ clip: 'circle' });
    // Its center, past its edge, and inside its bounds' corner but outside the circle
    await expectPainted(
      threlte,
      [
        [200, 150],
        [260, 150],
        [240, 190],
        [20, 20],
      ],
      [true, false, false, false]
    );
  });

  it('draws only outside its circle when `invert`', async () => {
    const threlte = await renderClip({ clip: 'circle', invert: true });
    await expectPainted(
      threlte,
      [
        [200, 150],
        [240, 190],
        [20, 20],
      ],
      [false, true, true]
    );
  });
});

describe('ClipPath', () => {
  it('clips to its `path`', async () => {
    const threlte = await renderClip({ clip: 'path' });
    await expectPainted(
      threlte,
      [
        [50, 50],
        [350, 250],
        [300, 50],
        [100, 250],
      ],
      [true, false, true, false]
    );
  });
});

describe('ClipPath with a `clip` snippet', () => {
  it('clips to its marks’ shapes, drawing none of them', async () => {
    const threlte = await renderClip({ clip: 'snippet' });
    await expectPainted(
      threlte,
      [
        [50, 50],
        [200, 150],
        [150, 50],
        [240, 190],
        [350, 250],
      ],
      [true, true, false, false, false]
    );
    // None of its marks in the scene: only what the clipped rectangle draws, as clipped otherwise
    const shown = meshes(threlte.scene).length;
    const plain = await renderClip({ clip: 'rect' });
    expect(shown).toBe(meshes(plain.scene).length);
  });
});

describe('ClipPath with SVG elements in its `clip` snippet', () => {
  it('clips to their shapes', async () => {
    const threlte = await renderClip({ clip: 'elements' });
    await expectPainted(
      threlte,
      [
        [50, 50],
        [200, 150],
        [150, 50],
        [240, 190],
        [350, 250],
      ],
      [true, true, false, false, false]
    );
  });
});

describe('GeoClipPath', () => {
  it('clips to its `geojson`, through the projection (centered on the plot)', async () => {
    const threlte = await renderClip({ clip: 'geo' });
    await expectPainted(
      threlte,
      [
        [250, 200],
        [150, 200],
        [350, 200],
        [50, 50],
      ],
      [true, false, false, false]
    );
  });

  it('draws only outside it when `invert`', async () => {
    const threlte = await renderClip({ clip: 'geo', invert: true });
    await expectPainted(
      threlte,
      [
        [250, 200],
        [150, 200],
        [350, 200],
        [50, 50],
      ],
      [false, true, true, true]
    );
  });
});

describe('ChartClipPath', () => {
  const padding = { left: 50, top: 50, right: 50, bottom: 50 };

  it('clips to the plot, though the scene doesn’t', async () => {
    const threlte = await renderClip({ clip: 'chart', padding });
    await expectPainted(
      threlte,
      [
        [200, 150],
        [25, 150],
        [200, 25],
      ],
      [true, false, false]
    );
  });

  it('clips to the chart, with its padding, when `full`', async () => {
    const threlte = await renderClip({ clip: 'chart', padding, full: true });
    await expectPainted(
      threlte,
      [
        [200, 150],
        [25, 150],
        [200, 25],
      ],
      [true, true, true]
    );
  });

  it('draws everything when `disabled`', async () => {
    const threlte = await renderClip({ clip: 'chart', padding, disabled: true });
    await expectPainted(
      threlte,
      [
        [200, 150],
        [25, 150],
      ],
      [true, true]
    );
  });
});

/** Whether any pixel is painted in a box of the chart (`[x0, y0, x1, y1]`), drawn now */
function paintedIn(threlte: Threlte, [x0, y0, x1, y1]: [number, number, number, number]) {
  threlte.render();
  const gl = threlte.renderer.getContext();
  const k = gl.drawingBufferWidth / 400;
  const width = Math.round((x1 - x0) * k);
  const height = Math.round((y1 - y0) * k);
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(
    Math.round(x0 * k),
    Math.round(gl.drawingBufferHeight - y1 * k),
    width,
    height,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels
  );
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 128) return true;
  return false;
}

describe('Clipped labels', () => {
  it('clips a label sharing its painting with one that isn’t', async () => {
    const threlte = await renderClip({ clip: 'labels' });
    // Both labels' planes, each with its own material: one clipped away, the other drawn
    await expect.poll(() => meshes(threlte.scene).length).toBe(2);
    await expect
      .poll(() => [
        paintedIn(threlte, [90, 100, 300, 160]),
        paintedIn(threlte, [90, 200, 300, 260]),
      ])
      .toEqual([false, true]);
    const [a, b] = meshes(threlte.scene);
    expect(a.material).not.toBe(b.material);
  });
});

describe('Area', () => {
  it('fills both sides of its baseline where its line crosses it, not a quad folded over', async () => {
    const threlte = await renderClip({ clip: 'crossing' });
    // Its top falls from 10 to -10 across the plot, crossing its zero baseline at the middle
    await expectPainted(
      threlte,
      [
        [100, 130],
        [300, 130],
        [300, 170],
        [100, 170],
      ],
      [true, false, true, false]
    );
  });
});
