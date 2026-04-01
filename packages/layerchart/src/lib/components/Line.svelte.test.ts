import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from './tests/TestHarness.svelte';
import Line from './Line.svelte';

describe('Line', () => {
  describe('pixel mode', () => {
    it('should render a line with pixel values', async () => {
      render(TestHarness, {
        component: Line,
        componentProps: {
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
    });
  });

  describe('data mode', () => {
    const data = [
      { date: new Date('2024-01-01'), value: 20 },
      { date: new Date('2024-02-01'), value: 40 },
      { date: new Date('2024-03-01'), value: 60 },
    ];

    it('should render one line per data item with string accessors', async () => {
      render(TestHarness, {
        component: Line,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x1: 'date',
          y1: (d: any) => 0,
          x2: 'date',
          y2: 'value',
        },
      });

      const lines = page.getByTestId(componentTestId).elements();
      await expect.poll(() => lines.length).toBe(3);
    });

    it('should resolve data-driven stroke through cScale', async () => {
      const colorData = [
        { date: new Date('2024-01-01'), value: 20, category: 'A' },
        { date: new Date('2024-02-01'), value: 40, category: 'B' },
        { date: new Date('2024-03-01'), value: 60, category: 'A' },
      ];

      render(TestHarness, {
        component: Line,
        chartProps: {
          data: colorData,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
          c: 'category',
          cRange: ['steelblue', 'coral'],
        },
        componentProps: {
          x1: 'date',
          y1: (d: any) => 0,
          x2: 'date',
          y2: 'value',
          stroke: 'category',
        },
      });

      const lines = page.getByTestId(componentTestId).elements();
      await expect.poll(() => lines.length).toBe(3);

      expect(lines[0].getAttribute('stroke')).toBe('steelblue');
      expect(lines[1].getAttribute('stroke')).toBe('coral');
      expect(lines[2].getAttribute('stroke')).toBe('steelblue');
    });

    it('should pass literal CSS colors through unchanged in data mode', async () => {
      render(TestHarness, {
        component: Line,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x1: 'date',
          y1: (d: any) => 0,
          x2: 'date',
          y2: 'value',
          stroke: 'red',
        },
      });

      const lines = page.getByTestId(componentTestId).elements();
      await expect.poll(() => lines.length).toBe(3);

      expect(lines[0].getAttribute('stroke')).toBe('red');
      expect(lines[1].getAttribute('stroke')).toBe('red');
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [{ date: new Date('2024-01-01'), value: 20 }];

      render(TestHarness, {
        component: Line,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          data: explicitData,
          x1: 'date',
          y1: (d: any) => 0,
          x2: 'date',
          y2: 'value',
        },
      });

      const lines = page.getByTestId(componentTestId).elements();
      await expect.poll(() => lines.length).toBe(1);
    });
  });
});
