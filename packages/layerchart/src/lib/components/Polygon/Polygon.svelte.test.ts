import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from '../tests/TestHarness.svelte';
import Polygon from './Polygon.svelte';

describe('Polygon', () => {
  describe('pixel mode', () => {
    it('should render a polygon with pixel values', async () => {
      render(TestHarness, {
        component: Polygon,
        componentProps: {
          cx: 50,
          cy: 50,
          r: 20,
          points: 6,
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

    it('should render one polygon per data item with string accessors', async () => {
      render(TestHarness, {
        component: Polygon,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          cx: 'date',
          cy: 'value',
          r: 8,
          points: 6,
        },
      });

      const polygons = page.getByTestId(componentTestId).elements();
      await expect.poll(() => polygons.length).toBe(3);
    });

    it('should resolve data-driven fill through cScale', async () => {
      const colorData = [
        { date: new Date('2024-01-01'), value: 20, category: 'A' },
        { date: new Date('2024-02-01'), value: 40, category: 'B' },
        { date: new Date('2024-03-01'), value: 60, category: 'A' },
      ];

      render(TestHarness, {
        component: Polygon,
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
          r: 8,
          points: 6,
          fill: 'category',
        },
      });

      const polygons = page.getByTestId(componentTestId).elements();
      await expect.poll(() => polygons.length).toBe(3);

      expect(polygons[0].getAttribute('fill')).toBe('steelblue');
      expect(polygons[1].getAttribute('fill')).toBe('coral');
      expect(polygons[2].getAttribute('fill')).toBe('steelblue');
    });

    it('should pass literal CSS colors through unchanged in data mode', async () => {
      render(TestHarness, {
        component: Polygon,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          cx: 'date',
          cy: 'value',
          r: 8,
          points: 6,
          fill: 'red',
        },
      });

      const polygons = page.getByTestId(componentTestId).elements();
      await expect.poll(() => polygons.length).toBe(3);

      expect(polygons[0].getAttribute('fill')).toBe('red');
      expect(polygons[1].getAttribute('fill')).toBe('red');
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [{ date: new Date('2024-01-01'), value: 20 }];

      render(TestHarness, {
        component: Polygon,
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
          r: 8,
          points: 6,
        },
      });

      const polygons = page.getByTestId(componentTestId).elements();
      await expect.poll(() => polygons.length).toBe(1);
    });
  });
});
