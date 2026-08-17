import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ChartGroupTestHarness from '../components/tests/ChartGroupTestHarness.svelte';
import LineChart from '../components/charts/LineChart/LineChart.svelte';
import ChartCanvas from '../components/Chart/Chart.canvas.svelte';
import ChartHtml from '../components/Chart/Chart.html.svelte';
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
    /** Extra `Chart` props, per member */
    propsFor?: Array<Record<string, any>>;
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
      {
        chartProps: { ...chartProps(a), ...options.propsFor?.[0] },
        groupOptions: options.memberOptions?.[0],
      },
      {
        chartProps: { ...chartProps(b), ...options.propsFor?.[1] },
        groupOptions: options.memberOptions?.[1],
      },
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
  describe('membership', () => {
    it('warns when two charts join with the same id', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await renderPair({ propsFor: [{ id: 'shared' }, { id: 'shared' }] });

      await vi.waitFor(() => {
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('id "shared"'));
      });
      warn.mockRestore();
    });

    it('stays quiet when the ids differ', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await renderPair({ propsFor: [{ id: 'a' }, { id: 'b' }] });

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('pointer sharing', () => {
    it('shows the matching data point on the other chart', async () => {
      const { chartA, chartB } = await renderPair();

      chartA.tooltip.show({ data: dataA[3] }); // 2024-01-04

      await vi.waitFor(() => {
        // chart B resolves the same *date* against its own (shorter) data
        expect(chartB.tooltip.data).toEqual(dataB[2]);
      });
    });

    it('lands in the right panel when the follower is faceted', async () => {
      // §3.6 of the research: a faceted chart is one member with one id, so the group needs no
      // facet awareness — but the follower has to place the shared row in its own panel
      const faceted = [
        { g: 'x', date: new Date('2024-01-01'), value: 100 },
        { g: 'x', date: new Date('2024-01-04'), value: 200 },
        { g: 'y', date: new Date('2024-01-01'), value: 300 },
        { g: 'y', date: new Date('2024-01-04'), value: 400 },
      ];
      const { chartA, chartB } = await renderPair({
        dataFor: [dataA, faceted],
        propsFor: [{}, { fx: 'g' }],
      });

      expect(chartB.facet.panels.length).toBe(2);

      chartA.tooltip.show({ data: dataA[3] }); // 2024-01-04

      await vi.waitFor(() => {
        // the nearest row by date, and positioned in whichever panel holds it
        const panel = chartB.facet.panels.find((p: any) => p.has(chartB.tooltip.data));
        expect(panel).toBeDefined();
        // `tooltip.x` is container-relative, so the panel's offset carries the chart's padding
        const left = panel!.x + chartB.padding.left;
        expect(chartB.tooltip.x).toBeGreaterThanOrEqual(left);
        expect(chartB.tooltip.x).toBeLessThanOrEqual(left + panel!.width);
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

describe('brush slice', () => {
  /** Two charts with (non-zooming) brushes joined to a group */
  async function renderBrushPair(options: { brush?: any; memberOptions?: any[] } = {}) {
    const group = new ChartGroupState({ brush: options.brush });
    const contexts: ChartState<any, any, any>[] = [];

    render(ChartGroupTestHarness, {
      group,
      members: [
        { chartProps: { ...chartProps(dataA), brush: true }, groupOptions: options.memberOptions?.[0] }, // prettier-ignore
        { chartProps: { ...chartProps(dataB), brush: true }, groupOptions: options.memberOptions?.[1] }, // prettier-ignore
      ],
      oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    });

    await vi.waitFor(() => {
      expect(contexts[0]?.brushState).toBeTruthy();
      expect(contexts[1]?.brushState).toBeTruthy();
    });

    return { chartA: contexts[0], chartB: contexts[1], group };
  }

  const range = [new Date('2024-01-02'), new Date('2024-01-04')];

  it('applies a published selection to the other chart', async () => {
    const { chartB, group } = await renderBrushPair();

    group.setBrush({ x: range });

    await vi.waitFor(() => {
      expect(chartB.brush.x[0]).toEqual(range[0]);
      expect(chartB.brush.x[1]).toEqual(range[1]);
      expect(chartB.brush.active).toBe(true);
    });
  });

  it('clears the other chart when the selection is cleared', async () => {
    const { chartB, group } = await renderBrushPair();

    group.setBrush({ x: range });
    await vi.waitFor(() => expect(chartB.brush.active).toBe(true));

    group.clearBrush();

    await vi.waitFor(() => {
      expect(chartB.brush.active).toBe(false);
      expect(chartB.brush.x).toEqual([null, null]);
    });
  });

  it('does not apply a chart its own selection back', async () => {
    const { chartA, group } = await renderBrushPair();

    // as though chart A had published from a gesture
    group.setBrush({ x: range, source: chartA.id });

    await new Promise((resolve) => setTimeout(resolve, 100));
    // A never had a local selection, and must not be given one by its own publish
    expect(chartA.brush.active).toBeFalsy();
    expect(group.pointer.active).toBe(false);
  });

  it('lets a chart clear a selection it did not make', async () => {
    const { chartA, chartB, group } = await renderBrushPair();

    // published by neither chart, so both apply it and both are observable followers
    group.setBrush({ x: range, source: Symbol('elsewhere') });
    await vi.waitFor(() => {
      expect(chartA.brush.active).toBe(true);
      expect(chartB.brush.active).toBe(true);
    });

    // chart B clicking to reset must clear the group rather than be ignored for not owning it
    group.clearBrush(chartB.id);

    await vi.waitFor(() => {
      expect(group.brush.active).toBe(false);
      // A follows; B already reset itself as part of the gesture, so it skips its own update
      expect(chartA.brush.active).toBe(false);
    });
  });

  /**
   * The gesture path, rather than driving the group state directly — a chart publishes what its
   * own brush reports, so a selection that only ever reaches `onBrushEnd` never reaches the group.
   */
  describe('publishing from a gesture', () => {
    /** Drag across an element, or click it when `to` matches `from` */
    function pointerRun(el: Element, from: number, to: number, y: number) {
      const types: Array<[string, number]> =
        from === to
          ? [
              ['pointerdown', from],
              ['pointerup', to],
            ]
          : [
              ['pointerdown', from],
              ['pointermove', to],
              ['pointerup', to],
            ];
      for (const [type, clientX] of types) {
        el.dispatchEvent(new PointerEvent(type, { clientX, clientY: y, bubbles: true }));
      }
    }

    async function firstBrushEl() {
      let el: HTMLElement | null = null;
      await vi.waitFor(() => {
        el = document.querySelectorAll('.lc-brush-context')[0] as HTMLElement;
        expect(el).toBeTruthy();
      });
      return el!;
    }

    it('shares a selection dragged in one chart', async () => {
      const { chartA, chartB } = await renderBrushPair();
      const el = await firstBrushEl();
      const rect = el.getBoundingClientRect();
      const y = rect.top + rect.height / 2;

      pointerRun(el, rect.left + rect.width * 0.3, rect.left + rect.width * 0.6, y);

      await vi.waitFor(() => {
        expect(chartA.brush.active).toBe(true);
        expect(chartB.brush.active).toBe(true);
      });
    });

    it('shares the clearing when that chart is clicked', async () => {
      const { chartA, chartB, group } = await renderBrushPair();
      const el = await firstBrushEl();
      const rect = el.getBoundingClientRect();
      const y = rect.top + rect.height / 2;

      pointerRun(el, rect.left + rect.width * 0.3, rect.left + rect.width * 0.6, y);
      await vi.waitFor(() => expect(chartB.brush.active).toBe(true));

      // A click never moves the pointer, so the clear is only reported because the gesture says so
      const x = rect.left + rect.width * 0.05;
      pointerRun(el, x, x, y);

      await vi.waitFor(() => {
        expect(chartA.brush.active).toBeFalsy();
        expect(group.brush.active).toBe(false);
        expect(chartB.brush.active).toBeFalsy();
      });
    });
  });

  it('respects `subscribe: false`', async () => {
    const { chartB, group } = await renderBrushPair({
      memberOptions: [undefined, { subscribe: false }],
    });

    group.setBrush({ x: range });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chartB.brush.active).toBeFalsy();
  });

  it('does not share the selection when `brush: false`', async () => {
    const { chartB, group } = await renderBrushPair({ brush: false });

    group.setBrush({ x: range });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chartB.brush.active).toBeFalsy();
  });
});

describe('domain slice', () => {
  const zoomTo = [new Date('2024-01-02'), new Date('2024-01-04')];

  async function renderDomainPair(options: { domain?: any; memberOptions?: any[] } = {}) {
    const group = new ChartGroupState({ domain: options.domain });
    const contexts: ChartState<any, any, any>[] = [];

    render(ChartGroupTestHarness, {
      group,
      members: [
        { chartProps: chartProps(dataA), groupOptions: options.memberOptions?.[0] },
        { chartProps: chartProps(dataB), groupOptions: options.memberOptions?.[1] },
      ],
      oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    });

    await vi.waitFor(() => expect(contexts[1]?.width).toBeGreaterThan(0));
    return { chartA: contexts[0], chartB: contexts[1], group };
  }

  it('zooms the other chart to a published domain', async () => {
    const { chartB, group } = await renderDomainPair();

    group.setDomain({ x: zoomTo });

    await vi.waitFor(() => {
      expect(chartB.xDomain[0]).toEqual(zoomTo[0]);
      expect(chartB.xDomain[1]).toEqual(zoomTo[1]);
    });
  });

  it('returns to the natural extent when cleared', async () => {
    const { chartB, group } = await renderDomainPair();

    group.setDomain({ x: zoomTo });
    await vi.waitFor(() => expect(chartB.xDomain[0]).toEqual(zoomTo[0]));

    group.clearDomain();

    await vi.waitFor(() => {
      // back to the full extent of dataB
      expect(chartB.xDomain[0]).toEqual(dataB[0].date);
      expect(chartB.xDomain[1]).toEqual(dataB[dataB.length - 1].date);
    });
  });

  it('does not apply a chart its own published domain', async () => {
    const { chartA, group } = await renderDomainPair();

    group.setDomain({ x: zoomTo, source: chartA.id });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chartA.xDomain[0]).toEqual(dataA[0].date); // untouched
  });

  it('lets a chart clear a domain it did not set', async () => {
    const { chartA, chartB, group } = await renderDomainPair();

    group.setDomain({ x: zoomTo, source: Symbol('elsewhere') });
    await vi.waitFor(() => {
      expect(chartA.xDomain[0]).toEqual(zoomTo[0]);
      expect(chartB.xDomain[0]).toEqual(zoomTo[0]);
    });

    group.clearDomain(chartB.id);

    await vi.waitFor(() => {
      expect(group.domain.active).toBe(false);
      expect(chartA.xDomain[0]).toEqual(dataA[0].date);
    });
  });

  it('respects `subscribe: false`', async () => {
    const { chartB, group } = await renderDomainPair({
      memberOptions: [undefined, { subscribe: false }],
    });

    group.setDomain({ x: zoomTo });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chartB.xDomain[0]).toEqual(dataB[0].date);
  });

  it('does not share when `domain: false`', async () => {
    const { chartB, group } = await renderDomainPair({ domain: false });

    group.setDomain({ x: zoomTo });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chartB.xDomain[0]).toEqual(dataB[0].date);
  });

  it('lets an explicit `xDomain` prop win over the shared domain', async () => {
    const explicit = [new Date('2024-01-01'), new Date('2024-01-03')];
    const group = new ChartGroupState();
    const contexts: ChartState<any, any, any>[] = [];

    render(ChartGroupTestHarness, {
      group,
      members: [
        { chartProps: chartProps(dataA) },
        { chartProps: { ...chartProps(dataB), xDomain: explicit } },
      ],
      oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    });
    await vi.waitFor(() => expect(contexts[1]?.width).toBeGreaterThan(0));

    group.setDomain({ x: zoomTo });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(contexts[1].xDomain[0]).toEqual(explicit[0]);
    expect(contexts[1].xDomain[1]).toEqual(explicit[1]);
  });

  it('supersedes a stale local zoom, so the most recent interaction wins', async () => {
    const { chartA, chartB, group } = await renderDomainPair();

    // chart A zoomed itself earlier (what `zoomOnBrush` does)
    chartA.brushXDomain = [new Date('2024-01-03'), new Date('2024-01-04')];
    await vi.waitFor(() => expect(chartA.xDomain[0]).toEqual(new Date('2024-01-03')));

    // ...then another chart publishes a domain — A must follow it rather than stay pinned
    group.setDomain({ x: zoomTo, source: chartB.id });

    await vi.waitFor(() => {
      expect(chartA.brushXDomain).toBeUndefined();
      expect(chartA.xDomain[0]).toEqual(zoomTo[0]);
    });
  });
});

describe('series slice', () => {
  const seriesData = [
    { date: new Date('2024-01-01'), apples: 10, bananas: 5, grapes: 1 },
    { date: new Date('2024-01-02'), apples: 30, bananas: 15, grapes: 3 },
  ];

  const seriesChartProps = (keys: string[]) => ({
    data: seriesData,
    x: 'date',
    series: keys.map((key) => ({ key, value: key })),
  });

  /** Two charts with explicit series joined to a group */
  async function renderSeriesPair(
    options: { series?: any; memberOptions?: any[]; keysFor?: string[][] } = {}
  ) {
    const [a, b] = options.keysFor ?? [
      ['apples', 'bananas'],
      ['apples', 'bananas'],
    ];
    const group = new ChartGroupState({ series: options.series });
    const contexts: ChartState<any, any, any>[] = [];

    render(ChartGroupTestHarness, {
      group,
      members: [
        { chartProps: seriesChartProps(a), groupOptions: options.memberOptions?.[0] },
        { chartProps: seriesChartProps(b), groupOptions: options.memberOptions?.[1] },
      ],
      oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    });

    await vi.waitFor(() => {
      expect(contexts[0]?.series.series).toHaveLength(a.length);
      expect(contexts[1]?.series.series).toHaveLength(b.length);
    });

    return { chartA: contexts[0], chartB: contexts[1], group };
  }

  describe('highlight', () => {
    it('highlights the same series on the other chart', async () => {
      const { chartA, chartB, group } = await renderSeriesPair();

      chartA.series.highlightKey = 'bananas';

      await vi.waitFor(() => expect(chartB.series.highlightKey).toBe('bananas'));
      expect(chartB.series.isHighlighted('bananas')).toBe(true);
      expect(chartB.series.isHighlighted('apples')).toBe(false);
      expect(group.series.highlightSource).toBe(chartA.id);
    });

    it('clears the other chart when the highlight is released', async () => {
      const { chartA, chartB } = await renderSeriesPair();

      chartA.series.highlightKey = 'bananas';
      await vi.waitFor(() => expect(chartB.series.highlightKey).toBe('bananas'));

      chartA.series.highlightKey = null;

      await vi.waitFor(() => expect(chartB.series.highlightKey).toBe(null));
    });

    it('does not echo an applied highlight back out', async () => {
      const { chartA, chartB, group } = await renderSeriesPair();

      chartA.series.highlightKey = 'apples';
      await vi.waitFor(() => expect(chartB.series.highlightKey).toBe('apples'));

      // Settle any further effect passes — the publisher must still own the highlight, rather
      // than the follower having re-published it as its own
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(group.series.highlightSource).toBe(chartA.id);
      expect(chartB.series.highlightSource).toBe(chartA.id);
      expect(chartA.series.highlightSource).toBe(null); // its own interaction
    });

    it('ignores a stale clear from the chart the pointer left', async () => {
      // Moving between two charts' legends: the entered chart may publish before the left one
      // clears, and that clear must not wipe the highlight that just replaced it
      const { chartA, chartB, group } = await renderSeriesPair();

      chartA.series.highlightKey = 'apples';
      await vi.waitFor(() => expect(group.series.highlightSource).toBe(chartA.id));

      chartB.series.highlightKey = 'bananas'; // entered B
      chartA.series.highlightKey = null; // left A

      await vi.waitFor(() => expect(group.series.highlightSource).toBe(chartB.id));
      expect(group.series.highlightKey).toBe('bananas');
      await vi.waitFor(() => expect(chartA.series.highlightKey).toBe('bananas'));
    });

    it('takes ownership when the same series is entered on another chart', async () => {
      // Same key on both, so nothing about the highlight *value* changes — only its owner, which
      // is what decides whose release clears it
      const { chartA, chartB, group } = await renderSeriesPair();

      chartA.series.highlightKey = 'apples';
      await vi.waitFor(() => expect(chartB.series.highlightKey).toBe('apples'));

      chartB.series.highlightKey = 'apples'; // entered B's legend on the same series
      chartA.series.highlightKey = null; // left A

      await vi.waitFor(() => expect(group.series.highlightSource).toBe(chartB.id));
      expect(group.series.highlightKey).toBe('apples');
      // and B releasing it does clear the group
      chartB.series.highlightKey = null;
      await vi.waitFor(() => expect(group.series.highlightKey).toBe(null));
    });

    it('drives every chart when set on the group directly', async () => {
      const { chartA, chartB, group } = await renderSeriesPair();

      group.setHighlight('bananas');

      await vi.waitFor(() => {
        expect(chartA.series.highlightKey).toBe('bananas');
        expect(chartB.series.highlightKey).toBe('bananas');
      });
      // attributed to the group, so neither chart mistakes it for its own and re-publishes
      expect(chartA.series.highlightSource).toBe(group.id);
    });

    it('does not share the highlight when `series: false`', async () => {
      const { chartA, chartB } = await renderSeriesPair({ series: false });

      chartA.series.highlightKey = 'bananas';

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chartB.series.highlightKey).toBe(null);
    });

    it('does not share the highlight when `series: { highlight: false }`', async () => {
      const { chartA, chartB } = await renderSeriesPair({ series: { highlight: false } });

      chartA.series.highlightKey = 'bananas';

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chartB.series.highlightKey).toBe(null);
    });
  });

  describe('visibility', () => {
    it('hides the same series on the other chart', async () => {
      const { chartA, chartB, group } = await renderSeriesPair();

      chartA.series.selectedKeys.current = ['apples']; // hides bananas

      await vi.waitFor(() => expect(chartB.series.isVisible('bananas')).toBe(false));
      expect(chartB.series.isVisible('apples')).toBe(true);
      expect(group.series.hiddenKeys).toEqual(['bananas']);
      expect(group.series.visibilitySource).toBe(chartA.id);
    });

    it('shows it again when unhidden', async () => {
      const { chartA, chartB, group } = await renderSeriesPair();

      chartA.series.selectedKeys.current = ['apples'];
      await vi.waitFor(() => expect(chartB.series.isVisible('bananas')).toBe(false));

      chartA.series.selectedKeys.current = [];

      await vi.waitFor(() => expect(chartB.series.isVisible('bananas')).toBe(true));
      expect(group.series.hiddenKeys).toEqual([]);
    });

    it('leaves a chart alone when it does not have the hidden series', async () => {
      const { chartA, chartB, group } = await renderSeriesPair({
        keysFor: [
          ['apples', 'bananas'],
          ['apples', 'grapes'],
        ],
      });

      chartA.series.selectedKeys.current = ['apples']; // hides bananas, which B lacks

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chartB.series.isVisible('apples')).toBe(true);
      expect(chartB.series.isVisible('grapes')).toBe(true);
      // and B reporting nothing hidden must not unhide bananas for A
      expect(group.series.hiddenKeys).toEqual(['bananas']);
      expect(chartA.series.isVisible('bananas')).toBe(false);
    });

    it('keeps each chart owning only its own series', async () => {
      const { chartA, chartB, group } = await renderSeriesPair({
        keysFor: [
          ['apples', 'bananas'],
          ['apples', 'grapes'],
        ],
      });

      chartA.series.selectedKeys.current = ['apples']; // A hides bananas
      await vi.waitFor(() => expect(group.series.hiddenKeys).toEqual(['bananas']));

      chartB.series.selectedKeys.current = ['apples']; // B hides grapes

      await vi.waitFor(() => expect(group.series.hiddenKeys).toContain('grapes'));
      expect(group.series.hiddenKeys).toContain('bananas');
      expect(chartA.series.isVisible('bananas')).toBe(false);
      expect(chartB.series.isVisible('grapes')).toBe(false);
    });

    it('hides across the group when set on the group directly', async () => {
      const { chartA, chartB, group } = await renderSeriesPair();

      group.setHidden(['apples']);

      await vi.waitFor(() => {
        expect(chartA.series.isVisible('apples')).toBe(false);
        expect(chartB.series.isVisible('apples')).toBe(false);
      });
      expect(chartA.series.visibleSeries.map((s) => s.key)).toEqual(['bananas']);
    });

    it('shows everything again when cleared', async () => {
      const { chartA, chartB, group } = await renderSeriesPair();

      group.setHidden(['apples']);
      await vi.waitFor(() => expect(chartB.series.isVisible('apples')).toBe(false));

      group.clearHidden();

      await vi.waitFor(() => {
        expect(chartA.series.isVisible('apples')).toBe(true);
        expect(chartB.series.isVisible('apples')).toBe(true);
      });
      expect(group.series.hiddenKeys).toEqual([]);
    });

    it('does not share visibility when `series: { visibility: false }`', async () => {
      const { chartA, chartB } = await renderSeriesPair({ series: { visibility: false } });

      chartA.series.selectedKeys.current = ['apples'];

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chartB.series.isVisible('bananas')).toBe(true);
    });
  });

  describe('publish / subscribe filters', () => {
    it('a listen-only chart does not publish', async () => {
      const { chartA, chartB, group } = await renderSeriesPair({
        memberOptions: [{ publish: false }, undefined],
      });

      chartA.series.highlightKey = 'bananas';
      chartA.series.selectedKeys.current = ['apples'];

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(group.series.highlightKey).toBe(null);
      expect(group.series.hiddenKeys).toEqual([]);
      expect(chartB.series.highlightKey).toBe(null);
    });

    it('a broadcast-only chart does not subscribe', async () => {
      const { chartB, group } = await renderSeriesPair({
        memberOptions: [undefined, { subscribe: false }],
      });

      group.setHighlight('bananas');
      group.setHidden(['apples']);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chartB.series.highlightKey).toBe(null);
      expect(chartB.series.isVisible('apples')).toBe(true);
    });

    it('shares series without the pointer when named in `publish`', async () => {
      const { chartA, chartB, group } = await renderSeriesPair({
        memberOptions: [{ publish: ['series'] }, undefined],
      });

      chartA.tooltip.show({ data: seriesData[0] });
      chartA.series.highlightKey = 'bananas';

      await vi.waitFor(() => expect(chartB.series.highlightKey).toBe('bananas'));
      expect(group.pointer.active).toBe(false);
    });
  });
});

