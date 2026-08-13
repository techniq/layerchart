import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ChartGroupTestHarness from '../components/tests/ChartGroupTestHarness.svelte';
import LineChart from '../components/charts/LineChart/LineChart.svelte';
import { ChartGroupState } from './group.svelte.js';
import type { ChartState } from './chart.svelte.js';

/** Daily data — the "detail" chart */
const dataA = [
  { date: new Date('2024-01-01'), value: 10 },
  { date: new Date('2024-01-02'), value: 30 },
  { date: new Date('2024-01-03'), value: 20 },
  { date: new Date('2024-01-04'), value: 50 },
];

/** Same dates, different values and a different length — the "overview" chart */
const dataB = [
  { date: new Date('2024-01-01'), value: 100 },
  { date: new Date('2024-01-03'), value: 300 },
  { date: new Date('2024-01-04'), value: 200 },
];

const chartProps = (data: any[]) => ({
  data,
  x: 'date',
  y: 'value',
  tooltipContext: { mode: 'bisect-x' as const },
});

/** Render two charts joined to a group, resolving once both contexts are ready */
async function renderPair(
  options: {
    pointer?: any;
    useContext?: boolean;
    memberOptions?: Array<any>;
    dataFor?: Array<any[]>;
  } = {}
) {
  const [a, b] = options.dataFor ?? [dataA, dataB];
  const group = options.useContext ? undefined : new ChartGroupState({ pointer: options.pointer });
  const contexts: ChartState<any, any, any>[] = [];
  let contextGroup: ChartGroupState = null!;

  render(ChartGroupTestHarness, {
    group,
    useContext: options.useContext,
    pointer: options.pointer,
    members: [
      { chartProps: chartProps(a), groupOptions: options.memberOptions?.[0] },
      { chartProps: chartProps(b), groupOptions: options.memberOptions?.[1] },
    ],
    oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    ongroup: (g: any) => (contextGroup = g),
  });

  await vi.waitFor(() => {
    expect(contexts[0]?.width).toBeGreaterThan(0);
    expect(contexts[1]?.width).toBeGreaterThan(0);
  });

  return { chartA: contexts[0], chartB: contexts[1], group: group ?? contextGroup };
}

