import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import LineChart from '../charts/LineChart.svelte';

const data = [
  { date: 0, value: 10 },
  { date: 1, value: 30 },
  { date: 2, value: 20 },
  { date: 3, value: 50 },
  { date: 4, value: 40 },
];

const baseProps = {
  data,
  x: 'date',
  y: 'value',
  height: 300,
  width: 400,
  tooltipContext: { mode: 'bisect-x' as const },
};

/** Dispatch pointer events to trigger the tooltip on a given element */
function triggerTooltip(el: Element, position?: { clientX: number; clientY: number }) {
  const rect = el.getBoundingClientRect();
  const eventInit = {
    bubbles: true,
    clientX: position?.clientX ?? rect.x + rect.width / 2,
    clientY: position?.clientY ?? rect.y + rect.height / 2,
  };
  el.dispatchEvent(new PointerEvent('pointerenter', eventInit));
  el.dispatchEvent(new PointerEvent('pointermove', eventInit));
}

describe('Tooltip', () => {
  describe('portal', () => {
    it('should portal tooltip to body by default', async () => {
      const { container } = render(LineChart, {
        props: baseProps,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        // Tooltip root should be portaled to body (outside the chart container)
        const tooltipInBody = document.body.querySelector('.lc-tooltip-root');
        expect(tooltipInBody).not.toBeNull();

        // Should use fixed positioning when portaled
        const style = getComputedStyle(tooltipInBody!);
        expect(style.position).toBe('fixed');
      });
    });

    it('should render tooltip inline when portal is false', async () => {
      const { container } = render(LineChart, {
        props: {
          ...baseProps,
          props: { tooltip: { root: { portal: false } } },
        },
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        // Tooltip root should be inside the chart container
        const tooltipInContainer = container.querySelector('.lc-tooltip-root');
        expect(tooltipInContainer).not.toBeNull();

        // Should use absolute positioning when not portaled
        const style = getComputedStyle(tooltipInContainer!);
        expect(style.position).toBe('absolute');
      });
    });

    it('should portal tooltip to a custom selector target', async () => {
      // Create a custom portal target
      const portalTarget = document.createElement('div');
      portalTarget.className = 'custom-portal-target';
      document.body.appendChild(portalTarget);

      try {
        const { container } = render(LineChart, {
          props: {
            ...baseProps,
            props: { tooltip: { root: { portal: { target: '.custom-portal-target' } } } },
          },
        });

        const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
        await expect.element(tooltipCtx).toBeInTheDocument();
        triggerTooltip(tooltipCtx);

        await vi.waitFor(() => {
          const tooltipInTarget = portalTarget.querySelector('.lc-tooltip-root');
          expect(tooltipInTarget).not.toBeNull();
        });
      } finally {
        portalTarget.remove();
      }
    });

    it('should show tooltip content when portaled', async () => {
      const { container } = render(LineChart, {
        props: baseProps,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root');
        expect(tooltipRoot).not.toBeNull();

        // Should contain tooltip content (items from default tooltip)
        const tooltipItems = tooltipRoot!.querySelectorAll('.lc-tooltip-item-root');
        expect(tooltipItems.length).toBeGreaterThan(0);
      });
    });

    it('should have numeric top and left styles when portaled', async () => {
      const { container } = render(LineChart, {
        props: baseProps,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();
      triggerTooltip(tooltipCtx);

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        // Should have valid pixel positions (not NaN or empty)
        const top = tooltipRoot.style.top;
        const left = tooltipRoot.style.left;
        expect(top).toMatch(/^-?\d+(\.\d+)?px$/);
        expect(left).toMatch(/^-?\d+(\.\d+)?px$/);
      });
    });
  });

  describe('contained="container" (default)', () => {
    it('should flip tooltip left when pointer is near the right edge', async () => {
      const { container } = render(LineChart, {
        props: baseProps,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();

      const ctxRect = tooltipCtx.getBoundingClientRect();
      // Trigger near the right edge of the container
      triggerTooltip(tooltipCtx, {
        clientX: ctxRect.right - 5,
        clientY: ctxRect.top + ctxRect.height / 2,
      });

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        const tooltipLeft = parseFloat(tooltipRoot.style.left);
        // Tooltip should be positioned to the LEFT of the pointer (flipped),
        // so its left edge should be less than the pointer position
        expect(tooltipLeft).toBeLessThan(ctxRect.right - 5);
        // And specifically, the tooltip's right edge should not exceed the container
        expect(tooltipLeft + tooltipRoot.offsetWidth).toBeLessThanOrEqual(ctxRect.right + 1);
      });
    });

    it('should flip tooltip right when pointer is near the left edge', async () => {
      const { container } = render(LineChart, {
        props: {
          ...baseProps,
          props: { tooltip: { root: { anchor: 'top-right' as const } } },
        },
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();

      const ctxRect = tooltipCtx.getBoundingClientRect();
      // Trigger near the left edge of the container
      triggerTooltip(tooltipCtx, {
        clientX: ctxRect.left + 5,
        clientY: ctxRect.top + ctxRect.height / 2,
      });

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        const tooltipLeft = parseFloat(tooltipRoot.style.left);
        // Tooltip should be positioned to the RIGHT of the pointer (flipped),
        // so its left edge should be >= the container's left edge
        expect(tooltipLeft).toBeGreaterThanOrEqual(ctxRect.left - 1);
      });
    });

    it('should flip tooltip up when pointer is near the bottom edge', async () => {
      const { container } = render(LineChart, {
        props: baseProps,
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();

      const ctxRect = tooltipCtx.getBoundingClientRect();
      // Trigger near the bottom edge of the container
      triggerTooltip(tooltipCtx, {
        clientX: ctxRect.left + ctxRect.width / 2,
        clientY: ctxRect.bottom - 5,
      });

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        const tooltipTop = parseFloat(tooltipRoot.style.top);
        // Tooltip should be positioned ABOVE the pointer (flipped),
        // so its bottom edge should not exceed the container
        expect(tooltipTop + tooltipRoot.offsetHeight).toBeLessThanOrEqual(ctxRect.bottom + 1);
      });
    });

    it('should flip tooltip down when pointer is near the top edge', async () => {
      const { container } = render(LineChart, {
        props: {
          ...baseProps,
          props: { tooltip: { root: { anchor: 'bottom-left' as const } } },
        },
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();

      const ctxRect = tooltipCtx.getBoundingClientRect();
      // Trigger near the top edge of the container
      triggerTooltip(tooltipCtx, {
        clientX: ctxRect.left + ctxRect.width / 2,
        clientY: ctxRect.top + 5,
      });

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        const tooltipTop = parseFloat(tooltipRoot.style.top);
        // Tooltip should be positioned BELOW the pointer (flipped),
        // so its top edge should be >= the container's top
        expect(tooltipTop).toBeGreaterThanOrEqual(ctxRect.top - 1);
      });
    });
  });

  describe('contained="window"', () => {
    it('should flip tooltip left when it would overflow the right side of the viewport', async () => {
      const { container } = render(LineChart, {
        props: {
          ...baseProps,
          props: { tooltip: { root: { contained: 'window' as const } } },
        },
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();

      const ctxRect = tooltipCtx.getBoundingClientRect();
      // Trigger near the right edge of the container
      triggerTooltip(tooltipCtx, {
        clientX: ctxRect.right - 5,
        clientY: ctxRect.top + ctxRect.height / 2,
      });

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        const tooltipLeft = parseFloat(tooltipRoot.style.left);
        // Tooltip should not overflow the right side of the viewport
        expect(tooltipLeft + tooltipRoot.offsetWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      });
    });

    it('should flip tooltip up when it would overflow the bottom of the viewport', async () => {
      const { container } = render(LineChart, {
        props: {
          ...baseProps,
          props: { tooltip: { root: { contained: 'window' as const } } },
        },
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();

      const ctxRect = tooltipCtx.getBoundingClientRect();
      // Trigger near the bottom edge of the container
      triggerTooltip(tooltipCtx, {
        clientX: ctxRect.left + ctxRect.width / 2,
        clientY: ctxRect.bottom - 5,
      });

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        const tooltipTop = parseFloat(tooltipRoot.style.top);
        // Tooltip should not overflow the bottom of the viewport
        expect(tooltipTop + tooltipRoot.offsetHeight).toBeLessThanOrEqual(window.innerHeight + 1);
      });
    });
  });

  describe('contained={false}', () => {
    it('should not constrain tooltip position', async () => {
      const { container } = render(LineChart, {
        props: {
          ...baseProps,
          props: { tooltip: { root: { contained: false } } },
        },
      });

      const tooltipCtx = container.querySelector('.lc-tooltip-context') as HTMLElement;
      await expect.element(tooltipCtx).toBeInTheDocument();

      const ctxRect = tooltipCtx.getBoundingClientRect();
      // Trigger near the right edge — tooltip should NOT flip
      triggerTooltip(tooltipCtx, {
        clientX: ctxRect.right - 5,
        clientY: ctxRect.top + ctxRect.height / 2,
      });

      await vi.waitFor(() => {
        const tooltipRoot = document.body.querySelector('.lc-tooltip-root') as HTMLElement;
        expect(tooltipRoot).not.toBeNull();

        const tooltipLeft = parseFloat(tooltipRoot.style.left);
        // With default anchor='top-left', tooltip is placed to the right of pointer.
        // Since contained=false, the tooltip left should be near/past the pointer x
        // (i.e., it doesn't flip like contained="container" would)
        const pointerViewportX = ctxRect.right - 5;
        expect(tooltipLeft).toBeGreaterThanOrEqual(pointerViewportX - 1);
      });
    });
  });
});