describe('<ChartGroup> options', () => {
  it('forwards every slice option, not just `pointer`', async () => {
    let group: ChartGroupState = null!;

    render(ChartGroupTestHarness, {
      useContext: true,
      pointer: { axis: 'both' },
      brush: { axis: 'both' },
      domain: { axis: 'both' },
      series: { highlight: false },
      members: [{ chartProps: chartProps(dataA) }],
      ongroup: (g: any) => (group = g),
    });

    await vi.waitFor(() => expect(group).toBeTruthy());

    expect(group.pointerOptions?.axis).toBe('both');
    expect(group.brushOptions?.axis).toBe('both');
    expect(group.domainOptions?.axis).toBe('both');
    expect(group.seriesOptions).toEqual({ highlight: false, visibility: true });
  });
});

describe('layers', () => {
  // the group works off chart state and accessors, so it should not be svg-specific
  for (const [name, component] of [
    ['canvas', ChartCanvas],
    ['html', ChartHtml],
  ] as const) {
    it(`syncs the pointer on ${name} charts`, async () => {
      const group = new ChartGroupState();
      const contexts: ChartState<any, any, any>[] = [];

      render(ChartGroupTestHarness, {
        group,
        component,
        members: [{ chartProps: chartProps(dataA) }, { chartProps: chartProps(dataB) }],
        oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
      });
      await vi.waitFor(() => expect(contexts[1]?.width).toBeGreaterThan(0));

      contexts[0].tooltip.show({ data: dataA[3] });
      await vi.waitFor(() => expect(contexts[1].tooltip.data).toEqual(dataB[2]));
    });
  }
});

