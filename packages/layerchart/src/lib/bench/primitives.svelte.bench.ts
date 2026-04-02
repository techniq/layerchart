import { describe, bench, afterEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';

import PrimitiveBench from './PrimitiveBench.svelte';

afterEach(() => {
  cleanup();
});

const PRIMITIVES = ['rect', 'circle', 'ellipse', 'line', 'group', 'text', 'path'] as const;
const COUNT = 100;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LayerChart primitives vs native SVG elements — 100 instances each
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
// Scaling: 10, 100, 500, 1000 instances (rect as representative)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('rect — scaling', () => {
  for (const count of [10, 100, 500, 1000]) {
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

describe('circle — scaling', () => {
  for (const count of [10, 100, 500, 1000]) {
    bench(`Native <circle> × ${count}`, () => {
      cleanup();
      render(PrimitiveBench, { primitive: 'circle', mode: 'native', count });
    });

    bench(`LayerChart <Circle> × ${count}`, () => {
      cleanup();
      render(PrimitiveBench, { primitive: 'circle', mode: 'layerchart', count });
    });
  }
});
