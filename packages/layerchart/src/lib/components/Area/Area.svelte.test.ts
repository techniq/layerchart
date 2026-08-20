import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '../tests/TestHarness.svelte';
import Area from './Area.svelte';

/** Two series interleaved in one flat array, as long-format data arrives */
const data = [
  { group: 'a', date: new Date('2024-01-01'), value: 10 },
  { group: 'b', date: new Date('2024-01-01'), value: 50 },
  { group: 'a', date: new Date('2024-02-01'), value: 20 },
  { group: 'b', date: new Date('2024-02-01'), value: 60 },
  { group: 'a', date: new Date('2024-03-01'), value: 30 },
  { group: 'b', date: new Date('2024-03-01'), value: 70 },
];

const chartProps = (extra: Record<string, any> = {}) => ({
  data,
  x: 'date',
  y: 'value',
  yDomain: [0, 100],
  ...extra,
});

/** Only the area paths — `line` adds a Spline path alongside each */
function areaPaths() {
  return Array.from(document.querySelectorAll('svg path.lc-area-path'));
}

describe('Area', () => {
  describe('z (grouping)', () => {
    it('draws one area per group from a single mark', async () => {
      render(TestHarness, {
        component: Area,
        chartProps: chartProps(),
        componentProps: { z: 'group' },
      });

      await expect.poll(() => areaPaths().length).toBe(2);
    });

    it('draws a single area without it', async () => {
      render(TestHarness, {
        component: Area,
        chartProps: chartProps(),
        componentProps: {},
      });

      await expect.poll(() => areaPaths().length).toBe(1);
    });

    it('falls back to the chart`s `z` accessor', async () => {
      render(TestHarness, {
        component: Area,
        chartProps: chartProps({ z: 'group' }),
        componentProps: {},
      });

      await expect.poll(() => areaPaths().length).toBe(2);
    });

    it('is implied by a `fill` naming a data property', async () => {
      render(TestHarness, {
        component: Area,
        chartProps: chartProps({ c: 'group', cRange: ['rgb(255, 0, 0)', 'rgb(0, 0, 255)'] }),
        componentProps: { fill: 'group' },
      });

      await expect.poll(() => areaPaths().length).toBe(2);
      expect(areaPaths().map((p) => p.getAttribute('fill'))).toEqual([
        'rgb(255, 0, 0)',
        'rgb(0, 0, 255)',
      ]);
    });

    it('is not implied by a CSS color', async () => {
      render(TestHarness, {
        component: Area,
        chartProps: chartProps(),
        componentProps: { fill: 'var(--color-info)' },
      });

      await expect.poll(() => areaPaths().length).toBe(1);
      expect(areaPaths()[0].getAttribute('fill')).toBe('var(--color-info)');
    });

    it('draws a line per group when `line` is enabled', async () => {
      render(TestHarness, {
        component: Area,
        chartProps: chartProps(),
        componentProps: { z: 'group', line: true },
      });

      await expect.poll(() => areaPaths().length).toBe(2);
      await expect.poll(() => document.querySelectorAll('svg path.lc-area-line').length).toBe(2);
    });
  });

  describe('class', () => {
    it('resolves per area when given a function', async () => {
      render(TestHarness, {
        component: Area,
        chartProps: chartProps(),
        componentProps: {
          z: 'group',
          class: (d: any) => (d.group === 'a' ? 'first-area' : 'second-area'),
        },
      });

      await expect.poll(() => areaPaths().length).toBe(2);
      const classes = areaPaths().map((p) => p.getAttribute('class'));
      expect(classes[0]).toContain('first-area');
      expect(classes[1]).toContain('second-area');
    });
  });
});
