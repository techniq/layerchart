import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import LineChart from '../charts/LineChart/LineChart.svelte';
import BarChart from '../charts/BarChart/BarChart.svelte';
import AreaChart from '../charts/AreaChart/AreaChart.svelte';
import ScatterChart from '../charts/ScatterChart/ScatterChart.svelte';
import PieChart from '../charts/PieChart/PieChart.svelte';
import Chart from '../Chart/Chart.svelte';

const data = [
  { date: 0, value: 10 },
  { date: 1, value: 30 },
  { date: 2, value: 20 },
  { date: 3, value: 50 },
  { date: 4, value: 40 },
];

const wideData = [
  { date: 0, apples: 10, bananas: 40 },
  { date: 1, apples: 30, bananas: 20 },
  { date: 2, apples: 20, bananas: 50 },
];

const barData = [
  { name: 'A', value: 10 },
  { name: 'B', value: 20 },
  { name: 'C', value: 15 },
];

const baseProps = {
  height: 300,
  width: 400,
  // Test files share one browser, and so one real cursor — a chart mounting under it would get a
  // real `pointerenter` that takes the tooltip from the keyboard.  Focus is unaffected.
  pointerEvents: false,
};

/**
 * Tooltip roots portal to `document.body`, and their fade transition can outlive a test, so clear
 * any leftovers and read the most recent one.
 */
beforeEach(() => {
  document.body.querySelectorAll('.lc-tooltip-root').forEach((el) => el.remove());
});

function getTooltipRoot() {
  const roots = document.querySelectorAll<HTMLElement>('.lc-tooltip-root');
  return roots.length ? roots[roots.length - 1] : null;
}

function getPlotArea(container: Element) {
  return container.querySelector<HTMLElement>('.lc-tooltip-context')!;
}

function getAnnouncement(container: Element) {
  return container.querySelector('[aria-live]')?.textContent?.trim() ?? '';
}

