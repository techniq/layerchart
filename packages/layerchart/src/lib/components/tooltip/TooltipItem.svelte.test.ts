import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TooltipItemSeriesHarness from '$lib/tests/TooltipItemSeriesHarness.svelte';

/** Show the tooltip for the first band, re-dispatching until `assertion` passes */
async function waitForTooltip(container: HTMLElement, assertion: () => void) {
  await vi.waitFor(() => {
    const rect = container.querySelector('.lc-tooltip-rect');
    expect(rect).not.toBeNull();
    const r = rect!.getBoundingClientRect();
    const init = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
    rect!.dispatchEvent(new PointerEvent('pointerenter', init));
    rect!.dispatchEvent(new PointerEvent('pointermove', init));
    assertion();
  });
}

function items(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('.lc-tooltip-item-root'));
}

function text(el: Element | null | undefined) {
  return el?.textContent?.replace(/\s+/g, ' ').trim();
}

describe('TooltipItem', () => {
  describe('seriesKey', () => {
    it('should default the label, value, and color from the series', async () => {
      const { container } = render(TooltipItemSeriesHarness);

      await waitForTooltip(container, () => {
        const apples = items(container)[0];
        expect(text(apples.querySelector('.lc-tooltip-item-label'))).toBe('Apples');
        expect(text(apples.querySelector('.lc-tooltip-item-value'))).toBe('10');
        expect(
          apples
            .querySelector<HTMLElement>('.lc-tooltip-item-color')
            ?.style.getPropertyValue('--color')
        ).toBe('red');
      });
    });

    it('should prefer explicit props over the series', async () => {
      const { container } = render(TooltipItemSeriesHarness);

      await waitForTooltip(container, () => {
        const bananas = items(container)[1];
        expect(text(bananas.querySelector('.lc-tooltip-item-label'))).toBe('Doubled');
        expect(text(bananas.querySelector('.lc-tooltip-item-value'))).toBe('40');
      });
    });

    it('should not render the item of a hidden series', async () => {
      const { container } = render(TooltipItemSeriesHarness);

      await waitForTooltip(container, () => {
        expect(
          items(container).map((el) => text(el.querySelector('.lc-tooltip-item-label')))
        ).toEqual(['Apples', 'Doubled']);
      });
    });

    it('should highlight the series while the item is hovered', async () => {
      const { container } = render(TooltipItemSeriesHarness);

      await waitForTooltip(container, () => expect(items(container).length).toBe(2));

      const [apples, bananas] = items(container);
      apples.dispatchEvent(new PointerEvent('pointerenter'));

      await vi.waitFor(() => {
        expect(apples.dataset.highlighted).toBe('true');
        expect(bananas.dataset.highlighted).toBe('false');
      });

      apples.dispatchEvent(new PointerEvent('pointerleave'));

      await vi.waitFor(() => {
        expect(apples.dataset.highlighted).toBe('true');
        expect(bananas.dataset.highlighted).toBe('true');
      });
    });
  });
});
