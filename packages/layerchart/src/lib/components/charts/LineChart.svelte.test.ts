import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';

import LineChart from './LineChart/LineChart.svelte';
import LineChartCustomMarks from './__fixtures__/LineChartCustomMarks.svelte';
import ScatterChart from './ScatterChart/ScatterChart.svelte';

const data = [
  { date: 0, value: 10 },
  { date: 1, value: 30 },
  { date: 2, value: 20 },
  { date: 3, value: 50 },
  { date: 4, value: 40 },
];

describe('LineChart', () => {
  it('tooltip should prefer cScale color over default series color when cScale is explicitly provided', async () => {
    const { container } = render(LineChartCustomMarks, {
      data,
      x: 'date',
      y: 'value',
      c: 'value',
      cScale: scaleSequential(interpolateTurbo),
      height: 300,
      width: 400,
    });

    // Hover over the bisect overlay to trigger tooltip
    const tooltipRect = container.querySelector('.lc-tooltip-context') as SVGElement | null;
    await expect.element(tooltipRect).toBeInTheDocument();

    const rect = tooltipRect!.getBoundingClientRect();
    const eventInit = {
      bubbles: true,
      clientX: rect.x + rect.width / 2,
      clientY: rect.y + rect.height / 2,
    };

    // Retry the dispatch inside vi.waitFor — DefaultTooltip is lazy-loaded
    // by ChartChildren so the first pointer event may fire before its chunk
    // resolves.
    await vi.waitFor(() => {
      tooltipRect!.dispatchEvent(new PointerEvent('pointerenter', eventInit));
      tooltipRect!.dispatchEvent(new PointerEvent('pointermove', eventInit));

      const colorDot = document.querySelector('.lc-tooltip-item-color') as HTMLElement | null;
      expect(colorDot).not.toBeNull();

      const color = colorDot!.style.getPropertyValue('--color');
      // Should NOT be the default series color
      expect(color).not.toBe('var(--color-primary, currentColor)');
      // Should be a color from the Turbo scale (an rgb value)
      expect(color).toMatch(/^rgb/);
    });
  });
});

describe('legend `c` category toggle', () => {
  // `c` names the legend's items when no `series` do, and a single implicit series draws every
  // line — so the fade has to tell the lines apart by their `c` value
  const longData = [
    { date: 0, fruit: 'apples', value: 10 },
    { date: 1, fruit: 'apples', value: 30 },
    { date: 0, fruit: 'bananas', value: 20 },
    { date: 1, fruit: 'bananas', value: 50 },
  ];

  const longDataProps = {
    data: longData,
    x: 'date',
    y: 'value',
    // `c` alone splits and colors the lines — no `z`, no `stroke`, no `series`
    c: 'fruit',
    cRange: ['red', 'yellow'],
    legend: true,
    width: 400,
    height: 300,
  };

  async function legendButtons(container: HTMLElement) {
    // `Legend` is lazy-loaded inside `ChartChildren`
    let buttons: NodeListOf<Element> = container.querySelectorAll('.lc-legend-swatch-button');
    await vi.waitFor(() => {
      buttons = container.querySelectorAll('.lc-legend-swatch-button');
      expect(buttons.length).toBe(2);
    });
    return buttons;
  }

  const splines = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.lc-path')).map((el) => ({
      stroke: el.getAttribute('stroke'),
      opacity: (el as SVGElement).style.opacity || el.getAttribute('opacity') || '1',
    }));

  it('should fade the other lines while a legend item is hovered', async () => {
    const { container } = render(LineChart, longDataProps as any);

    const buttons = await legendButtons(container);
    await vi.waitFor(() => expect(splines(container).length).toBe(2));

    buttons[0].dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));

    // One series draws both lines, so a mark-wide fade would dim them together
    await vi.waitFor(() => {
      expect(splines(container)).toEqual([
        { stroke: 'red', opacity: '1' },
        { stroke: 'yellow', opacity: '0.1' },
      ]);
    });
  });

  it('should drop a line when its legend item is clicked', async () => {
    const { container } = render(LineChart, longDataProps as any);

    const buttons = await legendButtons(container);
    await vi.waitFor(() => expect(splines(container).length).toBe(2));

    (buttons[0] as HTMLElement).click();

    await vi.waitFor(() => {
      expect(splines(container)).toEqual([{ stroke: 'red', opacity: '1' }]);
    });
  });
});

describe('LineChart seriesLayout', () => {
  const svelteRows = [
    { date: 0, cumsum: 100 },
    { date: 1, cumsum: 586 },
  ];
  const kitRows = [
    { date: 0, cumsum: 40 },
    { date: 1, cumsum: 212 },
  ];
  const seriesProps = {
    x: 'date',
    y: 'cumsum',
    series: [
      { key: 'svelte', data: svelteRows },
      { key: 'sveltekit', data: kitRows },
    ],
    height: 300,
    width: 400,
  };

  it('overlaps several series rather than inferring a stack', async () => {
    // Lines sit on a shared baseline rather than on each other.  Left to infer, several series
    // resolve to a stack that no line draws — and the value axis is then scaled to a total
    // nothing on the chart shows, squashing every line.
    let ctx: any;
    render(LineChartCustomMarks, { ...seriesProps, oncontext: (c: any) => (ctx = c) } as any);

    await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
    expect(ctx.isStacked).toBe(false);
    // 586 + 212 = 798, so a stacked domain would push the axis past 600
    expect(ctx.yScale.domain()[1]).toBeLessThanOrEqual(600);
  });

  it('overlaps for `ScatterChart` too — points share a baseline the same way', async () => {
    let ctx: any;
    render(LineChartCustomMarks, {
      ...seriesProps,
      component: ScatterChart,
      oncontext: (c: any) => (ctx = c),
    } as any);

    await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
    expect(ctx.isStacked).toBe(false);
  });

  it('still stacks when asked to', async () => {
    let ctx: any;
    render(LineChartCustomMarks, {
      ...seriesProps,
      seriesLayout: 'stack',
      oncontext: (c: any) => (ctx = c),
    } as any);

    await vi.waitFor(() => expect(ctx?.width).toBeGreaterThan(0));
    // Only that the prop is honoured — whether lines *draw* the stack is the marks' own guard
    expect(ctx.seriesLayout).toBe('stack');
  });
});
