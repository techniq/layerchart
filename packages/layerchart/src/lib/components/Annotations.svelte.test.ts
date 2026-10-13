import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '$lib/tests/TestHarness.svelte';
import AnnotationLine from './AnnotationLine/AnnotationLine.svelte';
import AnnotationPoint from './AnnotationPoint/AnnotationPoint.svelte';
import AnnotationRange from './AnnotationRange/AnnotationRange.svelte';

const chartProps = {
  xDomain: [0, 100],
  yDomain: [0, 100],
  width: 200,
  height: 100,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
};

/** Renders a `<div>` carrying the snippet's props as data attributes, so tests can read them */
function capture(name: string, keys: string[]) {
  return createRawSnippet<[{ props: Record<string, any> }]>((args) => ({
    render: () => {
      const { props } = args();
      const attrs = keys.map((k) => `data-${k.toLowerCase()}="${props[k]}"`).join(' ');
      return `<div data-snippet="${name}" ${attrs}></div>`;
    },
  }));
}

async function snippet(name: string) {
  return vi.waitFor(() => {
    const el = document.querySelector<HTMLElement>(`[data-snippet="${name}"]`);
    expect(el).not.toBeNull();
    return el!.dataset;
  });
}

describe('AnnotationLine', () => {
  it('should render a `label` snippet with the resolved label props', async () => {
    render(TestHarness, {
      chartProps,
      layer: 'html',
      component: AnnotationLine,
      componentProps: {
        y: 50,
        label: capture('label', ['x', 'y', 'textAnchor', 'verticalAnchor', 'class', 'value']),
        props: { label: { class: 'custom' } },
      },
    });

    // Horizontal rule, `top-right` placement: the right end of the line, anchored up and in
    const label = await snippet('label');
    expect(Number(label.x)).toBe(200);
    expect(Number(label.y)).toBe(50);
    expect(label.textanchor).toBe('end');
    expect(label.verticalanchor).toBe('end');
    expect(label.class).toContain('lc-annotation-line-label');
    expect(label.class).toContain('custom');
    // No text to put in the snippet's way
    expect(label.value).toBe('undefined');
    expect(document.querySelector('.lc-annotation-line-label')).toBeNull();
  });

  it('should render a `line` snippet in place of the default line', async () => {
    render(TestHarness, {
      chartProps,
      layer: 'html',
      component: AnnotationLine,
      componentProps: {
        x: 25,
        line: capture('line', ['x1', 'y1', 'x2', 'y2', 'class']),
      },
    });

    const line = await snippet('line');
    expect([line.x1, line.y1, line.x2, line.y2].map(Number)).toEqual([50, 100, 50, 0]);
    expect(line.class).toContain('lc-annotation-line');
    expect(document.querySelector('.lc-annotation-line:not([data-snippet])')).toBeNull();
  });
});

describe('AnnotationPoint', () => {
  it('should render `circle` and `label` snippets with the resolved props', async () => {
    render(TestHarness, {
      chartProps,
      layer: 'html',
      component: AnnotationPoint,
      componentProps: {
        x: 50,
        y: 50,
        r: 6,
        circle: capture('circle', ['cx', 'cy', 'r', 'class']),
        label: capture('label', ['x', 'y', 'class']),
      },
    });

    const circle = await snippet('circle');
    expect([circle.cx, circle.cy, circle.r].map(Number)).toEqual([100, 50, 6]);
    expect(circle.class).toContain('lc-annotation-point');

    const label = await snippet('label');
    expect([label.x, label.y].map(Number)).toEqual([100, 50]);
    expect(label.class).toContain('lc-annotation-point-label');
  });
});

describe('AnnotationRange', () => {
  it('should render a `rect` snippet even without a `fill`', async () => {
    render(TestHarness, {
      chartProps,
      layer: 'html',
      component: AnnotationRange,
      componentProps: {
        x: [25, 75],
        rect: capture('rect', ['x', 'y', 'width', 'height', 'class']),
        label: capture('label', ['x', 'y']),
      },
    });

    const rect = await snippet('rect');
    expect([rect.x, rect.y, rect.width, rect.height].map(Number)).toEqual([50, 0, 100, 100]);
    expect(rect.class).toContain('lc-annotation-range');

    // `center` placement
    const label = await snippet('label');
    expect([label.x, label.y].map(Number)).toEqual([100, 50]);
  });
});
