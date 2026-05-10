import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from '../tests/TestHarness.svelte';
import Group from './Group.svelte';

describe('Group', () => {
  describe('pixel mode', () => {
    it('should render a group with pixel translation', async () => {
      render(TestHarness, {
        component: Group,
        componentProps: {
          x: 50,
          y: 50,
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

    it('should render one group per data item with string accessors', async () => {
      render(TestHarness, {
        component: Group,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          x: 'date',
          y: 'value',
        },
      });

      const groups = page.getByTestId(componentTestId).elements();
      await expect.poll(() => groups.length).toBe(3);
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [{ date: new Date('2024-01-01'), value: 20 }];

      render(TestHarness, {
        component: Group,
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
        },
      });

      const groups = page.getByTestId(componentTestId).elements();
      await expect.poll(() => groups.length).toBe(1);
    });
  });
});
