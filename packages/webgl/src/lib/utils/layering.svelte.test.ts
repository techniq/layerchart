import { afterEach, describe, expect, it } from 'vitest';
import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { rankLayer } from './layering.js';

describe('rankLayer', () => {
  const renderer = new WebGLRenderer({ stencil: true });
  const target = new WebGLRenderTarget(8, 8, { depthBuffer: true, stencilBuffer: true });
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.set(0, 0, 5);
  let scene = new Scene();
  afterEach(() => (scene = new Scene()));

  /** A square facing the camera, `size` across, `near` towards it */
  const square = (color: number, near: number, size = 2) => {
    const mesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ color, transparent: true })
    );
    mesh.position.z = near;
    scene.add(mesh);
    return mesh;
  };
  /** The color drawn at a pixel of the 8 × 8 target */
  const drawn = (x: number, y: number) => {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    const pixel = new Uint8Array(4);
    renderer.readRenderTargetPixels(target, x, y, 1, 1, pixel);
    renderer.setRenderTarget(null);
    return [...pixel.slice(0, 3)];
  };

  it('shows the higher rank where they overlap, however far in front a lower one is', () => {
    // A coarse layer in front (as a coarse tile's terrain smooths a canyon over), a sharper one
    // behind it, in the middle only
    rankLayer(square(0xff0000, 1), 9);
    rankLayer(square(0x0000ff, 0, 1), 255);
    expect(drawn(4, 4)).toEqual([0, 0, 255]);
    // Where the sharper doesn't reach, the coarser fills in
    expect(drawn(0, 0)).toEqual([255, 0, 0]);
  });

  it('within a rank, layers by depth as usual', () => {
    rankLayer(square(0xff0000, 0), 255);
    rankLayer(square(0x00ff00, 1), 255);
    expect(drawn(4, 4)).toEqual([0, 255, 0]);
  });
});
