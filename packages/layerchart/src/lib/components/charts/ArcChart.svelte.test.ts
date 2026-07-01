import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ArcChartTooltip from './__fixtures__/ArcChartTooltip.svelte';

describe('ArcChart', () => {
  it('uses the chart value accessor for explicit per-series tooltip values', async () => {
    const { container } = render(ArcChartTooltip);

    const arc = container.querySelectorAll('.lc-arc-line').item(2) as SVGElement | null;
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
      const tooltipLabel = container.querySelector('.arc-chart-tooltip-label');
      const tooltipValue = container.querySelector('.arc-chart-tooltip-value');

      expect(tooltipLabel?.textContent).toContain('firefox');
      expect(tooltipValue?.textContent).toContain('187');
    });
  });
});
