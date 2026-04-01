import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, type Locator } from 'vitest/browser';
import type { ComponentProps } from 'svelte';

import TestHarness, { componentTestId } from './tests/TestHarness.svelte';
import Arc from './Arc.svelte';
import Text from './Text.svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';

const defaultProps: Partial<ComponentProps<typeof Arc>> = {
  fill: 'currentColor',
};

let el: Locator | HTMLElement | SVGElement | null; // resuable

describe(`Arc`, () => {
  it('should render Arc element', async () => {
    render(TestHarness, {
      component: Arc,
      componentProps: {
        ...defaultProps,
        value: 50,
      },
    });

    el = page.getByTestId(componentTestId);
    await expect.element(el).toBeInTheDocument();
  });

  it('should render track', async () => {
    render(TestHarness, {
      component: Arc,
      componentProps: {
        ...defaultProps,
        value: 50,
        track: { class: 'fill-none stroke-surface-content/10', 'data-testid': 'arc-track' },
      },
    });

    el = page.getByTestId('arc-track');
    await expect.element(el).toBeInTheDocument();
  });

  describe('props', () => {
    // value
    it('should render an arc path with value', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    // domain
    it('should render with custom domain', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          domain: [0, 200] as [number, number],
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // 50 out of 200 = 25% of 360 = 90 degrees
      expect(d).toBe('M0,-150A150,150,0,0,1,150,0L0,0Z');
    });

    // range
    it('should render with custom range', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          range: [0, 180] as [number, number],
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // 50% of 180 degrees = 90 degrees
      expect(d).toBe('M0,-150A150,150,0,0,1,150,0L0,0Z');
    });

    it('should render with custom domain and range', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 25,
          domain: [0, 50] as [number, number],
          range: [0, 180] as [number, number],
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,0,1,150,0L0,0Z');
    });

    it('should handle custom start angle in range', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          range: [90, 270] as [number, number],
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M150,0A150,150,0,0,1,0,150L0,0Z');
    });

    // startAngle
    it('should render with startAngle in radians', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          startAngle: Math.PI / 2, // 90 degrees
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // Arc starts at 90 degrees (pointing right), value=50 maps to 180 degrees of arc
      expect(d).toBe('M150,0A150,150,0,0,1,0,150L0,0Z');
    });

    // endAngle
    it('should render with endAngle in radians', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          endAngle: Math.PI, // 180 degrees, overrides value-based calculation
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // endAngle overrides value, arc ends at 180 degrees
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    it('should render with both startAngle and endAngle', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          startAngle: 0,
          endAngle: Math.PI / 2, // 90 degree arc
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,0,1,150,0L0,0Z');
    });

    // innerRadius
    it('should render with innerRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          innerRadius: 50,
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,50A50,50,0,1,0,0,-50Z');
    });

    // outerRadius
    it('should render with outerRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          outerRadius: 100,
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
    });

    it('should render with innerRadius and outerRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 75,
          innerRadius: 30,
          outerRadius: 50,
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-50A50,50,0,1,1,-50,0L-30,0A30,30,0,1,0,0,-30Z');
    });

    // cornerRadius
    it('should render with cornerRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          cornerRadius: 5,
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe(
        'M0,-144.914A5,5,0,0,1,5.172,-149.911A150,150,0,0,1,5.172,149.911A5,5,0,0,1,0,144.914L0,0Z'
      );
    });

    // padAngle
    it('should render with padAngle', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          padAngle: 0.02,
        },
      });

      el = page.getByTestId(componentTestId).first();
      await expect.element(el).toBeInTheDocument();
      const d = el?.element()?.getAttribute('d');
      expect(d).toBe('M1.5,-149.993A150,150,0,0,1,1.5,149.993L0,0Z');
    });

    // trackStartAngle
    it('should render track with trackStartAngle', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackStartAngle: Math.PI / 2, // 90 degrees
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // Track starts at 90 degrees (right), ends at default 360 degrees (top)
      expect(d).toBe('M150,0A150,150,0,1,1,0,-150L0,0Z');
    });

    // trackEndAngle
    it('should render track with trackEndAngle', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackEndAngle: Math.PI, // 180 degrees
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // Track ends at 180 degrees
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    it('should render track with trackStartAngle and trackEndAngle', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackStartAngle: 0,
          trackEndAngle: Math.PI,
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    // trackInnerRadius
    it('should render track with trackInnerRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackInnerRadius: 50,
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe(
        'M0,-150A150,150,0,1,1,0,150A150,150,0,1,1,0,-150M0,-50A50,50,0,1,0,0,50A50,50,0,1,0,0,-50Z'
      );
    });

    // trackOuterRadius
    it('should render track with trackOuterRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackOuterRadius: 100,
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z');
    });

    it('should render track with trackInnerRadius and trackOuterRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackInnerRadius: 20,
          trackOuterRadius: 60,
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe(
        'M0,-60A60,60,0,1,1,0,60A60,60,0,1,1,0,-60M0,-20A20,20,0,1,0,0,20A20,20,0,1,0,0,-20Z'
      );
    });

    // trackCornerRadius
    it('should render track with trackCornerRadius', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackStartAngle: 0,
          trackEndAngle: Math.PI, // half circle to make corner radius visible
          trackCornerRadius: 10,
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // With corner radius, the path should have additional curve commands
      expect(d).toContain('A10,10');
    });

    // trackPadAngle
    it('should render track with trackPadAngle', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
          trackInnerRadius: 50,
          trackStartAngle: 0,
          trackEndAngle: Math.PI, // half circle so padAngle has visible effect
          trackPadAngle: 0.1,
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      // With pad angle, the arc path coordinates should be offset from start
      expect(d).toContain('A150,150');
      expect(d).toContain('A50,50');
      // The start coordinates should not be exactly at 0,-150 due to padding
      expect(d).not.toMatch(/^M0,-150/);
    });

    // offset
    it('should apply offset to arc position', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          offset: 10,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const transform = el.element()?.getAttribute('transform');
      expect(transform).toContain('translate(-4.539904997395462, 8.91006524188368)');
    });

    it('should apply zero offset by default', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const transform = el.element()?.getAttribute('transform');
      expect(transform).toBe('translate(0, 0)');
    });

    // track
    it('should render track when track prop is provided', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { 'data-testid': 'arc-track' },
        },
      });

      el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150A150,150,0,1,1,0,-150Z');
    });

    it('should render track with custom class', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          track: { class: 'fill-none stroke-surface-content/10', 'data-testid': 'arc-track' },
        },
      });

      const el = page.getByTestId('arc-track');
      await expect.element(el).toBeInTheDocument();
      await expect.element(el).toHaveClass('fill-none');
      await expect.element(el).toHaveClass('stroke-surface-content/10');
    });

    // tooltip context integration
    it('should call tooltip.show on pointer enter with data', async () => {
      const testData = { label: 'Test', value: 50 };
      let chartContext: ChartState<any, any, any> | undefined;

      render(TestHarness, {
        component: Arc,
        chartProps: { tooltipContext: { mode: 'manual' } },
        componentProps: {
          ...defaultProps,
          value: 50,
          fill: 'blue',
          tooltip: true,
          data: testData,
        },
        oncontext: (ctx: ChartState<any, any, any>) => {
          chartContext = ctx;
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();

      const tooltipShowSpy = vi.spyOn(chartContext!.tooltip, 'show');
      await el.hover();

      expect(tooltipShowSpy).toHaveBeenCalled();
      expect(tooltipShowSpy.mock.calls[0][1]).toEqual(testData);
    });

    it('should call tooltip.hide on pointer leave', async () => {
      let chartContext: ChartState<any, any, any> | undefined;

      render(TestHarness, {
        component: Arc,
        chartProps: { tooltipContext: { mode: 'manual' } },
        componentProps: {
          ...defaultProps,
          value: 50,
          fill: 'blue',
          tooltip: true,
          data: { value: 50 },
        },
        oncontext: (ctx: ChartState<any, any, any>) => {
          chartContext = ctx;
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();

      const tooltipHideSpy = vi.spyOn(chartContext!.tooltip, 'hide');
      await el.hover();
      // Move away from the element to trigger pointer leave
      await page.getByTestId('test-lc-chart').hover({ position: { x: 0, y: 0 } });

      expect(tooltipHideSpy).toHaveBeenCalled();
    });

    // fill
    it('should apply fill color', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          fill: 'red',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toHaveAttribute('fill', 'red');
    });

    // fillOpacity
    it('should apply fillOpacity', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          fillOpacity: 0.7,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await expect.element(el).toHaveAttribute('fill-opacity', '0.7');
    });

    // stroke
    it('should have stroke="none" by default', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await expect.element(el).toHaveAttribute('stroke', 'none');
    });

    it('should apply stroke color', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          stroke: 'blue',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await expect.element(el).toHaveAttribute('stroke', 'blue');
    });

    // strokeWidth
    it('should apply strokeWidth', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          stroke: 'blue',
          strokeWidth: 3,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await expect.element(el).toHaveAttribute('stroke-width', '3');
    });

    // opacity
    it('should apply opacity', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          opacity: 0.5,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await expect.element(el).toHaveAttribute('opacity', '0.5');
    });

    // class
    it('should apply custom class', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          class: 'custom-arc-class',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await expect.element(el).toHaveClass('custom-arc-class');
    });
  });

  describe('events', () => {
    it('should handle pointer enter events', async () => {
      const onPointerEnter = vi.fn();
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          onpointerenter: onPointerEnter,
          fill: 'blue',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await el.hover();
      expect(onPointerEnter).toHaveBeenCalled();
    });

    it('should handle pointer move events', async () => {
      const onPointerMove = vi.fn();
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          onpointermove: onPointerMove,
          fill: 'blue',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      await el.hover();
      expect(onPointerMove).toHaveBeenCalled();
    });

    it('should handle touch move events', async () => {
      const onTouchMove = vi.fn();
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          ontouchmove: onTouchMove,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const element = el.element();
      element.dispatchEvent(new TouchEvent('touchmove', { bubbles: true }));
      expect(onTouchMove).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle value of 0', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 0,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150L0,0Z');
    });

    it('should handle value at max domain', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 100,
          domain: [0, 100] as [number, number],
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150A150,150,0,1,1,0,-150Z');
    });

    it('should handle negative domain values', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 0,
          domain: [-50, 50] as [number, number],
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    it('should handle innerRadius of 0 (pie slice)', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          innerRadius: 0,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    it('should handle full circle (360 degree range)', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 100,
          domain: [0, 100] as [number, number],
          range: [0, 360] as [number, number],
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150A150,150,0,1,1,0,-150Z');
    });

    it('should handle partial arc (e.g., 180 degrees)', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 100,
          domain: [0, 100] as [number, number],
          range: [0, 180] as [number, number],
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    it('should handle value exceeding domain max', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 150,
          domain: [0, 100] as [number, number],
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,1,1,0,150A150,150,0,1,1,0,-150Z');
    });

    it('should handle value below domain min', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: -10,
          domain: [0, 100] as [number, number],
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150A150,150,0,0,0,-88.168,-121.353L0,0Z');
    });
  });

  describe('snippets', () => {
    it('should render text inner, middle, outer Text children', async () => {
      render(TestHarness, {
        chartProps: {
          height: 400,
          padding: '50',
        },

        component: Arc,
        componentProps: {
          ...defaultProps,
          fill: 'blue',
          value: 50,
          innerRadius: 70,
          outerRadius: 140,
          cornerRadius: 8,
        },
        childComponents: [
          {
            component: Text,
            props: ({ getArcTextProps }) => ({
              ...getArcTextProps('inner'),
              'data-testid': 'inner-text',
              value: 'Inner',
              class: 'text-lg',
            }),
          },
          {
            component: Text,
            props: ({ getArcTextProps }) => ({
              ...getArcTextProps('outer'),
              'data-testid': 'outer-text',
              value: 'Outer',
              class: 'text-lg',
            }),
          },
          {
            component: Text,
            props: ({ getArcTextProps }) => ({
              ...getArcTextProps('middle'),
              'data-testid': 'middle-text',
              value: 'Middle',
              class: 'text-lg',
            }),
          },
        ],
      });

      const inner = page.getByTestId('inner-text');
      await expect.element(inner).toBeInTheDocument();
      await expect.element(inner).toHaveTextContent('Inner');
      const middle = page.getByTestId('middle-text');
      await expect.element(middle).toBeInTheDocument();
      await expect.element(middle).toHaveTextContent('Middle');
      const outer = page.getByTestId('outer-text');
      await expect.element(outer).toBeInTheDocument();
      await expect.element(outer).toHaveTextContent('Outer');
    });
  });

  describe.skip('motion', () => {
    // TODO:  not sure how to test this, check before motion applied?
    // no prop to control inital wait, may need screenshot testing?
    it('should start at initialValue', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          motion: { type: 'tween', duration: 300 },
          value: 100,
          initialValue: 0,
        },
      });
      // Initially should render (motion will animate from initialValue to value)
      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      const d = el.element()?.getAttribute('d');
      expect(d).toBe('M0,-150L0,0Z');
    });

    it('should accept spring motion config', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          initialValue: 0,
          motion: { type: 'spring', stiffness: 100, damping: 10 },
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();

      // Initial state (value=0) - just a line
      const initialD = el.element()?.getAttribute('d');
      expect(initialD).toBe('M0,-150L0,0Z');

      // Wait for spring animation to settle at final state (value=50)
      await expect
        .poll(() => el.element()?.getAttribute('d'), { timeout: 3000 })
        .toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });

    it('should accept tween motion config', async () => {
      render(TestHarness, {
        component: Arc,
        componentProps: {
          ...defaultProps,
          value: 50,
          initialValue: 0,
          motion: { type: 'tween', duration: 300 },
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();

      // Initial state (value=0) - just a line
      const initialD = el.element()?.getAttribute('d');
      expect(initialD).toBe('M0,-150L0,0Z');

      // Wait for tween animation to complete at final state (value=50)
      await expect
        .poll(() => el.element()?.getAttribute('d'), { timeout: 1000 })
        .toBe('M0,-150A150,150,0,1,1,0,150L0,0Z');
    });
  });
});
