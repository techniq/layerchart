import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '../tests/TestHarness.svelte';
import Spline from './Spline.svelte';

/** Two series interleaved in one flat array, as long-format data arrives */
const data = [
  { group: 'a', date: new Date('2024-01-01'), value: 10, kind: 'first' },
  { group: 'b', date: new Date('2024-01-01'), value: 50, kind: 'second' },
  { group: 'a', date: new Date('2024-02-01'), value: 20, kind: 'first' },
  { group: 'b', date: new Date('2024-02-01'), value: 60, kind: 'second' },
  { group: 'a', date: new Date('2024-03-01'), value: 30, kind: 'first' },
  { group: 'b', date: new Date('2024-03-01'), value: 70, kind: 'second' },
];

const chartProps = (extra: Record<string, any> = {}) => ({
  data,
  x: 'date',
  y: 'value',
  yDomain: [0, 100],
  ...extra,
});

function paths() {
  return Array.from(document.querySelectorAll('svg path'));
}

describe('Spline', () => {
  describe('z (grouping)', () => {
    it('draws one path per group from a single mark', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: { z: 'group' },
      });

      await expect.poll(() => paths().length).toBe(2);
    });

    it('splits the data rather than drawing one line through every point', async () => {
      // Without `z` the interleaved rows are a single zig-zag path
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: {},
      });

      await expect.poll(() => paths().length).toBe(1);
      const single = paths()[0].getAttribute('d')!;
      expect(single.split('L')).toHaveLength(data.length); // every point, one path
    });

    it('falls back to the chart`s `z` accessor', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({ z: 'group' }),
        componentProps: {},
      });

      await expect.poll(() => paths().length).toBe(2);
    });

    it('takes its own `z` over the chart`s', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({ z: 'group' }),
        // `kind` is 1:1 with `group` here, so the count matches — what matters is that the
        // override is read at all, which the `null` case below pins down
        componentProps: { z: () => 'all' },
      });

      await expect.poll(() => paths().length).toBe(1);
    });

    it('is implied by a `stroke` naming a data property', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({ c: 'group', cRange: ['red', 'blue'] }),
        componentProps: { stroke: 'group' },
      });

      await expect.poll(() => paths().length).toBe(2);
    });

    it('is not implied by a CSS color', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: { stroke: 'var(--color-danger)' },
      });

      await expect.poll(() => paths().length).toBe(1);
    });

    it('is not implied by a string that names nothing in the data', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: { stroke: 'rebeccapurple' },
      });

      await expect.poll(() => paths().length).toBe(1);
    });

    it('an explicit `z` wins over the one `stroke` would imply', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({ c: 'group', cRange: ['red', 'blue'] }),
        // `kind` splits the same way as `group`, but `z: null`-style single grouping proves
        // the explicit prop is what's read
        componentProps: { z: () => 'all', stroke: 'group' },
      });

      await expect.poll(() => paths().length).toBe(1);
    });

    it('still splits by style function within each group', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: {
          z: 'group',
          // alternates every point, so each 3-point line becomes 2 segments
          opacity: (d: any) => (d.value % 20 === 0 ? 1 : 0.5),
        },
      });

      await expect.poll(() => paths().length).toBeGreaterThan(2);
    });
  });

  describe('class', () => {
    it('resolves per line when given a function', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: {
          z: 'group',
          class: (d: any) => (d.group === 'a' ? 'first-line' : 'second-line'),
        },
      });

      await expect.poll(() => paths().length).toBe(2);
      const classes = paths().map((p) => p.getAttribute('class'));
      expect(classes[0]).toContain('first-line');
      expect(classes[1]).toContain('second-line');
    });

    it('applies a static string to every line', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: { z: 'group', class: 'shared' },
      });

      await expect.poll(() => paths().length).toBe(2);
      expect(paths().every((p) => p.getAttribute('class')?.includes('shared'))).toBe(true);
    });

    it('applies a static string without `z`', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: { class: 'solo' },
      });

      await expect.poll(() => paths()[0]?.getAttribute('class')).toContain('solo');
    });
  });

  describe('stroke', () => {
    it('resolves a data property through the chart`s color scale', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({
          c: 'group',
          cRange: ['rgb(255, 0, 0)', 'rgb(0, 0, 255)'],
        }),
        componentProps: { z: 'group', stroke: 'group' },
      });

      await expect.poll(() => paths().length).toBe(2);
      const strokes = paths().map((p) => p.getAttribute('stroke'));
      expect(strokes).toEqual(['rgb(255, 0, 0)', 'rgb(0, 0, 255)']);
    });

    it('falls back to the colors declared on `series`, with no `c` scale configured', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({
          series: [
            { key: 'a', color: 'rgb(255, 0, 0)' },
            { key: 'b', color: 'rgb(0, 0, 255)' },
          ],
        }),
        componentProps: { stroke: 'group' },
      });

      await expect.poll(() => paths().length).toBe(2);
      expect(paths().map((p) => p.getAttribute('stroke'))).toEqual([
        'rgb(255, 0, 0)',
        'rgb(0, 0, 255)',
      ]);
    });

    it('keeps the raw value when `series` colors do not cover it', async () => {
      // The series-derived scale only knows its own keys — anything else behaves as it would
      // with no scale at all, rather than wrapping around the palette
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({ series: [{ key: 'nope', color: 'rgb(255, 0, 0)' }] }),
        componentProps: { stroke: 'group' },
      });

      await expect.poll(() => paths().length).toBe(2);
      expect(paths().map((p) => p.getAttribute('stroke'))).toEqual(['a', 'b']);
    });

    it('leaves a CSS color literal alone', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps({ c: 'group', cRange: ['red', 'blue'] }),
        componentProps: { stroke: 'var(--color-danger)' },
      });

      await expect.poll(() => paths()[0]?.getAttribute('stroke')).toBe('var(--color-danger)');
    });

    it('leaves a named color alone when it is not a data property', async () => {
      render(TestHarness, {
        component: Spline,
        chartProps: chartProps(),
        componentProps: { stroke: 'rebeccapurple' },
      });

      await expect.poll(() => paths()[0]?.getAttribute('stroke')).toBe('rebeccapurple');
    });
  });
});
