import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import LineChart from '../charts/LineChart/LineChart.svelte';
import BarChart from '../charts/BarChart/BarChart.svelte';

const data = [
  { date: 0, value: 10 },
  { date: 1, value: 30 },
  { date: 2, value: 20 },
  { date: 3, value: 50 },
  { date: 4, value: 40 },
];

const barData = [
  { name: 'A', value: 10 },
  { name: 'B', value: 20 },
  { name: 'C', value: 15 },
  { name: 'D', value: 25 },
];

/**
 * Tooltip roots portal to `document.body` and their fade transition can outlive a test, so the
 * previous test's root would still be the last match.  Clear any leftovers before each test.
 */
beforeEach(() => {
  document.body.querySelectorAll('.lc-tooltip-root').forEach((el) => el.remove());
});

function getTooltipRoot() {
  const roots = document.querySelectorAll<HTMLElement>('.lc-tooltip-root');
  return roots.length ? roots[roots.length - 1] : null;
}

function getKeyboardTargets(scope: ParentNode = document) {
  return [...scope.querySelectorAll<SVGRectElement>('.lc-tooltip-keyboard-target')];
}

function pressKey(el: Element, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('TooltipContext keyboard access', () => {
  it('does not render keyboard targets for a click handler alone', async () => {
    const { container } = render(LineChart, {
      props: {
        data,
        x: 'date',
        y: 'value',
        height: 300,
        width: 400,
        onTooltipClick: () => {},
      },
    });

    await expect
      .element(container.querySelector('.lc-tooltip-context') as HTMLElement)
      .toBeInTheDocument();
    expect(getKeyboardTargets(container)).toHaveLength(0);
  });

  it('renders a labeled, tabbable target per data point when keyboard access is enabled', async () => {
    const { container } = render(LineChart, {
      props: {
        data,
        x: 'date',
        y: 'value',
        height: 300,
        width: 400,
        tooltipContext: { keyboard: true },
        onTooltipClick: () => {},
      },
    });

    await vi.waitFor(() => {
      expect(getKeyboardTargets(container)).toHaveLength(data.length);
    });

    const targets = getKeyboardTargets(container);
    targets.forEach((target, i) => {
      expect(target.getAttribute('tabindex')).toBe('0');
      expect(target.getAttribute('role')).toBe('button');
      expect(target.getAttribute('aria-label')).toBe(`${data[i].date}`);
    });
  });

  it('shows the tooltip of the focused data point and hides it on blur', async () => {
    const { container } = render(LineChart, {
      props: {
        data,
        x: 'date',
        y: 'value',
        height: 300,
        width: 400,
        tooltipContext: { keyboard: true },
        onTooltipClick: () => {},
      },
    });

    await vi.waitFor(() => {
      expect(getKeyboardTargets(container)).toHaveLength(data.length);
    });
    expect(getTooltipRoot()).toBeNull();

    const targets = getKeyboardTargets(container);
    targets[1].focus();
    await vi.waitFor(() => {
      expect(getTooltipRoot()?.textContent).toContain('30');
    });

    targets[1].blur();
    await vi.waitFor(() => expect(getTooltipRoot()).toBeNull());
  });

  it('activates the click handler on Enter and Space, once per press', async () => {
    const onTooltipClick = vi.fn();
    const { container } = render(LineChart, {
      props: {
        data,
        x: 'date',
        y: 'value',
        height: 300,
        width: 400,
        tooltipContext: { keyboard: true },
        onTooltipClick,
      },
    });

    await vi.waitFor(() => {
      expect(getKeyboardTargets(container)).toHaveLength(data.length);
    });

    const targets = getKeyboardTargets(container);

    targets[2].focus();
    pressKey(targets[2], 'Enter');
    expect(onTooltipClick).toHaveBeenCalledTimes(1);
    expect(onTooltipClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(onTooltipClick.mock.calls[0][1]).toEqual({ data: data[2] });

    pressKey(targets[2], ' ');
    expect(onTooltipClick).toHaveBeenCalledTimes(2);
    expect(onTooltipClick.mock.calls[1][1]).toEqual({ data: data[2] });

    // No other key activates
    pressKey(targets[2], 'ArrowRight');
    expect(onTooltipClick).toHaveBeenCalledTimes(2);
  });

  it('covers band mode targets with the same handler', async () => {
    const onTooltipClick = vi.fn();
    const { container } = render(BarChart, {
      props: {
        data: barData,
        x: 'name',
        y: 'value',
        height: 300,
        width: 400,
        tooltipContext: { keyboard: true },
        onTooltipClick,
      },
    });

    await vi.waitFor(() => {
      expect(getKeyboardTargets(container)).toHaveLength(barData.length);
    });

    const targets = getKeyboardTargets(container);
    targets[3].focus();
    pressKey(targets[3], 'Enter');
    expect(onTooltipClick).toHaveBeenCalledTimes(1);
    expect(onTooltipClick.mock.calls[0][1]).toEqual({ data: barData[3] });
  });
});
