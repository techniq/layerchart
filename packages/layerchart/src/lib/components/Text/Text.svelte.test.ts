import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from '../tests/TestHarness.svelte';
import Text from './Text.svelte';

describe('Text', () => {
  describe('pixel mode', () => {
    it('should render text with pixel values', async () => {
      render(TestHarness, {
        component: Text,
        componentProps: {
          x: 50,
          y: 50,
          value: 'Hello',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
    });

    it('should preserve CSS-like string values as SVG values', async () => {
      render(TestHarness, {
        component: Text,
        componentProps: {
          x: '50%',
          y: '50%',
          value: 'Centered',
          textAnchor: 'middle',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
    });
  });

  describe('data mode', () => {
    const data = [
      { date: new Date('2024-01-01'), value: 20, label: 'A' },
      { date: new Date('2024-02-01'), value: 40, label: 'B' },
      { date: new Date('2024-03-01'), value: 60, label: 'C' },
    ];

    it('should render one text per data item with string accessors', async () => {
      render(TestHarness, {
        component: Text,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x: 'date',
          y: 'value',
          value: (d: any) => d.label,
        },
      });

      const texts = page.getByTestId(componentTestId).elements();
      await expect.poll(() => texts.length).toBe(3);
    });

    it('should resolve value as data property name in data mode', async () => {
      render(TestHarness, {
        component: Text,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x: 'date',
          y: 'value',
          value: 'label',
        },
      });

      const texts = page.getByTestId(componentTestId).elements();
      await expect.poll(() => texts.length).toBe(3);

      // Check that the text content is resolved from the data property
      const tspans = document.querySelectorAll('.lc-text-tspan');
      const textContents = Array.from(tspans).map((el) => el.textContent);
      expect(textContents).toEqual(['A', 'B', 'C']);
    });

    it('should resolve data-driven fill through cScale', async () => {
      const colorData = [
        { date: new Date('2024-01-01'), value: 20, label: 'A', category: 'X' },
        { date: new Date('2024-02-01'), value: 40, label: 'B', category: 'Y' },
        { date: new Date('2024-03-01'), value: 60, label: 'C', category: 'X' },
      ];

      render(TestHarness, {
        component: Text,
        chartProps: {
          data: colorData,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
          c: 'category',
          cRange: ['steelblue', 'coral'],
        },
        componentProps: {
          x: 'date',
          y: 'value',
          value: 'label',
          fill: 'category',
        },
      });

      const texts = page.getByTestId(componentTestId).elements();
      await expect.poll(() => texts.length).toBe(3);

      // Text elements are <text> inside <svg>, check the fill attribute
      expect(texts[0].getAttribute('fill')).toBe('steelblue');
      expect(texts[1].getAttribute('fill')).toBe('coral');
      expect(texts[2].getAttribute('fill')).toBe('steelblue');
    });

    it('should pass literal CSS colors through unchanged in data mode', async () => {
      render(TestHarness, {
        component: Text,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x: 'date',
          y: 'value',
          value: 'label',
          fill: 'red',
        },
      });

      const texts = page.getByTestId(componentTestId).elements();
      await expect.poll(() => texts.length).toBe(3);

      expect(texts[0].getAttribute('fill')).toBe('red');
      expect(texts[1].getAttribute('fill')).toBe('red');
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [{ date: new Date('2024-01-01'), value: 20, label: 'Only' }];

      render(TestHarness, {
        component: Text,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          data: explicitData,
          x: 'date',
          y: 'value',
          value: 'label',
        },
      });

      const texts = page.getByTestId(componentTestId).elements();
      await expect.poll(() => texts.length).toBe(1);
    });

    it('should enter data mode when only `data` prop is set, using chart accessors', async () => {
      render(TestHarness, {
        component: Text,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          data,
          value: 'label',
        },
      });

      const texts = page.getByTestId(componentTestId).elements();
      await expect.poll(() => texts.length).toBe(3);

      const ys = texts.map((t) => Number(t.getAttribute('y')));
      expect(ys[0]).toBeGreaterThan(ys[1]);
      expect(ys[1]).toBeGreaterThan(ys[2]);
    });

    it('should fall back to chart x accessor when only y is omitted', async () => {
      render(TestHarness, {
        component: Text,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          data,
          x: 'date',
          value: 'label',
        },
      });

      const texts = page.getByTestId(componentTestId).elements();
      await expect.poll(() => texts.length).toBe(3);

      const ys = texts.map((t) => Number(t.getAttribute('y')));
      expect(ys[0]).toBeGreaterThan(ys[2]);
    });
  });
});
