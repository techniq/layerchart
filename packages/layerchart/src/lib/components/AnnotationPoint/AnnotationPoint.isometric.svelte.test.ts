import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { chartTestId } from '$lib/tests/TestHarness.svelte';
import AnnotationPoint from './AnnotationPoint.svelte';
import { isometric } from '$lib/views/isometric.js';

const data = [
  { x: 0, y: 0, z: 0 },
  { x: 10, y: 10, z: 10 },
];

/** Where the annotation's circle and label land on screen */
async function renderAnnotation(props: Record<string, any>, chartProps: Record<string, any> = {}) {
  document.body.innerHTML = '';
  render(TestHarness, {
    chartProps: {
      data,
      x: 'x',
      y: 'y',
      z: 'z',
      width: 400,
      height: 300,
      view: isometric,
      ...chartProps,
    },
    layerProps: { center: false },
    component: AnnotationPoint,
    componentProps: {
      x: 5,
      y: 5,
      label: 'Peak',
      labelPlacement: 'top',
      labelYOffset: 20,
      link: true,
      ...props,
    },
  });
  const chart = page.getByTestId(chartTestId);
  await expect.element(chart).toBeInTheDocument();
  const el = chart.element() as HTMLElement;
  const top = (selector: string) => el.querySelector(selector)!.getBoundingClientRect().top;
  return {
    circle: top('circle.lc-annotation-point'),
    label: top('.lc-annotation-point-label'),
    link: top('.lc-annotation-point-link'),
  };
}

describe('AnnotationPoint on an isometric floor', () => {
  it('raises its circle, label, and link together by `z`', async () => {
    const flat = await renderAnnotation({});
    const raised = await renderAnnotation({ z: 10 });
    const rise = flat.circle - raised.circle;
    expect(rise).toBeGreaterThan(20);
    expect(flat.label - raised.label).toBeCloseTo(rise, 0);
    expect(flat.link - raised.link).toBeCloseTo(rise, 0);
  });
});
