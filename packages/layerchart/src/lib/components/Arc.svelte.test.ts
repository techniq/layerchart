import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, type Locator } from 'vitest/browser';
import TestHarness from './tests/TestHarness.svelte';

// Component-specific configuration ---------------------------------------
import TestComponent from './Arc.svelte';
const componentName = 'Arc';
import Text from './Text.svelte';
const supportedLayers: Array<'svg' | 'html' | 'canvas'> = ['svg'];
// const componentTestId = 'test-lc-component';
// const accessoryTestIds = ['arc-track']; // optional
// -------------------------------------------------------------------------
let el: Locator | HTMLElement | SVGElement | null; // resuable

for (const layer of supportedLayers) {
  const isCanvas = layer === 'canvas';

  /*-------------------------------------------------------------------------
  / INITIAL LAYERS RENDERINGS TESTS
  / ------------------------------------------------------------------------- */
  describe(`${componentName} Testing (${layer})`, () => {
    describe('Initial Layers Renderings', () => {
      it(`should render correct in layer ${layer}`, async () => {
        const { container } = render(TestHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
          },
        });

        if (layer === 'canvas') {
          // Canvas-specific tests
          el = container.querySelector('canvas') as HTMLCanvasElement | null;
          await expect.element(el).toBeInTheDocument();
        } else if (layer === 'svg') {
          // SVG-specific tests
          el = container.querySelector('svg') as SVGElement | null;
          await expect.element(el).toBeInTheDocument();
        } else if (layer === 'html') {
          // HTML-specific tests
          el = container.querySelector('div') as HTMLElement | null;
          await expect.element(el).toBeInTheDocument();
        }
      });
    });
  });
}