describe('lifecycle', () => {
  it('releases what a chart owns when it unmounts', async () => {
    // A chart removed while hovering — route change, tab switch, conditional block — must not
    // leave the group holding its pointer.  It would also wedge it: only the owner may clear.
    const group = new ChartGroupState();
    const contexts: ChartState<any, any, any>[] = [];

    const { unmount } = render(ChartGroupTestHarness, {
      group,
      members: [{ chartProps: chartProps(dataA) }, { chartProps: chartProps(dataB) }],
      oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    });
    await vi.waitFor(() => expect(contexts[1]?.width).toBeGreaterThan(0));

    contexts[0].tooltip.show({ data: dataA[1] });
    group.setBrush({ x: [dataA[0].date, dataA[2].date], source: contexts[0].id });
    group.setDomain({ x: [dataA[0].date, dataA[2].date], source: contexts[0].id });
    group.setHighlight('value', contexts[0].id);
    await vi.waitFor(() => expect(group.pointer.active).toBe(true));

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(group.pointer.active).toBe(false);
    expect(group.brush.active).toBe(false);
    expect(group.domain.active).toBe(false);
    expect(group.series.highlightKey).toBe(null);
  });

  it('keeps hidden series hidden when the chart that hid them unmounts', async () => {
    // Hidden keys describe series rather than the chart that hid them — other members may still
    // be showing the same ones hidden, and unhiding those would be the surprise
    const group = new ChartGroupState();
    const contexts: ChartState<any, any, any>[] = [];

    const { unmount } = render(ChartGroupTestHarness, {
      group,
      members: [{ chartProps: chartProps(dataA) }],
      oncontext: (ctx: any, i: number) => (contexts[i] = ctx),
    });
    await vi.waitFor(() => expect(contexts[0]?.width).toBeGreaterThan(0));

    group.setHidden(['bananas'], contexts[0].id);

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(group.series.hiddenKeys).toEqual(['bananas']);
  });
});
