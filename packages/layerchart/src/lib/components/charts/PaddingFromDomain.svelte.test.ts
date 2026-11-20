import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PaddingFromDomain from './__fixtures__/PaddingFromDomain.svelte';
import BarChart from './BarChart/BarChart.svelte';
import LineChart from './LineChart/LineChart.svelte';

const data = [
  { x: 'a', y: 120 },
  { x: 'b', y: 80 },
];

describe('padding derived from the bound domain (#1009)', () => {
  it.each([
    ['BarChart', BarChart],
    ['LineChart', LineChart],
  ] as const)('%s renders without a derived cycle', async (_name, component) => {
    let context: any;

    const { container } = render(PaddingFromDomain, {
      component,
      data,
      x: 'x',
      y: 'y',
      width: 400,
      height: 300,
      onbind: (c: any) => (context = c),
    });

    await expect.element(container.querySelector<HTMLElement>('.lc-root-container')).toBeInTheDocument();
    await expect.poll(() => context?.yDomain?.[1]).toBe(120);
    // `String(120).length * 8 + 16`
    await expect.poll(() => context?.padding.left).toBe(40);
  });
});
