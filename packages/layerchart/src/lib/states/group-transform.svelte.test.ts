import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ChartGroupTestHarness from '$lib/tests/ChartGroupTestHarness.svelte';
import LineChart from '../components/charts/LineChart/LineChart.svelte';
import { ChartGroupState } from './group.svelte.js';
import type { ChartState } from './chart.svelte.js';

const data = [
  { date: new Date('2024-01-01'), value: 10 },
  { date: new Date('2024-01-11'), value: 30 },
  { date: new Date('2024-01-21'), value: 20 },
  { date: new Date('2024-01-31'), value: 50 },
];

const transformProps = { mode: 'domain' as const, axis: 'x' as const, scaleExtent: [1, 50] };

async function renderPair() {
  const group = new ChartGroupState({ domain: { axis: 'x' } });
  const contexts: ChartState<any, any, any>[] = [];

  render(ChartGroupTestHarness, {
    group,
    component: LineChart,
    members: [
      { chartProps: { data, x: 'date', y: 'value', transform: transformProps } },
      { chartProps: { data, x: 'date', y: 'value' } },
    ],
    oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
  } as any);

  await vi.waitFor(() => {
    expect(contexts[0]?.transformState).toBeTruthy();
    expect(contexts[1]).toBeTruthy();
  });

  return { group, zoomable: contexts[0], plain: contexts[1] };
}

describe('ChartGroup + transform', () => {
  it('settles with an animated transform', async () => {
    const group = new ChartGroupState({ domain: { axis: 'x' } });
    const contexts: ChartState<any, any, any>[] = [];
    render(ChartGroupTestHarness, {
      group,
      component: LineChart,
      members: [
        { chartProps: { data, x: 'date', y: 'value', transform: { ...transformProps, motion: 'spring' } } }, // prettier-ignore
        { chartProps: { data, x: 'date', y: 'value' } },
      ],
      oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    } as any);
    await vi.waitFor(() => expect(contexts[0]?.transformState).toBeTruthy());

    const range = [new Date('2024-01-06'), new Date('2024-01-16')];
    group.setDomain({ x: range, source: Symbol('elsewhere') });

    // The animation runs through many intermediate positions; none should be shared
    await new Promise((r) => setTimeout(r, 600));
    expect(+(group.domain.x as unknown as Date[])[0]).toBe(+range[0]);
    expect(+(group.domain.x as unknown as Date[])[1]).toBe(+range[1]);
  });

  it('publishes the domain a zoomed chart settles on', async () => {
    const { group, zoomable, plain } = await renderPair();
    expect(group.domain.active).toBe(false);

    zoomable.transform.setScale(2);
    zoomable.transform.setTranslate({ x: 0, y: 0 });

    await vi.waitFor(() => {
      expect(group.domain.active).toBe(true);
      expect(group.domain.source).toBe(zoomable.id);
    });

    // the other chart follows it
    await vi.waitFor(() => {
      expect(+(plain.xDomain as Date[])[1]).toBe(+(group.domain.x as Date[])[1]);
    });
  });

  it('zooms a transform chart to a domain shared by another', async () => {
    const { group, zoomable } = await renderPair();
    const range = [new Date('2024-01-06'), new Date('2024-01-16')];

    group.setDomain({ x: range, source: Symbol('elsewhere') });

    await vi.waitFor(() => {
      expect(zoomable.transform.targetScale).toBeGreaterThan(1);
      const settled = zoomable._targetXDomain as unknown as Date[];
      expect(+settled[0]).toBeCloseTo(+range[0], -4);
      expect(+settled[1]).toBeCloseTo(+range[1], -4);
    });
  });

  it('settles rather than trading updates between the two', async () => {
    const { group, zoomable } = await renderPair();
    group.setDomain({ x: [new Date('2024-01-06'), new Date('2024-01-16')], source: Symbol('x') });
    await vi.waitFor(() => expect(zoomable.transform.targetScale).toBeGreaterThan(1));

    const settled = { ...group.domain };
    await new Promise((r) => setTimeout(r, 300));

    // Same range, and still attributed to whoever set it — a chart republishing what it was given
    // would take ownership and could aim the others at a value it is only passing through
    expect(+(group.domain.x as Date[])[0]).toBe(+(settled.x as Date[])[0]);
    expect(+(group.domain.x as Date[])[1]).toBe(+(settled.x as Date[])[1]);
  });
});
