import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TreemapOrderHarness from '$lib/tests/TreemapOrderHarness.svelte';

const data = {
  name: 'root',
  children: [
    {
      name: 'a',
      children: [
        { name: 'a1', value: 1 },
        { name: 'a2', value: 2 },
      ],
    },
    { name: 'b', value: 3 },
    { name: 'c', value: 2 },
  ],
};

/** The node names in the order `Treemap` handed them out */
async function order(chartProps: Record<string, any> = {}) {
  const screen = render(TreemapOrderHarness, {
    data,
    chartProps,
    // Siblings side by side along `x`, so which comes first depends only on the turn
    treemapProps: { tile: 'dice', paddingOuter: 2 },
  });
  let names: string[] = [];
  await expect
    .poll(() => {
      names = [...screen.container.querySelectorAll('.treemap-node')].map(
        (g) => g.getAttribute('data-name')!
      );
      return names.length;
    })
    .toBe(6);
  screen.unmount();
  return names;
}

describe('Treemap on an isometric chart', () => {
  it('keeps the layout order on a flat chart', async () => {
    expect(await order()).toEqual(['root', 'a', 'b', 'c', 'a1', 'a2']);
  });

  it('hands out each node, then its children’s subtrees whole', async () => {
    const names = await order({ isometric: true });
    expect(names[0]).toBe('root');
    // `a`'s children follow it directly, before any sibling of `a` that comes later
    const a = names.indexOf('a');
    expect(names.slice(a + 1, a + 3).sort()).toEqual(['a1', 'a2']);
  });

  it('puts siblings back to front, re-sorted as the view turns', async () => {
    // Turned so screen depth grows with `x`, then the opposite way round
    const rising = await order({ isometric: { rotate: 80 } });
    expect(rising).toEqual(['root', 'a', 'a1', 'a2', 'b', 'c']);
    const falling = await order({ isometric: { rotate: -100 } });
    expect(falling).toEqual(['root', 'c', 'b', 'a', 'a2', 'a1']);
  });
});
