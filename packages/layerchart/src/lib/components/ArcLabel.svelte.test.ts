import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';

import TestHarness, { componentTestId } from './tests/TestHarness.svelte';
import Arc from './Arc/Arc.svelte';
import ArcLabel from './ArcLabel.svelte';

const defaultArcProps: Partial<ComponentProps<typeof Arc>> = {
  fill: 'currentColor',
  value: 50,
  innerRadius: 70,
  outerRadius: 140,
};

describe('ArcLabel', () => {
  it('renders a text element with the supplied value at the centroid', async () => {
    render(TestHarness, {
      chartProps: { height: 400, padding: '50' },
      component: Arc,
      componentProps: defaultArcProps,
      childComponents: [
        {
          component: ArcLabel,
          props: ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
          }) => ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
            value: 'hello',
            'data-testid': 'arc-label',
          }),
        },
      ],
    });

    const arc = page.getByTestId(componentTestId);
    await expect.element(arc).toBeInTheDocument();
    const label = page.getByTestId('arc-label');
    await expect.element(label).toBeInTheDocument();
    await expect.element(label).toHaveTextContent('hello');
  });

  it('does not render a polyline for non-callout placements', async () => {
    render(TestHarness, {
      chartProps: { height: 400, padding: '50' },
      component: Arc,
      componentProps: defaultArcProps,
      childComponents: [
        {
          component: ArcLabel,
          props: ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
          }) => ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
            value: 'Centroid',
            'data-testid': 'arc-label',
          }),
        },
      ],
    });

    const text = page.getByTestId('arc-label');
    await expect.element(text).toBeInTheDocument();
    const chart = page.getByTestId('test-lc-chart');
    expect(chart.element().querySelector('polyline')).toBeNull();
  });

  it('applies a rotation transform for centroid-rotated placement', async () => {
    render(TestHarness, {
      chartProps: { height: 400, padding: '50' },
      component: Arc,
      componentProps: {
        ...defaultArcProps,
        // 90° slice on the right side so midAngle = 45°
        startAngle: 0,
        endAngle: Math.PI / 2,
      },
      childComponents: [
        {
          component: ArcLabel,
          props: ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
          }) => ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
            placement: 'centroid-rotated',
            value: 'Rotated',
            'data-testid': 'arc-label',
          }),
        },
      ],
    });

    const el = page.getByTestId('arc-label');
    await expect.element(el).toBeInTheDocument();
    const transform = el.element().getAttribute('transform') ?? '';
    // midAngle = 45°, tangent rotation → 45°
    expect(transform).toMatch(/rotate\(45/);
  });

  it('applies a rotation transform for centroid-radial placement', async () => {
    render(TestHarness, {
      chartProps: { height: 400, padding: '50' },
      component: Arc,
      componentProps: {
        ...defaultArcProps,
        startAngle: 0,
        endAngle: Math.PI / 2,
      },
      childComponents: [
        {
          component: ArcLabel,
          props: ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
          }) => ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
            placement: 'centroid-radial',
            value: 'Radial',
            'data-testid': 'arc-label',
          }),
        },
      ],
    });

    const el = page.getByTestId('arc-label');
    await expect.element(el).toBeInTheDocument();
    const transform = el.element().getAttribute('transform') ?? '';
    // midAngle = 45°, radial rotation = midAngle - 90 = -45°
    expect(transform).toMatch(/rotate\(-45/);
  });

  it('renders a polyline leader line for callout placement', async () => {
    render(TestHarness, {
      chartProps: { height: 400, padding: '50' },
      component: Arc,
      componentProps: {
        ...defaultArcProps,
        startAngle: 0,
        endAngle: Math.PI / 2,
      },
      childComponents: [
        {
          component: ArcLabel,
          props: ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
          }) => ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
            placement: 'callout',
            value: 'Callout',
            'data-testid': 'arc-label',
          }),
        },
      ],
    });

    const label = page.getByTestId('arc-label');
    await expect.element(label).toBeInTheDocument();
    // The leader line is a <path> with two line segments (edge → bend → label)
    const chart = page.getByTestId('test-lc-chart');
    const paths = Array.from(chart.element().querySelectorAll('path'));
    const leader = paths.find((p) => {
      const d = p.getAttribute('d') ?? '';
      // Leader-line pathData has the form `M${x0},${y0}L${x1},${y1}L${x2},${y2}`
      // with two `L` segments. The arc `<path>` has `A` arc commands.
      return /^M[^A]*L[^A]*L[^A]*$/.test(d);
    });
    expect(leader).toBeDefined();
  });

  it('does not render a polyline element for callout placement', async () => {
    render(TestHarness, {
      chartProps: { height: 400, padding: '50' },
      component: Arc,
      componentProps: {
        ...defaultArcProps,
        startAngle: 0,
        endAngle: Math.PI / 2,
      },
      childComponents: [
        {
          component: ArcLabel,
          props: ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
          }) => ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
            placement: 'callout',
            value: 'NoPolyline',
            'data-testid': 'arc-label',
          }),
        },
      ],
    });
    await expect.element(page.getByTestId('arc-label')).toBeInTheDocument();
    const chart = page.getByTestId('test-lc-chart');
    expect(chart.element().querySelector('polyline')).toBeNull();
  });

  it('delegates inner/middle/outer placements to getArcTextProps (text on path)', async () => {
    render(TestHarness, {
      chartProps: { height: 400, padding: '50' },
      component: Arc,
      componentProps: {
        ...defaultArcProps,
        startAngle: 0,
        endAngle: Math.PI / 2,
      },
      childComponents: [
        {
          component: ArcLabel,
          props: ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
          }) => ({
            centroid,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            getArcTextProps,
            placement: 'middle',
            value: 'Middle',
            'data-testid': 'arc-label',
          }),
        },
      ],
    });

    const label = page.getByTestId('arc-label');
    await expect.element(label).toBeInTheDocument();
    // Text along a path is rendered via <textPath href="#..."> inside the text element
    const textPath = label.element().querySelector('textPath');
    expect(textPath).not.toBeNull();
    // Default startOffset should be 50% (centered along the arc)
    expect(textPath?.getAttribute('startOffset')).toBe('50%');
  });
});
