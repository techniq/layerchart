import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import SimplifiedChart from './__fixtures__/SimplifiedChart.svelte';

describe('simplified charts', () => {
  it.each(['bar', 'line', 'pie'] as const)(
    'draws a %s chart, its axes and marks, in a WebGL layer',
    async (chart) => {
      const { container } = render(SimplifiedChart, { chart });
      // A WebGL canvas, and none of LayerChart's SVG or Canvas layers drawing in its place
      await expect
        .poll(() => [...container.querySelectorAll('canvas')].some((c) => !c.getContext('2d')))
        .toBe(true);
      // (an `Svg` of the tooltip's hit areas aside, as every layer has)
      expect(container.querySelector('svg path, svg text')).toBeNull();
      expect(container.querySelector('.lc-layout-canvas canvas')).toBeNull();
    }
  );
});
