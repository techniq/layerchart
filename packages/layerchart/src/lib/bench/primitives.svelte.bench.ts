import { describe, bench, afterEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';

import PrimitiveBench from './PrimitiveBench.svelte';

afterEach(() => {
  cleanup();
});

const COUNT = 100;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LayerChart primitives vs native SVG elements — 100 instances each
//
// Representative subset: rect (shape), circle (shape), group (container),
// text (complex), path (path-based). Ellipse/line follow the same
// architecture as rect/circle and would show the same ratio.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PRIMITIVES = ['rect', 'circle', 'group', 'text', 'path'] as const;

for (const primitive of PRIMITIVES) {
  describe(`${primitive} — ${COUNT} instances`, () => {
    bench(`Native <${primitive}>`, () => {
      cleanup();
      render(PrimitiveBench, { primitive, mode: 'native', count: COUNT });
    });

    bench(`LayerChart <${primitive[0].toUpperCase()}${primitive.slice(1)}>`, () => {
      cleanup();
      render(PrimitiveBench, { primitive, mode: 'layerchart', count: COUNT });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scaling: rect at 10, 100, 250 instances
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('rect — scaling', () => {
  for (const count of [10, 100, 250]) {
    bench(`Native <rect> × ${count}`, () => {
      cleanup();
      render(PrimitiveBench, { primitive: 'rect', mode: 'native', count });
    });

    bench(`LayerChart <Rect> × ${count}`, () => {
      cleanup();
      render(PrimitiveBench, { primitive: 'rect', mode: 'layerchart', count });
    });
  }
});
