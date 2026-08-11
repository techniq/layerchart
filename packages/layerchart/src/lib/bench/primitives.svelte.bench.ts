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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Where the overhead above actually goes
//
// `import { Rect } from 'layerchart'` mounts TWO components: the dispatcher
// reads the layer context and renders the layer-specific variant. The
// layer-specific entrypoints (`layerchart/svg`) export that variant
// directly, skipping the dispatcher — so both arms are public API.
//
// Holding Chart + Layer constant and varying only the component makes the
// cost decompose:
//
//   dispatcher   = layerchart      - layerchart/svg   (the wrapper)
//   component    = layerchart/svg  - native in Chart  (State + template)
//   chart/layer  = native in Chart - native (bare)    (fixed setup)
//
// rect and text are the two heaviest primitives; the rest share the same
// architecture and show the same shape.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

for (const primitive of ['rect', 'text'] as const) {
  const Name = `${primitive[0].toUpperCase()}${primitive.slice(1)}`;

  describe(`${primitive} — overhead decomposition, ${COUNT} instances`, () => {
    bench(`native <${primitive}>, no Chart`, () => {
      cleanup();
      render(PrimitiveBench, { primitive, mode: 'native', count: COUNT });
    });

    bench(`native <${primitive}> in Chart+Layer`, () => {
      cleanup();
      render(PrimitiveBench, { primitive, mode: 'native-in-chart', count: COUNT });
    });

    bench(`<${Name}> from 'layerchart/svg'`, () => {
      cleanup();
      render(PrimitiveBench, { primitive, mode: 'direct', count: COUNT });
    });

    bench(`<${Name}> from 'layerchart'`, () => {
      cleanup();
      render(PrimitiveBench, { primitive, mode: 'layerchart', count: COUNT });
    });
  });
}
