import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import Path from './Path.svelte';

const square = 'M20,20L80,20L80,80L20,80Z';

/** Render a `Path` on an isometric chart and report what it drew */
async function renderPath(pathProps: Record<string, any>, chartProps: Record<string, any> = {}) {
  const screen = render(TestHarness, {
    chartProps: {
      width: 300,
      height: 300,
      xDomain: [0, 100],
      yDomain: [0, 100],
      isometric: true,
      ...chartProps,
    },
    layerProps: { center: false },
    component: Path,
    componentProps: { pathData: square, fill: 'steelblue', ...pathProps },
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  const el = chart.element() as HTMLElement;
  return {
    unmount: () => screen.unmount(),
    sides: el.querySelector<SVGPathElement>('.lc-path-side'),
    shades: el.querySelectorAll('.lc-path-side-shade').length,
    top: el.querySelector<SVGPathElement>('path.lc-path:not(.lc-path-side)')!,
  };
}

describe('Path on an isometric floor', () => {
  it('stands up `z` pixels with the sides facing the viewer, its top raised', async () => {
    const { sides, shades, top } = await renderPath({ z: 40 });
    // Two sides of a square face the viewer, as one shape around its near corner
    expect(sides?.getAttribute('d')?.match(/M/g)).toHaveLength(1);
    expect(shades).toBeGreaterThan(0);
    expect(top.getAttribute('transform')).toMatch(/^translate\(/);
  });

  it('moves its sides with its `transform`, as an offset `Arc` slice does', async () => {
    const left = (el: SVGGraphicsElement | null) => el!.getBoundingClientRect().left;
    const flat = await renderPath({ z: 40 });
    const before = { sides: left(flat.sides), top: left(flat.top) };
    flat.unmount();

    const { sides, top } = await renderPath({ z: 40, transform: 'translate(10, 5)' });
    // Sides and top both shifted, by the same amount
    expect(left(top) - before.top).not.toBeCloseTo(0, 0);
    expect(left(sides) - before.sides).toBeCloseTo(left(top) - before.top, 0);
  });

  it('floats between `[start, end]`', async () => {
    const standing = await renderPath({ z: 40 });
    const standingTop = standing.top.getAttribute('transform');
    standing.unmount();
    const floating = await renderPath({ z: [20, 40] });
    // The same top, on shorter sides
    expect(floating.top.getAttribute('transform')).toBe(standingTop);
    expect(floating.sides).not.toBeNull();
  });

  it('only raises an unfilled path', async () => {
    const { sides, top } = await renderPath({ z: 40, fill: 'none', stroke: 'black' });
    expect(sides).toBeNull();
    expect(top.getAttribute('transform')).toMatch(/^translate\(/);
  });

  it('lies flat on a flat chart', async () => {
    const { sides, top } = await renderPath({ z: 40 }, { isometric: false });
    expect(sides).toBeNull();
    expect(top.getAttribute('transform')).toBeNull();
  });
});
