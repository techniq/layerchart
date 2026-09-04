import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PathEndpointsHarness from '$lib/tests/PathEndpointsHarness.svelte';

/** `translate(x, y)` of the group wrapping the rendered snippet */
function groupTranslate(className: string) {
  const el = document.querySelector<SVGGElement>(`.${className}`);
  const match = el?.style.transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
  return match ? [Math.round(Number(match[1])), Math.round(Number(match[2]))] : null;
}

describe('Path', () => {
  describe('startContent / endContent', () => {
    it('renders both without a `draw` transition', async () => {
      render(PathEndpointsHarness, {});

      await expect
        .poll(() => document.querySelectorAll('[data-testid="start-dot"]').length)
        .toBe(1);
      await expect.poll(() => document.querySelectorAll('[data-testid="end-dot"]').length).toBe(1);
    });

    it('renders both with a `draw` transition', async () => {
      render(PathEndpointsHarness, { draw: true });

      await expect
        .poll(() => document.querySelectorAll('[data-testid="start-dot"]').length)
        .toBe(1);
      await expect
        .poll(() => document.querySelectorAll('[data-testid="end-dot"]').length, { timeout: 2000 })
        .toBe(1);
    });

    it('positions the content at each end of the path', async () => {
      // x 1..3 over 200px, y 10..30 over 100px (inverted), so the line runs (0,100) → (200,50)
      render(PathEndpointsHarness, {});

      await expect.poll(() => groupTranslate('lc-path-g-start')).toEqual([0, 100]);
      await expect.poll(() => groupTranslate('lc-path-g-end')).toEqual([200, 50]);
    });
  });
});
