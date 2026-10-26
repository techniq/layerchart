import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import MarkHarness from '$lib/tests/MarkHarness.svelte';
import { chartTestId } from '$lib/tests/TestHarness.svelte';
import ArcLabel from './ArcLabel.svelte';
import { isometric } from '$lib/views/isometric.js';

/** A callout for a slice centred on `angle` (radians, clockwise from 12 o'clock) */
async function callout(angle: number, angles: Record<string, number> | null) {
  const screen = render(MarkHarness, {
    chartProps: { width: 400, height: 300, view: angles && isometric(angles) },
    layerProps: { center: true },
    component: ArcLabel,
    componentProps: {
      placement: 'callout',
      startAngle: angle - 0.2,
      endAngle: angle + 0.2,
      innerRadius: 0,
      outerRadius: 80,
      value: 'label',
      z: 30,
      viewport: true,
    },
  });
  await expect.element(page.getByTestId(chartTestId)).toBeInTheDocument();
  const text = (page.getByTestId(chartTestId).element() as HTMLElement).querySelector('text')!;
  const result = {
    anchor: text.getAttribute('text-anchor'),
    raised: text.getAttribute('transform')?.includes('translate') ?? false,
    x: +text.getAttribute('x')!,
    y: +text.getAttribute('y')!,
  };
  screen.unmount();
  return result;
}

describe('ArcLabel callouts on an isometric floor', () => {
  it('picks its side by where the slice falls on screen', async () => {
    // A slice at 3 o'clock: right on screen as laid out, left once the view turns half round
    expect((await callout(Math.PI / 2, { rotate: 0, tilt: 50 })).anchor).toBe('start');
    expect((await callout(Math.PI / 2, { rotate: 180, tilt: 50 })).anchor).toBe('end');
  });

  it('hangs below the pie for a slice facing the viewer, and off its top for one behind', async () => {
    // 6 o'clock faces the viewer; 12 o'clock is at the back
    const front = await callout(Math.PI, { rotate: 0, tilt: 50 });
    const back = await callout(0, { rotate: 0, tilt: 50 });
    const flatFront = await callout(Math.PI, null);
    const flatBack = await callout(0, null);
    // In front: on the floor, where it'd be flat.  Behind: raised (its anchor lifted up the screen)
    expect(front.y).toBeCloseTo(flatFront.y);
    expect(back.y).toBeLessThan(flatBack.y);
  });
});
