import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId, componentTestId } from '$lib/tests/TestHarness.svelte';
import Axis from '../Axis/Axis.svelte';
import Text from './Text.svelte';

const chartProps = {
  width: 400,
  height: 300,
  xDomain: [0, 10],
  yDomain: [0, 10],
  padding: 40,
  isometric: true,
};

/** Screen transform of a rendered `<text>`, from its own coordinates */
async function textCTM(componentProps: Record<string, any>, layerProps = {}) {
  const screen = render(TestHarness, {
    chartProps,
    layerProps,
    component: Text,
    componentProps: { x: 30, y: 20, value: 'Label', ...componentProps },
  });
  const el = page.getByTestId(componentTestId);
  await expect.element(el).toBeInTheDocument();
  const ctm = (el.element() as SVGTextElement).getScreenCTM()!;
  screen.unmount();
  return ctm;
}

/** Where `(x, y)` in the text's own coordinates lands on screen */
function at(ctm: DOMMatrix, x: number, y: number) {
  return { x: ctm.a * x + ctm.c * y + ctm.e, y: ctm.b * x + ctm.d * y + ctm.f };
}

describe('Text viewport', () => {
  it('lies along the floor by default', async () => {
    const ctm = await textCTM({});
    // Skewed: the isometric view turns `x` up the screen
    expect(Math.abs(ctm.b)).toBeGreaterThan(0.1);
  });

  it('faces the viewer, unskewed and at its natural size', async () => {
    const ctm = await textCTM({ viewport: true });
    expect(ctm.a).toBeCloseTo(1);
    expect(ctm.b).toBeCloseTo(0);
    expect(ctm.c).toBeCloseTo(0);
    expect(ctm.d).toBeCloseTo(1);
  });

  it('keeps its spot on the floor', async () => {
    const flat = at(await textCTM({}), 30, 20);
    const viewport = at(await textCTM({ viewport: true }), 30, 20);
    expect(viewport.x).toBeCloseTo(flat.x);
    expect(viewport.y).toBeCloseTo(flat.y);
  });

  it('still rotates on screen', async () => {
    const ctm = await textCTM({ viewport: true, rotate: -90 });
    expect(ctm.a).toBeCloseTo(0);
    expect(ctm.b).toBeCloseTo(-1);
  });

  it('does nothing in a layer that ignores the view', async () => {
    const plain = await textCTM({}, { ignoreTransform: true });
    const viewport = await textCTM({ viewport: true }, { ignoreTransform: true });
    expect([viewport.a, viewport.b, viewport.c, viewport.d]).toEqual([
      plain.a,
      plain.b,
      plain.c,
      plain.d,
    ]);
  });
});

describe('Axis viewport labels', () => {
  /** The `text-anchor` of each tick label */
  async function tickLabels(placement: string, tickLabelProps: Record<string, any> = {}) {
    const screen = render(TestHarness, {
      chartProps,
      component: Axis,
      componentProps: { placement, ticks: 3, tickLabelProps },
    });
    const chart = page.getByTestId(chartTestId);
    await expect.element(chart).toBeInTheDocument();
    const labels = [
      ...(chart.element() as HTMLElement).querySelectorAll<SVGTextElement>('.lc-axis-tick-label'),
    ];
    expect(labels.length).toBeGreaterThan(0);
    const result = labels.map((el) => el.getAttribute('text-anchor'));
    screen.unmount();
    return result;
  }

  it('hangs bottom labels off to the right, clear of the floor', async () => {
    expect(new Set(await tickLabels('bottom', { viewport: true }))).toEqual(new Set(['start']));
  });

  it('hangs left labels off to the left', async () => {
    expect(new Set(await tickLabels('left', { viewport: true }))).toEqual(new Set(['end']));
  });

  it('keeps an anchor the labels set themselves', async () => {
    expect(new Set(await tickLabels('bottom', { viewport: true, textAnchor: 'end' }))).toEqual(
      new Set(['end'])
    );
  });

  it('keeps the flat anchors when not viewport-aligned', async () => {
    expect(new Set(await tickLabels('bottom'))).toEqual(new Set(['middle']));
  });
});

describe('Text z', () => {
  /** Where the text's anchor lands on screen */
  async function anchor(componentProps: Record<string, any>, extraChart = {}) {
    const screen = render(TestHarness, {
      chartProps: { ...chartProps, ...extraChart },
      component: Text,
      componentProps: { value: () => 'Label', viewport: true, ...componentProps },
    });
    const el = page.getByTestId(componentTestId);
    await expect.element(el).toBeInTheDocument();
    const text = el.element() as SVGTextElement;
    const point = at(text.getScreenCTM()!, +text.getAttribute('x')!, +text.getAttribute('y')!);
    screen.unmount();
    return point;
  }

  it('raises pixel-placed text straight up the screen', async () => {
    const floor = await anchor({ x: 30, y: 20 });
    const raised = await anchor({ x: 30, y: 20, z: 40 });
    expect(raised.x).toBeCloseTo(floor.x, 0);
    expect(floor.y - raised.y).toBeGreaterThan(20);
  });

  it('raises each row in data mode', async () => {
    const data = [{ x: 3, y: 4 }];
    const floor = await anchor({ data, x: 'x', y: 'y' });
    const raised = await anchor({ data, x: 'x', y: 'y', z: 40 });
    expect(raised.x).toBeCloseTo(floor.x, 0);
    expect(floor.y - raised.y).toBeGreaterThan(20);
  });

  it('stays put on a flat chart', async () => {
    const floor = await anchor({ x: 30, y: 20 }, { isometric: false });
    const raised = await anchor({ x: 30, y: 20, z: 40 }, { isometric: false });
    expect(raised).toEqual(floor);
  });

  it('turns raised text about where it stands', async () => {
    const plain = await anchor({ x: 30, y: 20, z: 40, viewport: false });
    const turned = await anchor({ x: 30, y: 20, z: 40, viewport: false, rotate: 90 });
    expect(turned.x).toBeCloseTo(plain.x, 1);
    expect(turned.y).toBeCloseTo(plain.y, 1);
  });
});
