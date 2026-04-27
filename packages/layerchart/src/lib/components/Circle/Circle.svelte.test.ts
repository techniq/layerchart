import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from './tests/TestHarness.svelte';
import Circle from './Circle.svelte';

describe('Circle', () => {
  describe('pixel mode', () => {
    it('should render a circle with pixel values', async () => {
      render(TestHarness, {
        component: Circle,
        componentProps: {
          cx: 50,
          cy: 50,
          r: 10,
          fill: 'red',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      expect(el.element()?.getAttribute('cx')).toBe('50');
      expect(el.element()?.getAttribute('cy')).toBe('50');
      expect(el.element()?.getAttribute('r')).toBe('10');
    });
  });

  describe('data mode', () => {
    const data = [
      { date: new Date('2024-01-01'), value: 20 },
      { date: new Date('2024-02-01'), value: 40 },
      { date: new Date('2024-03-01'), value: 60 },
    ];

    it('should render one circle per data item with string accessors', async () => {
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          cx: 'date',
          cy: 'value',
          r: 5,
        },
      });

      const circles = page.getByTestId(componentTestId).elements();
      await expect.poll(() => circles.length).toBe(3);
    });

    it('should render with function accessors', async () => {
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          cx: (d: any) => d.date,
          cy: (d: any) => d.value,
          r: 5,
        },
      });

      const circles = page.getByTestId(componentTestId).elements();
      await expect.poll(() => circles.length).toBe(3);
    });

    it('should resolve data-driven fill through cScale', async () => {
      const colorData = [
        { date: new Date('2024-01-01'), value: 20, category: 'A' },
        { date: new Date('2024-02-01'), value: 40, category: 'B' },
        { date: new Date('2024-03-01'), value: 60, category: 'A' },
      ];

      render(TestHarness, {
        component: Circle,
        chartProps: {
          data: colorData,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
          c: 'category',
          cRange: ['steelblue', 'coral'],
        },
        componentProps: {
          cx: 'date',
          cy: 'value',
          r: 5,
          fill: 'category',
        },
      });

      const circles = page.getByTestId(componentTestId).elements();
      await expect.poll(() => circles.length).toBe(3);

      // First and third items have category 'A' → steelblue
      expect(circles[0].getAttribute('fill')).toBe('steelblue');
      expect(circles[2].getAttribute('fill')).toBe('steelblue');
      // Second item has category 'B' → coral
      expect(circles[1].getAttribute('fill')).toBe('coral');
    });

    it('should pass literal CSS colors through unchanged in data mode', async () => {
      render(TestHarness, {
        component: Circle,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          cx: 'date',
          cy: 'value',
          r: 5,
          fill: 'red',
        },
      });

      const circles = page.getByTestId(componentTestId).elements();
      await expect.poll(() => circles.length).toBe(3);

      // 'red' is not a data property, so it's used as-is
      expect(circles[0].getAttribute('fill')).toBe('red');
      expect(circles[1].getAttribute('fill')).toBe('red');
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [{ date: new Date('2024-01-01'), value: 20 }];

      render(TestHarness, {
        component: Circle,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          data: explicitData,
          cx: 'date',
          cy: 'value',
          r: 5,
        },
      });

      const circles = page.getByTestId(componentTestId).elements();
      await expect.poll(() => circles.length).toBe(1);
    });
  });
});