function press(el: Element, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('TooltipContext keyboard', () => {
  it.each([
    ['LineChart', LineChart, { data, x: 'date', y: 'value' }],
    ['AreaChart', AreaChart, { data, x: 'date', y: 'value' }],
    ['BarChart', BarChart, { data: barData, x: 'name', y: 'value' }],
    ['ScatterChart', ScatterChart, { data, x: 'date', y: 'value' }],
  ] as const)('is on by default for %s', async (_, component, props) => {
    const { container } = render(component as any, { props: { ...baseProps, ...props } });

    await expect.element(getPlotArea(container)).toBeInTheDocument();
    expect(getPlotArea(container).getAttribute('tabindex')).toBe('0');
  });

  it('turns off with `keyboard={false}`', async () => {
    const { container } = render(LineChart, {
      props: { ...baseProps, keyboard: false, data, x: 'date', y: 'value' },
    });

    await expect.element(getPlotArea(container)).toBeInTheDocument();
    expect(getPlotArea(container).hasAttribute('tabindex')).toBe(false);
    expect(getPlotArea(container).hasAttribute('role')).toBe(false);
    expect(container.querySelector('[aria-live]')).toBeNull();
  });

  it('is off by default for `Chart`, which is not always cartesian', async () => {
    const chartProps = {
      ...baseProps,
      data,
      x: 'date',
      y: 'value',
      tooltipContext: { mode: 'bisect-x' as const },
    };

    const off = render(Chart, { props: chartProps });
    await expect.element(getPlotArea(off.container)).toBeInTheDocument();
    expect(getPlotArea(off.container).hasAttribute('tabindex')).toBe(false);

    const on = render(Chart, { props: { ...chartProps, keyboard: true } });
    await expect.element(getPlotArea(on.container)).toBeInTheDocument();
    expect(getPlotArea(on.container).getAttribute('tabindex')).toBe('0');
  });

  it('makes the plot area a single labelled tab stop', async () => {
    const { container } = render(LineChart, {
      props: { ...baseProps, data, x: 'date', y: 'value', 'aria-label': 'Daily values' },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();
    expect(plot.getAttribute('tabindex')).toBe('0');
    expect(plot.getAttribute('role')).toBe('application');
    expect(plot.getAttribute('aria-label')).toBe('Daily values');
    // Named once, on the tab stop, rather than also on the role-less root `div`
    expect(container.querySelector('.lc-root-container')!.hasAttribute('aria-label')).toBe(false);

    const help = document.getElementById(plot.getAttribute('aria-describedby')!);
    expect(help?.textContent).toContain('left and right arrow keys');
    // One series, so nothing to say about moving between them
    expect(help?.textContent).not.toContain('between series');

    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('steps between points with the arrow keys, Home, and End', async () => {
    const { container } = render(LineChart, {
      props: { ...baseProps, data, x: 'date', y: 'value' },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getTooltipRoot()?.textContent).toContain('10'));
    expect(getAnnouncement(container)).toBe('0, 10. 1 of 5');

    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('1, 30. 2 of 5'));
    await vi.waitFor(() => expect(getTooltipRoot()?.textContent).toContain('30'));

    press(plot, 'End');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('4, 40. 5 of 5'));

    // Stops at the end rather than wrapping
    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('4, 40. 5 of 5'));

    press(plot, 'Home');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('0, 10. 1 of 5'));
  });

  it('moves between series with up and down', async () => {
    const { container } = render(LineChart, {
      props: {
        ...baseProps,
        data: wideData,
        x: 'date',
        series: [
          { key: 'apples', color: 'red' },
          { key: 'bananas', color: 'yellow' },
        ],
      },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    const help = document.getElementById(plot.getAttribute('aria-describedby')!);
    expect(help?.textContent).toContain('up and down arrow keys to move between series');

    // Positions first, reading every series there
    press(plot, 'ArrowRight');
    await vi.waitFor(() =>
      expect(getAnnouncement(container)).toBe('0, apples 10, bananas 40. 1 of 3')
    );

    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('apples, 0, 10. 1 of 3'));

    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('apples, 1, 30. 2 of 3'));

    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('bananas, 1, 20. 2 of 3'));
  });

  it('shows the tooltip at the focused series, not the middle of the row', async () => {
    let context: any;
    const { container } = render(LineChart, {
      props: {
        ...baseProps,
        data: wideData,
        x: 'date',
        series: [{ key: 'apples' }, { key: 'bananas' }],
        get context() {
          return context;
        },
        set context(value) {
          context = value;
        },
      },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();
    await vi.waitFor(() => expect(context).toBeDefined());

    const top = (value: number) => context.yScale(value) + context.padding.top;

    // Positions: the middle of the row, where its values span
    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(context.tooltip.data).toBe(wideData[0]));
    expect(context.tooltip.y).toBeCloseTo((top(10) + top(40)) / 2);

    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(context.tooltip.y).toBeCloseTo(top(10)));
    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(context.tooltip.y).toBeCloseTo(top(40)));
    expect(context.tooltip.x).toBeCloseTo(context.xScale(0) + context.padding.left);
  });

  it('calls `onTooltipClick` with Enter and Space', async () => {
    const onTooltipClick = vi.fn();
    const { container } = render(BarChart, {
      props: { ...baseProps, data: barData, x: 'name', y: 'value', onTooltipClick },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    // Nothing shown yet, so nothing to activate
    press(plot, 'Enter');
    expect(onTooltipClick).not.toHaveBeenCalled();

    press(plot, 'ArrowRight');
    press(plot, 'ArrowRight');
    press(plot, 'Enter');
    // The keys queue behind navigation's import, and run in order once it lands
    await vi.waitFor(() => expect(onTooltipClick).toHaveBeenCalledTimes(1));
    expect(onTooltipClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(onTooltipClick.mock.calls[0][1]).toEqual({ data: barData[1] });

    press(plot, ' ');
    expect(onTooltipClick).toHaveBeenCalledTimes(2);
  });

  it('keeps the first key from scrolling the page, before navigation has loaded', async () => {
    const { container } = render(LineChart, {
      props: { ...baseProps, data, x: 'date', y: 'value' },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    const arrow = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    plot.dispatchEvent(arrow);
    expect(arrow.defaultPrevented).toBe(true);

    // Nothing to hide, so Escape is left to the page
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    plot.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(false);

    // Unknown keys are left alone
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    plot.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
  });

  it('steps a horizontal chart with up and down', async () => {
    const { container } = render(BarChart, {
      props: { ...baseProps, data: barData, x: 'value', y: 'name', orientation: 'horizontal' },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('A, 10. 1 of 3'));
    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('B, 20. 2 of 3'));
  });

  it('hides the tooltip with Escape and on blur', async () => {
    const { container } = render(LineChart, {
      props: { ...baseProps, data, x: 'date', y: 'value' },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getTooltipRoot()).not.toBeNull());
    press(plot, 'Escape');
    await vi.waitFor(() => expect(getTooltipRoot()).toBeNull());

    plot.focus();
    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getTooltipRoot()).not.toBeNull());
    plot.blur();
    await vi.waitFor(() => expect(getTooltipRoot()).toBeNull());
    expect(getAnnouncement(container)).toBe('');
  });

  it('skips gaps in a stacked series', async () => {
    const { container } = render(AreaChart, {
      props: {
        ...baseProps,
        data: [
          { date: 0, a: 1, b: 2 },
          { date: 1, a: null, b: 3 },
          { date: 2, a: 4, b: 1 },
        ],
        x: 'date',
        series: [{ key: 'a' }, { key: 'b' }],
        seriesLayout: 'stack',
      },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('a, 0, 1. 1 of 2'));
    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('a, 2, 4. 2 of 2'));
    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('b, 2, 1. 3 of 3'));
  });

  it('moves between the `c` groups of a scatter to the nearest point', async () => {
    const { container } = render(ScatterChart, {
      props: {
        ...baseProps,
        data: [
          { x: 1, y: 5, g: 'a' },
          { x: 2, y: 3, g: 'b' },
          { x: 3, y: 8, g: 'a' },
          { x: 4, y: 1, g: 'b' },
        ],
        x: 'x',
        y: 'y',
        c: 'g',
      },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('a, x 1, y 5. 1 of 2'));
    press(plot, 'ArrowRight');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('a, x 3, y 8. 2 of 2'));
    press(plot, 'ArrowDown');
    await vi.waitFor(() => expect(getAnnouncement(container)).toBe('b, x 2, y 3. 1 of 2'));
  });

  it('adds no tab stop to a pie, which it cannot yet place points on', async () => {
    const { container } = render(PieChart, {
      props: {
        ...baseProps,
        data: [
          { k: 'a', v: 1 },
          { k: 'b', v: 2 },
        ],
        key: 'k',
        value: 'v',
      },
    });

    await expect.element(getPlotArea(container)).toBeInTheDocument();
    expect(getPlotArea(container).hasAttribute('tabindex')).toBe(false);
  });

  it('ignores keys from focusable children', async () => {
    const { container } = render(LineChart, {
      props: { ...baseProps, data, x: 'date', y: 'value' },
    });

    const plot = getPlotArea(container);
    await expect.element(plot).toBeInTheDocument();

    const child = document.createElement('button');
    plot.appendChild(child);
    press(child, 'ArrowRight');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(getAnnouncement(container)).toBe('');
    child.remove();
  });

  describe('focus indicator', () => {
    const outline = (el: Element) => getComputedStyle(el).outlineStyle;

    it('is the point shown, so the plot area draws no outline while one is', async () => {
      const { container } = render(LineChart, {
        props: { ...baseProps, data, x: 'date', y: 'value' },
      });

      const plot = getPlotArea(container);
      await expect.element(plot).toBeInTheDocument();
      plot.focus();
      await vi.waitFor(() => expect(getTooltipRoot()).not.toBeNull());
      expect(plot.matches(':focus-visible')).toBe(true);
      expect(outline(plot)).toBe('none');
    });

    it('outlines the plot area once Escape hides the point', async () => {
      const { container } = render(LineChart, {
        props: { ...baseProps, data, x: 'date', y: 'value' },
      });

      const plot = getPlotArea(container);
      await expect.element(plot).toBeInTheDocument();
      plot.focus();
      await vi.waitFor(() => expect(getTooltipRoot()).not.toBeNull());

      press(plot, 'Escape');
      await vi.waitFor(() => expect(outline(plot)).not.toBe('none'));
      expect(document.activeElement).toBe(plot);
    });

    it('outlines the plot area of a chart with no points to show', async () => {
      const { container } = render(LineChart, {
        props: { ...baseProps, data: [], x: 'date', y: 'value' },
      });

      const plot = getPlotArea(container);
      await expect.element(plot).toBeInTheDocument();
      plot.focus();
      await vi.waitFor(() => expect(outline(plot)).not.toBe('none'));
    });
  });

  describe('keys pressed before navigation loads', () => {
    it('are dropped when focus leaves first', async () => {
      const { container } = render(LineChart, {
        props: { ...baseProps, data, x: 'date', y: 'value' },
      });

      const plot = getPlotArea(container);
      await expect.element(plot).toBeInTheDocument();

      // Focusing queues the first point, and the key queues behind it — both still waiting on the
      // import when focus leaves
      plot.focus();
      press(plot, 'ArrowRight');
      plot.blur();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(getTooltipRoot()).toBeNull();
      expect(getAnnouncement(container)).toBe('');
    });

    it('are dropped when the chart is destroyed first', async () => {
      const onTooltipClick = vi.fn();
      const { container, unmount } = render(LineChart, {
        props: { ...baseProps, data, x: 'date', y: 'value', onTooltipClick },
      });

      const plot = getPlotArea(container);
      await expect.element(plot).toBeInTheDocument();

      press(plot, 'ArrowRight');
      press(plot, 'Enter');
      unmount();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(onTooltipClick).not.toHaveBeenCalled();
    });
  });
});