describe('ChartGroupState', () => {
  describe('pointer sharing', () => {
    it('shows the matching data point on the other chart', async () => {
      const { chartA, chartB } = await renderPair();

      chartA.tooltip.show({ data: dataA[3] }); // 2024-01-04

      await vi.waitFor(() => {
        // chart B resolves the same *date* against its own (shorter) data
        expect(chartB.tooltip.data).toEqual(dataB[2]);
      });
    });

    it('resolves the nearest point when the other chart lacks that value', async () => {
      const { chartA, chartB } = await renderPair();

      chartA.tooltip.show({ data: dataA[1] }); // 2024-01-02, absent from dataB

      await vi.waitFor(() => {
        expect(chartB.tooltip.data).toEqual(dataB[0]); // nearest is 2024-01-01
      });
    });

    it('marks the follower tooltip with the publishing chart as its source', async () => {
      const { chartA, chartB } = await renderPair();

      chartA.tooltip.show({ data: dataA[0] });

      await vi.waitFor(() => {
        expect(chartB.tooltip.source).toBe(chartA.id);
      });
      expect(chartA.tooltip.source).toBe(chartA.id); // its own pointer drove it
    });

    it('does not echo back and overwrite the publisher', async () => {
      const { chartA, chartB, group } = await renderPair();

      chartA.tooltip.show({ data: dataA[1] }); // only exists in dataA

      await vi.waitFor(() => {
        expect(chartB.tooltip.data).toEqual(dataB[0]);
      });

      // Settle any further effect passes, then confirm the publisher still holds its own point
      // and still owns the group pointer
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(chartA.tooltip.data).toEqual(dataA[1]);
      expect(group.pointer.source).toBe(chartA.id);
      expect(group.pointer.data).toEqual(dataA[1]);
    });

    it('clears the other chart when the pointer leaves', async () => {
      const { chartA, chartB } = await renderPair();

      chartA.tooltip.show({ data: dataA[0] });
      await vi.waitFor(() => expect(chartB.tooltip.data).not.toBeNull());

      chartA.tooltip.hide();

      await vi.waitFor(() => {
        expect(chartA.tooltip.data).toBeNull();
        expect(chartB.tooltip.data).toBeNull();
      });
    });

    it('lets either chart drive after the first releases', async () => {
      const { chartA, chartB, group } = await renderPair();

      chartA.tooltip.show({ data: dataA[0] });
      await vi.waitFor(() => expect(chartB.tooltip.data).toEqual(dataB[0]));

      chartA.tooltip.hide();
      await vi.waitFor(() => expect(chartB.tooltip.data).toBeNull());

      // now B drives A
      chartB.tooltip.show({ data: dataB[1] }); // 2024-01-03
      await vi.waitFor(() => {
        expect(group.pointer.source).toBe(chartB.id);
        expect(chartA.tooltip.data).toEqual(dataA[2]);
      });
    });
  });

  describe('simplified charts', () => {
    it('forward `group` through to the underlying Chart', async () => {
      // `LineChart` spreads rest props onto `Chart`, and defaults to `quadtree-x` — a mode with
      // no value-based equivalent, so this also covers the bisect fallback end to end
      const group = new ChartGroupState();
      const contexts: ChartState<any, any, any>[] = [];

      render(ChartGroupTestHarness, {
        group,
        component: LineChart,
        members: [
          { chartProps: { data: dataA, x: 'date', y: 'value' } },
          { chartProps: { data: dataB, x: 'date', y: 'value' } },
        ],
        oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
      });

      await vi.waitFor(() => expect(contexts[1]?.width).toBeGreaterThan(0));

      contexts[0].tooltip.show({ data: dataA[3] }); // 2024-01-04

      await vi.waitFor(() => {
        expect(contexts[1].tooltip.data).toEqual(dataB[2]);
      });
    });
  });

  describe('match', () => {
    it('`index` uses position rather than value', async () => {
      const { chartA, chartB } = await renderPair({ pointer: { match: 'index' } });

      chartA.tooltip.show({ data: dataA[2] }); // index 2

      await vi.waitFor(() => {
        expect(chartB.tooltip.data).toEqual(dataB[2]); // index 2, a different date
      });
    });

    it('`percent` uses relative position within the plot area', async () => {
      // domains are deliberately unrelated — only the relative position carries over
      const early = [
        { date: new Date('2024-01-01'), value: 1 },
        { date: new Date('2024-01-02'), value: 2 },
        { date: new Date('2024-01-03'), value: 3 },
      ];
      const late = [
        { date: new Date('2030-06-01'), value: 1 },
        { date: new Date('2030-06-02'), value: 2 },
        { date: new Date('2030-06-03'), value: 3 },
      ];
      const { chartA, chartB } = await renderPair({
        pointer: { match: 'percent' },
        dataFor: [early, late],
      });

      chartA.tooltip.show({ data: early[2] }); // 100% along its domain

      await vi.waitFor(() => {
        expect(chartB.tooltip.data).toEqual(late[2]); // 100% along a totally different domain
      });
    });

    it('`value` finds nothing useful across unrelated domains', async () => {
      // the contrast with `percent` above — nearest-by-value clamps to an edge
      const early = [
        { date: new Date('2024-01-01'), value: 1 },
        { date: new Date('2024-01-03'), value: 3 },
      ];
      const late = [
        { date: new Date('2030-06-01'), value: 1 },
        { date: new Date('2030-06-03'), value: 3 },
      ];
      const { chartA, chartB } = await renderPair({ dataFor: [early, late] });

      chartA.tooltip.show({ data: early[1] });

      await vi.waitFor(() => {
        expect(chartB.tooltip.data).toEqual(late[0]); // clamped to the first point
      });
    });

    it('accepts a custom resolver', async () => {
      const { chartA, chartB } = await renderPair({
        pointer: { match: () => dataB[1] },
      });

      chartA.tooltip.show({ data: dataA[0] });

      await vi.waitFor(() => {
        expect(chartB.tooltip.data).toEqual(dataB[1]);
      });
    });
  });

  describe('pointer: { tooltip: false }', () => {
    it('suppresses tooltip content on followers but not the publisher', async () => {
      const { chartA, chartB } = await renderPair({ pointer: { tooltip: false } });

      chartA.tooltip.show({ data: dataA[0] });

      await vi.waitFor(() => {
        // data is still set so `Highlight` still renders
        expect(chartB.tooltip.data).toEqual(dataB[0]);
      });
      expect(chartB.tooltip.suppressed).toBe(true);
      expect(chartA.tooltip.suppressed).toBe(false);
    });
  });

  describe('publish / subscribe filters', () => {
    it('a listen-only chart does not publish', async () => {
      const { chartA, chartB, group } = await renderPair({
        memberOptions: [{ publish: false }, undefined],
      });

      chartA.tooltip.show({ data: dataA[0] });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(group.pointer.active).toBe(false);
      expect(chartB.tooltip.data).toBeNull();
    });

    it('a broadcast-only chart does not subscribe', async () => {
      const { chartA, chartB } = await renderPair({
        memberOptions: [undefined, { subscribe: false }],
      });

      chartA.tooltip.show({ data: dataA[0] });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(chartB.tooltip.data).toBeNull();
    });
  });

  describe('pointer: false', () => {
    it('does not share the pointer', async () => {
      const { chartA, chartB } = await renderPair({ pointer: false });

      chartA.tooltip.show({ data: dataA[0] });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(chartB.tooltip.data).toBeNull();
    });
  });

  describe('<ChartGroup> context', () => {
    it('joins charts without an explicit `group` prop', async () => {
      const { chartA, chartB } = await renderPair({ useContext: true });

      chartA.tooltip.show({ data: dataA[3] });

      await vi.waitFor(() => {
        expect(chartB.tooltip.data).toEqual(dataB[2]);
      });
    });
  });

  describe('standalone usage', () => {
    it('exposes the pointer as plain reactive state for non-chart consumers', async () => {
      const { chartA, group } = await renderPair();

      chartA.tooltip.show({ data: dataA[1] });

      await vi.waitFor(() => {
        expect(group.pointer.active).toBe(true);
        expect(group.pointer.x).toEqual(dataA[1].date);
        expect(group.pointer.y).toBe(30);
        expect(group.pointer.index).toBe(1);
      });
    });

    it('drives charts when written to directly', async () => {
      const { chartA, chartB, group } = await renderPair();

      // no chart involved — as a table row or scrubber would do
      group.setPointer({ x: new Date('2024-01-03') });

      await vi.waitFor(() => {
        expect(chartA.tooltip.data).toEqual(dataA[2]);
        expect(chartB.tooltip.data).toEqual(dataB[1]);
      });
    });

    it('tracks successive external positions that carry no data point', async () => {
      const { chartA, group } = await renderPair();

      group.setPointer({ x: new Date('2024-01-01') });
      await vi.waitFor(() => expect(chartA.tooltip.data).toEqual(dataA[0]));

      // `data` is null for both updates, so identity alone would treat this as unchanged
      group.setPointer({ x: new Date('2024-01-04') });
      await vi.waitFor(() => expect(chartA.tooltip.data).toEqual(dataA[3]));
    });
  });
});

describe('regression', () => {
  it('survives the pointer moving between charts without a hide in between', async () => {
    // A real pointer entering chart B fires before chart A's (async) hide completes, so both
    // charts briefly hold data.  Driving `show` on each in turn reproduces that overlap.
    const { chartA, chartB, group } = await renderPair();

    chartA.tooltip.show({ data: dataA[1] });
    await vi.waitFor(() => expect(chartB.tooltip.data).not.toBeNull());

    chartA.tooltip.hide(); // pointer leaves A — clears on a later tick
    chartB.tooltip.show({ data: dataB[2] }); // ...but B is entered immediately

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(group.pointer.source).toBe(chartB.id);
    expect(chartB.tooltip.data).toEqual(dataB[2]);
    expect(chartA.tooltip.data).toEqual(dataA[3]); // A follows B's date (2024-01-04)
  });
});
