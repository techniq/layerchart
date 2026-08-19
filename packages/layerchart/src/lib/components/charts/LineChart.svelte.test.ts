import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';

import LineChart from './LineChart/LineChart.svelte';

const data = [
  { date: 0, value: 10 },
  { date: 1, value: 30 },
  { date: 2, value: 20 },
  { date: 3, value: 50 },
  { date: 4, value: 40 },
];

describe('LineChart', () => {
  it('tooltip should prefer cScale color over default series color when cScale is explicitly provided', async () => {
    const { container } = render(LineChart, {
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
