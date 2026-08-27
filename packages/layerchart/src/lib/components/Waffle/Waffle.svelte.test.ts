import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import StackedWaffle from './__fixtures__/StackedWaffle.svelte';

describe('Waffle mark registration', () => {
  const data = [
    { period: 'Q1', apples: 400, bananas: 300 },
    { period: 'Q2', apples: 200, bananas: 500 },
  ];
  const series = [
    { key: 'apples', color: 'red' },
    { key: 'bananas', color: 'yellow' },
  ];

  it('settles instead of re-registering itself in a loop', async () => {
    // `Waffle`'s registered mark info tracks its props, so anything the chart derives from the
    // mark registry and then feeds back into the scales would re-register on every pass.  A loop
    // here blows the update depth rather than failing an assertion, so rendering at all is the test
    const { container } = render(StackedWaffle, { props: { data, series } } as any);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('.lc-waffle path, .lc-waffle rect').length).toBeGreaterThan(
        0
      );
    });
  });
});
