import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BrushMarkHarness from '../tests/BrushMarkHarness.svelte';

describe('Brush', () => {
  describe('touch', () => {
    // A touch drag the browser reads as a scroll pans the page and cancels the pointer stream
    // part-way, so the brush never completes.  `touch-action: none` is what tells it otherwise —
    // `BrushContext` sets the same on its container.
    it('takes touch drags rather than letting them scroll the page', async () => {
      const { container } = render(BrushMarkHarness, {});

      const region = await vi.waitFor(() => {
        const el = container.querySelector('.lc-brush-root');
        expect(el).not.toBeNull();
        return el as Element;
      });

      expect(getComputedStyle(region).touchAction).toBe('none');
    });

    it('does the same on an html layer', async () => {
      const { container } = render(BrushMarkHarness, { layer: 'html' } as any);

      const region = await vi.waitFor(() => {
        const el = container.querySelector('.lc-brush-root');
        expect(el).not.toBeNull();
        return el as Element;
      });

      expect(getComputedStyle(region).touchAction).toBe('none');
    });

    it('keeps the selection and its handles draggable by touch too', async () => {
      const { container } = render(BrushMarkHarness, {
        brushProps: { state: undefined },
      } as any);

      const region = await vi.waitFor(() => {
        const el = container.querySelector('.lc-brush-root') as HTMLElement;
        expect(el).not.toBeNull();
        return el;
      });

      // Draw a selection so the selection rect and handles exist
      const rect = region.getBoundingClientRect();
      const at = (x: number) => ({
        bubbles: true,
        clientX: rect.x + x,
        clientY: rect.y + rect.height / 2,
        pointerId: 1,
      });
      region.dispatchEvent(new PointerEvent('pointerdown', at(rect.width * 0.2)));
      window.dispatchEvent(new PointerEvent('pointermove', at(rect.width * 0.6)));
      window.dispatchEvent(new PointerEvent('pointerup', at(rect.width * 0.6)));

      const selection = await vi.waitFor(() => {
        const el = container.querySelector('.lc-brush-selection');
        expect(el).not.toBeNull();
        return el as Element;
      });

      expect(getComputedStyle(selection).touchAction).toBe('none');
      for (const handle of container.querySelectorAll('.lc-brush-handle')) {
        expect(getComputedStyle(handle).touchAction).toBe('none');
      }
    });
  });
});
