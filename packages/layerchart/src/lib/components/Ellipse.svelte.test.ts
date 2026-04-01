import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from './tests/TestHarness.svelte';
import Ellipse from './Ellipse.svelte';

describe('Ellipse', () => {
  describe('pixel mode', () => {
    it('should render an ellipse with pixel values', async () => {
      render(TestHarness, {
        component: Ellipse,
        componentProps: {
          cx: 50,
          cy: 50,
          rx: 30,
          ry: 20,
          fill: 'red',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      expect(el.element()?.getAttribute('cx')).toBe('50');
      expect(el.element()?.getAttribute('cy')).toBe('50');
      expect(el.element()?.getAttribute('rx')).toBe('30');
      expect(el.element()?.getAttribute('ry')).toBe('20');
    });
  });

  describe('data mode', () => {
    const data = [
      { date: new Date('2024-01-01'), value: 20 },
      { date: new Date('2024-02-01'), value: 40 },
      { date: new Date('2024-03-01'), value: 60 },
    ];

    it('should render one ellipse per data item with string accessors', async () => {
      render(TestHarness, {
        component: Ellipse,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          cx: 'date',
          cy: 'value',
          rx: 10,
          ry: 5,
        },
      });

      const ellipses = page.getByTestId(componentTestId).elements();
      await expect.poll(() => ellipses.length).toBe(3);
    });

    it('should resolve data-driven fill through cScale', async () => {
      const colorData = [
        { date: new Date('2024-01-01'), value: 20, category: 'A' },
        { date: new Date('2024-02-01'), value: 40, category: 'B' },
        { date: new Date('2024-03-01'), value: 60, category: 'A' },
      ];

      render(TestHarness, {
        component: Ellipse,
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
          rx: 10,
          ry: 5,
          fill: 'category',
        },
      });

      const ellipses = page.getByTestId(componentTestId).elements();
      await expect.poll(() => ellipses.length).toBe(3);

      expect(ellipses[0].getAttribute('fill')).toBe('steelblue');
      expect(ellipses[1].getAttribute('fill')).toBe('coral');
      expect(ellipses[2].getAttribute('fill')).toBe('steelblue');
    });

    it('should pass literal CSS colors through unchanged in data mode', async () => {
      render(TestHarness, {
        component: Ellipse,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          cx: 'date',
          cy: 'value',
          rx: 10,
          ry: 5,
          fill: 'red',
        },
      });

      const ellipses = page.getByTestId(componentTestId).elements();
      await expect.poll(() => ellipses.length).toBe(3);

      expect(ellipses[0].getAttribute('fill')).toBe('red');
      expect(ellipses[1].getAttribute('fill')).toBe('red');
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [{ date: new Date('2024-01-01'), value: 20 }];

      render(TestHarness, {
        component: Ellipse,
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
          rx: 10,
          ry: 5,
        },
      });

      const ellipses = page.getByTestId(componentTestId).elements();
      await expect.poll(() => ellipses.length).toBe(1);
    });
  });
});
