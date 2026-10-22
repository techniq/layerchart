import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Group from '../Group/Group.svelte';
import Points from './Points.svelte';
import type { Point } from './Points.shared.svelte.js';
import type { AffineMatrix } from '$lib/utils/isometric.js';
import { isometric } from '$lib/views/isometric.js';

const data = [
  { x: 0, y: 0, value: 10 },
  { x: 10, y: 10, value: 40 },
  { x: 10, y: 0, value: 20 },
];

/** The points `Points` hands its `children` */
async function renderPoints(
  pointsProps: Record<string, any>,
  chartProps: Record<string, any> = {}
) {
  document.body.innerHTML = '';
  let points: Point[] = [];
  let matrix = null as AffineMatrix | null;
  render(TestHarness, {
    chartProps: { data, x: 'x', y: 'y', width: 400, height: 300, view: isometric, ...chartProps },
    layerProps: { center: false },
    component: Points,
    componentProps: pointsProps,
    oncontext: (ctx) => (matrix = ctx.isometricMatrix),
    childComponents: [
      {
        component: Group,
        props: (snippetProps: { points: Point[] }) => {
          points = snippetProps.points;
          return {};
        },
      },
    ],
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  return Object.assign(points, { matrix });
}

describe('Points on an isometric floor', () => {
  it("raises each by the chart's `z`, back to front", async () => {
    const points = await renderPoints({}, { z: 'value' });
    const m = points.matrix!;
    const depths = points.map((p) => m.b * p.x + m.d * p.y);
    expect(depths).toEqual([...depths].sort((a, b) => a - b));
    // Measured by `zScale`, so the tallest value stands highest
    const byValue = [...points].sort((a, b) => a.data.value - b.data.value);
    expect(byValue.map((p) => p.z)).toEqual([...byValue.map((p) => p.z!)].sort((a, b) => a - b));
    expect(byValue.at(-1)!.z!).toBeGreaterThan(byValue[0].z!);
  });

  it('raises each by its own `z`', async () => {
    const points = await renderPoints({ z: 25 });
    expect(points.map((p) => p.z)).toEqual([25, 25, 25]);
  });

  it('leaves them on the floor without one, or on a flat chart', async () => {
    expect((await renderPoints({})).every((p) => p.z == null)).toBe(true);
    expect((await renderPoints({}, { z: 'value', view: null })).every((p) => p.z == null)).toBe(
      true
    );
  });
});
