import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import Orbit from './__fixtures__/Orbit.svelte';
import Scatter from './__fixtures__/Scatter.svelte';

describe('Scene', () => {
  it('draws a canvas, with labels from `Axis` over it', async () => {
    const { container } = render(Scatter, { data: [{ x: 5, y: 5, z: 5, name: 'center' }] });

    await expect.poll(() => container.querySelector('.lc-scene canvas')).toBeTruthy();
    await expect
      .poll(() => [...container.querySelectorAll('.lc-scene-label')].map((e) => e.textContent))
      .toEqual(['0', '5', '10']);
  });

  it('shows the tooltip for the row under the pointer', async () => {
    const { container } = render(Scatter, { data: [{ x: 5, y: 5, z: 5, name: 'center' }] });
    await expect.poll(() => container.querySelector('.lc-scene canvas')).toBeTruthy();

    // Wait for a frame to be fitted before pointing at it
    await expect.poll(() => container.querySelectorAll('.lc-scene-label').length).toBe(3);
    await page.elementLocator(container.querySelector('.lc-scene canvas')!).hover();

    await expect.element(page.getByTestId('tooltip')).toHaveTextContent('center');
  });

  it('hands orbiting back through `bind:rotate` / `bind:tilt`', async () => {
    const { container } = render(Orbit);
    const angles = page.getByTestId('angles');
    await expect
      .poll(() => container.querySelector('.lc-scene-label, .lc-scene canvas'))
      .toBeTruthy();
    await expect.element(angles).toHaveTextContent('-45,60');
    await expect.poll(() => container.querySelector('.lc-scene canvas')).toBeTruthy();

    const canvas = container.querySelector<HTMLCanvasElement>('.lc-scene canvas')!;
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
    canvas.dispatchEvent(new PointerEvent('pointermove', at(60, -40)));
    canvas.dispatchEvent(new PointerEvent('pointerup', at(60, -40)));

    await expect.poll(() => angles.element().textContent).not.toBe('-45,60');
    const [rotate, tilt] = angles.element().textContent!.split(',').map(Number);
    expect(rotate).toBeLessThan(-45);
    expect(tilt).toBeGreaterThan(60);
  });

  it("doesn't write the view back when it only refits", async () => {
    const { container, rerender } = render(Orbit);
    await expect.poll(() => container.querySelector('.lc-scene canvas')).toBeTruthy();
    // Refits on resize, which moves the camera without anyone orbiting it
    await rerender({ width: 300 });
    await rerender({ width: 500 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect.element(page.getByTestId('angles')).toHaveTextContent('-45,60');
  });
});
