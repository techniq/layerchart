import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BarsStackTestHarness from '$lib/tests/BarsStackTestHarness.svelte';

/** Long rows — the category is a column, so no `series` names the layers */
const longData = [
  { month: 'Jan', fruit: 'apples', value: 30 },
  { month: 'Jan', fruit: 'bananas', value: 20 },
  { month: 'Feb', fruit: 'apples', value: 40 },
  { month: 'Feb', fruit: 'bananas', value: 10 },
];

const chartProps = (extra: Record<string, any> = {}) => ({
  data: longData,
  x: 'month',
  y: 'value',
  c: 'fruit',
  bandPadding: 0.2,
  yDomain: [0, 50],
  height: 100,
  width: 200,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  ...extra,
});

async function bars() {
  await vi.waitFor(() => expect(document.querySelectorAll('.lc-bar').length).toBe(4));
  return Array.from(document.querySelectorAll('.lc-bar')).map((el) => {
    const box = (el as SVGGraphicsElement).getBBox();
    return { top: Math.round(box.y), bottom: Math.round(box.y + box.height) };
  });
}

describe('Bars stacked by category', () => {
  it('should stack without a `seriesKey`, since the rows name the layers', async () => {
    render(BarsStackTestHarness, { chartProps: chartProps({ seriesLayout: 'stack' }) });

    // yDomain [0, 50] over 100px: Jan is 30 + 20, so the segments meet at 50px from the top
    const [a, b] = (await bars()).slice(0, 2).sort((x, y) => y.bottom - x.bottom);
    expect(a.bottom).toBe(100); // the lower segment sits on the baseline
    expect(b.bottom).toBe(a.top); // and the upper one meets it
    expect(b.top).toBe(0); // 50 of 50, so the band fills the plot
  });

  it('should overlap when told to', async () => {
    // `c` names layers, so the default would stack these — `overlap` is how you say otherwise
    render(BarsStackTestHarness, { chartProps: chartProps({ seriesLayout: 'overlap' }) });

    // Every bar drawn from the baseline
    for (const bar of await bars()) expect(bar.bottom).toBe(100);
  });
});
