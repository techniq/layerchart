import { describe, expect, it, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestHarness from '$lib/tests/TestHarness.svelte';
import MountCounter, {
  mountCounts,
  resetMountCounts,
  sizeAtConstruction,
} from '$lib/tests/MountCounter.svelte';

/**
 * `Chart` used to wrap its subtree in `{#key chartState.isMounted}`, remounting every child once
 * the container had been measured — a leftover from when LayerCake reported a placeholder width
 * until `bind:clientWidth` ran.  Children paid for it twice: double DOM construction, replayed
 * intro animations, and mount-time registrations that had to guard against a spurious teardown.
 */
describe('Chart child lifecycle', () => {
  beforeEach(resetMountCounts);

  it('mounts children exactly once', async () => {
    render(TestHarness, {
      chartProps: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      component: MountCounter,
    });
    await expect.poll(() => mountCounts.mount).toBe(1);
    expect(mountCounts.destroy).toBe(0);
  });

  it('mounts children exactly once with a transform', async () => {
    render(TestHarness, {
      chartProps: {
        data: [{ x: 1, y: 1 }],
        x: 'x',
        y: 'y',
        transform: { mode: 'domain' as const, axis: 'x' as const },
      },
      component: MountCounter,
    });
    // `TransformContext` is lazy-loaded, so give the dynamic import a chance to land and rebuild
    // the subtree before asserting it did not.
    await expect.poll(() => mountCounts.mount).toBe(1);
    expect(mountCounts.destroy).toBe(0);
  });

  /**
   * Building the subtree once is only safe if it is built against the measured layout. Marks read
   * the scales as they are constructed, so a child that sees the placeholder would leave a mark
   * animating out of a 100x100 corner rather than the plot it belongs to.
   */
  it('builds children against the measured size, not the placeholder', async () => {
    render(TestHarness, {
      chartProps: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y' },
      component: MountCounter,
    });
    await expect.poll(() => mountCounts.mount).toBe(1);

    const container = document.querySelector('.lc-root-container') as HTMLElement;
    expect(container.clientWidth).toBeGreaterThan(100);
    expect(sizeAtConstruction.containerWidth).toBe(container.clientWidth);
    expect(sizeAtConstruction.width).toBeGreaterThan(0);
    expect(sizeAtConstruction.height).toBeGreaterThan(0);
  });
});
