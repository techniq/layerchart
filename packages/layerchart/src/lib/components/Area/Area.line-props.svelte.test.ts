import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';

import TestHarness from '$lib/tests/TestHarness.svelte';
import Area from './Area.svelte';

const data = [
  { date: new Date('2024-01-01'), value: 10, group: 'a' },
  { date: new Date('2024-02-01'), value: 30, group: 'a' },
  { date: new Date('2024-03-01'), value: 20, group: 'a' },
  { date: new Date('2024-01-01'), value: 50, group: 'b' },
  { date: new Date('2024-02-01'), value: 40, group: 'b' },
  { date: new Date('2024-03-01'), value: 60, group: 'b' },
];

const chartProps = (extra: Record<string, any> = {}) => ({
  data,
  x: 'date',
  y: 'value',
  yDomain: [0, 100],
  ...extra,
});

const linePath = () => document.querySelector('.lc-area-line');
const fillPath = () => document.querySelector('.lc-area-path');

describe('Area line prop forwarding', () => {
  // These query the document, so a leftover chart from the previous test would answer first
  beforeEach(cleanup);

  it('applies `mask` to the line as well as the fill', async () => {
    render(TestHarness, {
      chartProps: chartProps(),
      component: Area,
      componentProps: { line: true, mask: 'url(#reveal)' },
    });
    await expect.poll(() => linePath()).toBeTruthy();
    expect(fillPath()?.getAttribute('mask')).toBe('url(#reveal)');
    expect(linePath()?.getAttribute('mask')).toBe('url(#reveal)');
  });

  it('applies `filter` and `clip-path` to both paths', async () => {
    render(TestHarness, {
      chartProps: chartProps(),
      component: Area,
      componentProps: { line: true, filter: 'url(#glow)', 'clip-path': 'url(#plot)' },
    });
    await expect.poll(() => linePath()).toBeTruthy();
    expect(linePath()?.getAttribute('filter')).toBe('url(#glow)');
    expect(linePath()?.getAttribute('clip-path')).toBe('url(#plot)');
  });

  it('lets `line` override a forwarded value', async () => {
    render(TestHarness, {
      chartProps: chartProps(),
      component: Area,
      componentProps: { line: { mask: 'url(#line-only)' }, mask: 'url(#reveal)' },
    });
    await expect.poll(() => linePath()).toBeTruthy();
    expect(linePath()?.getAttribute('mask')).toBe('url(#line-only)');
    expect(fillPath()?.getAttribute('mask')).toBe('url(#reveal)');
  });

  it('keeps `id` and click handlers on the fill path only', async () => {
    let clicks = 0;
    render(TestHarness, {
      chartProps: chartProps(),
      component: Area,
      componentProps: { line: true, id: 'the-area', onclick: () => clicks++ },
    });
    await expect.poll(() => linePath()).toBeTruthy();
    expect(fillPath()?.getAttribute('id')).toBe('the-area');
    expect(linePath()?.getAttribute('id')).toBe(null);

    (fillPath() as SVGPathElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toBe(1);
  });

  it('forwards to every line when grouped by `z`', async () => {
    render(TestHarness, {
      chartProps: chartProps({ z: 'group' }),
      component: Area,
      componentProps: { line: true, mask: 'url(#reveal)' },
    });
    await expect.poll(() => document.querySelectorAll('.lc-area-line').length).toBe(2);
    for (const line of document.querySelectorAll('.lc-area-line')) {
      expect(line.getAttribute('mask')).toBe('url(#reveal)');
    }
  });
});
