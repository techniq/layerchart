import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';

import ChartCoreTestHarness from '../tests/ChartCoreTestHarness.svelte';

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
  { x: 2, y: 30 },
];

describe('ChartCore', () => {
  it('should render the children snippet content', async () => {
    const { container } = render(ChartCoreTestHarness, {
      chartProps: { data, x: 'x', y: 'y', height: 200 },
    });

    await tick();

    // Children snippet renders a <div data-testid="children-content">
    expect(container.querySelector('[data-testid="children-content"]')).not.toBeNull();
  });

  it('should NOT render ChartChildren-injected marks (Axis, Grid, Rule, Highlight)', async () => {
    const { container } = render(ChartCoreTestHarness, {
      chartProps: { data, x: 'x', y: 'y', height: 200 },
    });

    await tick();

    // Compare to <Chart>: those classes would be present. ChartCore skips them.
    expect(container.querySelector('.lc-axis')).toBeNull();
    expect(container.querySelector('.lc-grid')).toBeNull();
    expect(container.querySelector('.lc-rule')).toBeNull();
    expect(container.querySelector('.lc-highlight-area')).toBeNull();
  });

  it('should expose the chart context to children', async () => {
    let chartContext: any;

    render(ChartCoreTestHarness, {
      chartProps: { data, x: 'x', y: 'y', height: 200 },
      oncontext: (ctx: any) => {
        chartContext = ctx;
      },
    });

    await tick();

    expect(chartContext).toBeDefined();
    expect(chartContext.width).toBeGreaterThan(0);
    expect(chartContext.height).toBeGreaterThan(0);
  });

  it('should render the root container', async () => {
    const { container } = render(ChartCoreTestHarness, {
      chartProps: { data, x: 'x', y: 'y', height: 200 },
    });

    await tick();

    expect(container.querySelector('.lc-root-container')).not.toBeNull();
  });
});
