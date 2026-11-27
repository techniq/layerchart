import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Switched from './__fixtures__/Switched.svelte';

/** Whether a canvas has a WebGL context (one only a `<WebGL>` scene asks for) */
function isWebGL(canvas: HTMLCanvasElement) {
  return canvas.getContext('2d') === null;
}

describe('layer-agnostic marks', () => {
  it('draws LayerChart’s marks in an `svg` layer', async () => {
    const { container } = render(Switched, { type: 'svg' });
    await expect.poll(() => container.querySelectorAll('svg circle').length).toBe(5);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('draws LayerChart’s marks in a `canvas` layer', async () => {
    const { container } = render(Switched, { type: 'canvas' });
    await expect.poll(() => container.querySelectorAll('canvas').length).toBeGreaterThan(0);
    expect([...container.querySelectorAll('canvas')].some(isWebGL)).toBe(false);
    expect(container.querySelector('svg circle')).toBeNull();
  });

  it('draws LayerChart’s marks in an `html` layer', async () => {
    const { container } = render(Switched, { type: 'html' });
    await expect.poll(() => container.querySelectorAll('.lc-circle').length).toBe(5);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('draws a `<WebGL>` scene with `type="webgl"`', async () => {
    const { container } = render(Switched, { type: 'webgl' });
    await expect.poll(() => [...container.querySelectorAll('canvas')].some(isWebGL)).toBe(true);
    expect(container.querySelector('svg circle')).toBeNull();
  });

  it('draws the layer in `settings.layer`, `webgl` included, with no `type`', async () => {
    const { container } = render(Switched, { layer: 'webgl' });
    await expect.poll(() => [...container.querySelectorAll('canvas')].some(isWebGL)).toBe(true);
  });
});
