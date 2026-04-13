import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';

import LineChart from './LineChart.svelte';

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

    tooltipRect!.dispatchEvent(new PointerEvent('pointerenter', eventInit));
    tooltipRect!.dispatchEvent(new PointerEvent('pointermove', eventInit));

    await vi.waitFor(() => {
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
