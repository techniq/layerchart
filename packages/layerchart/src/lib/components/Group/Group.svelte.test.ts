import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from '$lib/tests/TestHarness.svelte';
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

  describe('seriesKey', () => {
    const seriesChartProps = {
      data: [{ date: new Date('2024-01-01'), apples: 20, bananas: 10 }],
      x: 'date',
      series: [
        { key: 'apples', value: 'apples' },
        { key: 'bananas', value: 'bananas' },
      ],
    };

    function groups() {
      return page.getByTestId(componentTestId).elements();
    }

    it('fades while another series is highlighted', async () => {
      let ctx: any;
      render(TestHarness, {
        component: Group,
        chartProps: seriesChartProps,
        componentProps: { seriesKey: 'apples' },
        oncontext: (c: any) => (ctx = c),
      } as any);

      await expect.poll(() => groups()[0]?.getAttribute('opacity')).toBe(null);

      ctx.series.setHighlight('bananas');
      await expect.poll(() => groups()[0]?.getAttribute('opacity')).toBe('0.1');

      ctx.series.setHighlight('apples');
      await expect.poll(() => groups()[0]?.getAttribute('opacity')).toBe(null);

      ctx.series.setHighlight(null);
      await expect.poll(() => groups()[0]?.getAttribute('opacity')).toBe(null);
    });

    it('dims the `opacity` prop rather than replacing it', async () => {
      let ctx: any;
      render(TestHarness, {
        component: Group,
        chartProps: seriesChartProps,
        componentProps: { seriesKey: 'apples', opacity: 0.5 },
        oncontext: (c: any) => (ctx = c),
      } as any);

      await expect.poll(() => groups()[0]?.getAttribute('opacity')).toBe('0.5');

      ctx.series.setHighlight('bananas');
      await expect.poll(() => groups()[0]?.getAttribute('opacity')).toBe('0.05');
    });

    it('is removed while the legend has its series hidden', async () => {
      let ctx: any;
      render(TestHarness, {
        component: Group,
        chartProps: seriesChartProps,
        componentProps: { seriesKey: 'apples' },
        oncontext: (c: any) => (ctx = c),
      } as any);

      await expect.poll(() => groups().length).toBe(1);

      ctx.series.selectedKeys.toggle('bananas');
      await expect.poll(() => groups().length).toBe(0);

      ctx.series.selectedKeys.toggle('bananas');
      await expect.poll(() => groups().length).toBe(1);
    });

    it('leaves a group alone when its key names no series', async () => {
      let ctx: any;
      render(TestHarness, {
        component: Group,
        chartProps: seriesChartProps,
        componentProps: { seriesKey: 'unrelated' },
        oncontext: (c: any) => (ctx = c),
      } as any);

      ctx.series.setHighlight('bananas');
      await expect.poll(() => groups().length).toBe(1);
      expect(groups()[0]?.getAttribute('opacity')).toBe(null);

      ctx.series.selectedKeys.toggle('bananas');
      await expect.poll(() => groups().length).toBe(1);
    });
  });
});
