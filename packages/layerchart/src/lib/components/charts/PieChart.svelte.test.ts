import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PieChart from './PieChart.svelte';

const data = [
  { browser: 'chrome', visitors: 275, color: 'red' },
  { browser: 'safari', visitors: 200, color: 'blue' },
  { browser: 'firefox', visitors: 187, color: 'orange' },
];

describe('PieChart', () => {
  it('uses hovered slice identity for implicit tooltip series', async () => {
    const { container } = render(PieChart, {
      data,
      key: 'browser',
      value: 'visitors',
      c: 'color',
      height: 300,
      width: 300,
    });

    const arc = container.querySelector('.lc-arc-line') as SVGElement | null;
    await expect.element(arc).toBeInTheDocument();

    const rect = arc!.getBoundingClientRect();
    const eventInit = {
      bubbles: true,
      clientX: rect.x + rect.width / 2,
      clientY: rect.y + rect.height / 2,
    };

    arc!.dispatchEvent(new PointerEvent('pointerenter', eventInit));
    arc!.dispatchEvent(new PointerEvent('pointermove', eventInit));

    await vi.waitFor(() => {
      const tooltipLabel = document.querySelector('.lc-tooltip-item-label');
      const tooltipValue = document.querySelector('.lc-tooltip-item-value');

      expect(tooltipLabel?.textContent).toContain('chrome');
      expect(tooltipValue?.textContent).toContain('275');
    });
  });
});
