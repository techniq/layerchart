import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import type { ChartState, ComponentNode } from './chart.svelte.js';
import ComponentNodeLifecycleHarness from './__fixtures__/ComponentNodeLifecycleHarness.svelte';

describe('ChartState registerComponentNode', () => {
  it('cleans up child nodes and mark registrations when components unmount', async () => {
    let chartContext: ChartState<any, any, any> | undefined;
    let parentNode: ComponentNode | undefined;

    render(ComponentNodeLifecycleHarness, {
      oncontext: (ctx: ChartState<any, any, any>) => {
        chartContext = ctx;
      },
      onparentnode: (node: ComponentNode) => {
        parentNode = node;
      },
    });

    const toggle = page.getByTestId('toggle-child');
    const child = page.getByTestId('component-node-lifecycle-child');

    await expect.element(toggle).toBeInTheDocument();
    await expect.element(child).toBeInTheDocument();
    await expect.poll(() => parentNode?.children.length ?? -1).toBe(1);
    await expect.poll(() => chartContext?.series.isDefaultSeries ?? true).toBe(false);

    await toggle.click();

    await expect.element(child).not.toBeInTheDocument();
    await expect.poll(() => parentNode?.children.length ?? -1).toBe(0);
    await expect.poll(() => chartContext?.series.isDefaultSeries ?? false).toBe(true);
  });
});
