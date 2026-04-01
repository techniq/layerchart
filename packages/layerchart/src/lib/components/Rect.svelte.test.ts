import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from './tests/TestHarness.svelte';
import Rect from './Rect.svelte';

describe('Rect', () => {
  describe('pixel mode', () => {
    it('should render a rect with pixel values', async () => {
      render(TestHarness, {
        component: Rect,
        componentProps: {
          x: 10,
          y: 10,
          width: 100,
          height: 50,
          fill: 'red',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      expect(el.element()?.getAttribute('width')).toBe('100');
      expect(el.element()?.getAttribute('height')).toBe('50');
    });
  });

  describe('data mode - standard', () => {
    const data = [
      { date: new Date('2024-01-01'), value: 20 },
      { date: new Date('2024-02-01'), value: 40 },
      { date: new Date('2024-03-01'), value: 60 },
    ];

    it('should render one rect per data item with string accessors', async () => {
      render(TestHarness, {
        component: Rect,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x: 'date',
          y: 'value',
          width: 20,
          height: 10,
        },
      });

      const rects = page.getByTestId(componentTestId).elements();
      await expect.poll(() => rects.length).toBe(3);
    });
  });

  describe('data mode - colors', () => {
    const data = [
      { date: new Date('2024-01-01'), value: 20, category: 'A' },
      { date: new Date('2024-02-01'), value: 40, category: 'B' },
      { date: new Date('2024-03-01'), value: 60, category: 'A' },
    ];

    it('should resolve data-driven fill through cScale', async () => {
      render(TestHarness, {
        component: Rect,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
          c: 'category',
          cRange: ['steelblue', 'coral'],
        },
        componentProps: {
          x: 'date',
          y: 'value',
          width: 20,
          height: 10,
          fill: 'category',
        },
      });

      const rects = page.getByTestId(componentTestId).elements();
      await expect.poll(() => rects.length).toBe(3);

      expect(rects[0].getAttribute('fill')).toBe('steelblue');
      expect(rects[1].getAttribute('fill')).toBe('coral');
      expect(rects[2].getAttribute('fill')).toBe('steelblue');
    });

    it('should pass literal CSS colors through unchanged in data mode', async () => {
      render(TestHarness, {
        component: Rect,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x: 'date',
          y: 'value',
          width: 20,
          height: 10,
          fill: 'red',
        },
      });

      const rects = page.getByTestId(componentTestId).elements();
      await expect.poll(() => rects.length).toBe(3);

      expect(rects[0].getAttribute('fill')).toBe('red');
      expect(rects[1].getAttribute('fill')).toBe('red');
    });
  });

  describe('data mode - edge-based', () => {
    const data = [
      { x0: 0, x1: 30, count: 5 },
      { x0: 30, x1: 60, count: 10 },
      { x0: 60, x1: 100, count: 3 },
    ];

    it('should render rects from edge props', async () => {
      render(TestHarness, {
        component: Rect,
        chartProps: {
          data,
          x: ['x0', 'x1'],
          y: 'count',
          xDomain: [0, 100],
          yDomain: [0, 15],
        },
        componentProps: {
          x0: 'x0',
          x1: 'x1',
          y0: (d: any) => 0,
          y1: 'count',
        },
      });

      const rects = page.getByTestId(componentTestId).elements();
      await expect.poll(() => rects.length).toBe(3);
    });

    it('should render rects with insets', async () => {
      render(TestHarness, {
        component: Rect,
        chartProps: {
          data,
          x: ['x0', 'x1'],
          y: 'count',
          xDomain: [0, 100],
          yDomain: [0, 15],
        },
        componentProps: {
          x0: 'x0',
          x1: 'x1',
          y0: (d: any) => 0,
          y1: 'count',
          insets: { x: 2 },
        },
      });

      const rects = page.getByTestId(componentTestId).elements();
      await expect.poll(() => rects.length).toBe(3);

      // Verify insets affect width (rect should be narrower than without insets)
      const firstRect = rects[0] as SVGRectElement;
      const width = Number(firstRect?.getAttribute('width'));
      expect(width).toBeGreaterThan(0);
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [{ x0: 0, x1: 50, count: 5 }];

      render(TestHarness, {
        component: Rect,
        chartProps: {
          data,
          x: ['x0', 'x1'],
          y: 'count',
          xDomain: [0, 100],
          yDomain: [0, 15],
        },
        componentProps: {
          data: explicitData,
          x0: 'x0',
          x1: 'x1',
          y0: (d: any) => 0,
          y1: 'count',
        },
      });

      const rects = page.getByTestId(componentTestId).elements();
      await expect.poll(() => rects.length).toBe(1);
    });
  });
});
