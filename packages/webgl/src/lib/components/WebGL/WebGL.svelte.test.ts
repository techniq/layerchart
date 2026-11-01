import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import Orbit from './__fixtures__/Orbit.svelte';
import Scatter from './__fixtures__/Scatter.svelte';

describe('WebGL', () => {
  it('draws a canvas, with labels from `Axis` over it', async () => {
    const { container } = render(Scatter, { data: [{ x: 5, y: 5, z: 5, name: 'center' }] });

    await expect.poll(() => container.querySelector('.lc-layout-webgl canvas')).toBeTruthy();
    await expect
      .poll(() => [...container.querySelectorAll('.lc-webgl-label')].map((e) => e.textContent))
      .toEqual(['0', '5', '10']);
  });

  it('shows the tooltip for the row under the pointer', async () => {
    const { container } = render(Scatter, { data: [{ x: 5, y: 5, z: 5, name: 'center' }] });
    await expect.poll(() => container.querySelector('.lc-layout-webgl canvas')).toBeTruthy();

    // Wait for a frame to be fitted before pointing at it
    await expect.poll(() => container.querySelectorAll('.lc-webgl-label').length).toBe(3);
    await page.elementLocator(container.querySelector('.lc-layout-webgl canvas')!).hover();

    await expect.element(page.getByTestId('tooltip')).toHaveTextContent('center');
  });

  it('turns the view with a drag, reporting its angles through `onTransform`', async () => {
    const { container } = render(Orbit);
    const angles = page.getByTestId('angles');
    await expect.poll(() => container.querySelector('.lc-layout-webgl canvas')).toBeTruthy();
    await expect.element(angles).toHaveTextContent('-45,60');

    // The transform loads lazily
    await expect.poll(() => container.querySelector('.lc-transform-context')).toBeTruthy();
    const canvas = container.querySelector<HTMLCanvasElement>('.lc-layout-webgl canvas')!;
    // Synthetic pointers can't be captured
    canvas.setPointerCapture = () => {};
    const rect = canvas.getBoundingClientRect();
    const at = (dx: number, dy: number) => ({
      clientX: rect.left + rect.width / 2 + dx,
      clientY: rect.top + rect.height / 2 + dy,
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
      bubbles: true,
    });
    // A drag across turns the view, and one upwards tips it
    canvas.dispatchEvent(new PointerEvent('pointerdown', at(0, 0)));
    canvas.dispatchEvent(new PointerEvent('pointermove', at(30, -20)));
    canvas.dispatchEvent(new PointerEvent('pointermove', at(60, -40)));
    canvas.dispatchEvent(new PointerEvent('pointerup', at(60, -40)));

    await expect.poll(() => angles.element().textContent).not.toBe('-45,60');
    const [rotate, tilt] = angles.element().textContent!.split(',').map(Number);
    expect(rotate).toBeLessThan(-45);
    expect(tilt).toBeGreaterThan(60);
  });
});
