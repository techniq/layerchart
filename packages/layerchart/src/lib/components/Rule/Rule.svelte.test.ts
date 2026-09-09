import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '$lib/tests/TestHarness.svelte';
import Rule from './Rule.svelte';

describe('Rule', () => {
  describe('seriesKey', () => {
    const chartProps = {
      data: [
        { date: new Date('2024-01-01'), apples: 20, bananas: 10 },
        { date: new Date('2024-02-01'), apples: 40, bananas: 30 },
      ],
      x: 'date',
      yDomain: [0, 100],
      series: [
        { key: 'apples', value: 'apples' },
        { key: 'bananas', value: 'bananas' },
      ],
    };

    function group() {
      return document.querySelector('.lc-rule-g');
    }

    it('fades while another series is highlighted', async () => {
      let ctx: any;
      render(TestHarness, {
        component: Rule,
        chartProps,
        componentProps: { y: 30, seriesKey: 'apples' },
        oncontext: (c: any) => (ctx = c),
      } as any);

      await expect.poll(() => group()).not.toBe(null);
      expect(group()?.getAttribute('opacity')).toBe(null);

      ctx.series.setHighlight('bananas');
      await expect.poll(() => group()?.getAttribute('opacity')).toBe('0.1');

      ctx.series.setHighlight('apples');
      await expect.poll(() => group()?.getAttribute('opacity')).toBe(null);
    });

    it('is removed while the legend has its series hidden', async () => {
      let ctx: any;
      render(TestHarness, {
        component: Rule,
        chartProps,
        componentProps: { y: 30, seriesKey: 'apples' },
        oncontext: (c: any) => (ctx = c),
      } as any);

      await expect.poll(() => document.querySelectorAll('.lc-rule-y-line').length).toBe(1);

      ctx.series.selectedKeys.toggle('bananas');
      await expect.poll(() => document.querySelectorAll('.lc-rule-y-line').length).toBe(0);

      ctx.series.selectedKeys.toggle('bananas');
      await expect.poll(() => document.querySelectorAll('.lc-rule-y-line').length).toBe(1);
    });

    it('does not put `seriesKey` on the rendered line', async () => {
      render(TestHarness, {
        component: Rule,
        chartProps,
        componentProps: { y: 30, seriesKey: 'apples' },
      });

      await expect.poll(() => document.querySelector('.lc-rule-y-line')).not.toBe(null);
      expect(document.querySelector('.lc-rule-y-line')?.getAttribute('seriesKey')).toBe(null);
    });

    it('leaves the rule alone without a `seriesKey`', async () => {
      let ctx: any;
      render(TestHarness, {
        component: Rule,
        chartProps,
        componentProps: { y: 30 },
        oncontext: (c: any) => (ctx = c),
      } as any);

      ctx.series.setHighlight('bananas');
      ctx.series.selectedKeys.toggle('bananas');

      await expect.poll(() => document.querySelectorAll('.lc-rule-y-line').length).toBe(1);
      expect(group()?.getAttribute('opacity')).toBe(null);
    });
  });
});
