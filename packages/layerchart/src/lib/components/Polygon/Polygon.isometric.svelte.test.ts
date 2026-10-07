import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Polygon from './Polygon.svelte';

async function renderPolygon(componentProps: Record<string, any>, chartProps = {}) {
  const screen = render(TestHarness, {
    chartProps: {
      width: 300,
      height: 300,
      xDomain: [0, 10],
      yDomain: [0, 10],
      isometric: true,
      ...chartProps,
    },
    layerProps: { center: false },
    component: Polygon,
    componentProps,
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  const el = page.getByTestId(chartTestId).element() as HTMLElement;
  return {
    unmount: () => screen.unmount(),
    sides: el.querySelectorAll('.lc-polygon-side').length,
    tops: [...el.querySelectorAll<SVGPathElement>('path.lc-polygon:not(.lc-polygon-side)')],
  };
}

describe('Polygon on an isometric floor', () => {
  it('stands a pixel-placed polygon up `z` pixels', async () => {
    const { sides, tops } = await renderPolygon({ cx: 100, cy: 100, r: 30, points: 6, z: 40 });
    expect(sides).toBe(1);
    expect(tops[0].getAttribute('transform')).toMatch(/^translate\(/);
  });

  it('stands each row up by its own height, nearer rows drawn later', async () => {
    const data = [
      { x: 8, y: 8, h: 10 },
      { x: 2, y: 2, h: 40 },
    ];
    const { sides, tops } = await renderPolygon(
      { data, cx: 'x', cy: 'y', r: 10, z: (d: any) => d.h },
      { zDomain: [0, 40], zRange: [0, 40] }
    );
    expect(sides).toBe(2);
    // Drawn back to front: top to bottom on screen by where each stands
    const bottoms = tops.map(
      (t) =>
        t.getBoundingClientRect().bottom -
        Number(t.getAttribute('transform')!.match(/,([-\d.]+)\)/)![1])
    );
    expect(bottoms).toEqual([...bottoms].sort((a, b) => a - b));
  });

  it('lies flat on a flat chart', async () => {
    const { sides, tops } = await renderPolygon(
      { cx: 100, cy: 100, r: 30, z: 40 },
      { isometric: false }
    );
    expect(sides).toBe(0);
    expect(tops[0].getAttribute('transform')).toBeNull();
  });
});
