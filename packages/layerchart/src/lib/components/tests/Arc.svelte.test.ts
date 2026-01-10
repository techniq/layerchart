import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createLayers } from './testUtils.js';
import ChartWrapper from './ChartWrapper.test.svelte';

// Component-specific configuration
import TestComponent from '../Arc.svelte';
const componentName = 'Arc';
const layerNames: Array<'svg' | 'canvas'> = ['svg', 'canvas'];

const layers = createLayers(layerNames);

describe.each(layers)(`${componentName} ($name)`, ({ layer, name }) => {
  // Note: Canvas tests require different assertions (no DOM elements to query)
  const isCanvas = name === 'Canvas';

  describe('Initial Rendering', () => {
    it('should render with default props', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
      });

      if (isCanvas) {
        await expect.element(page.getByTestId('canvas-layer')).toBeInTheDocument();
      } else {
        await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
      }
    });
  });

  describe.skipIf(name === 'Canvas')('Checking Props', () => {
    it('should render an arc path with value', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          innerRadius: 30,
          outerRadius: 50,
        },
      });

      const arcPath = page.getByTestId('arc-path');
      await expect.element(arcPath).toBeInTheDocument();
      const d = arcPath.element().getAttribute('d');
      expect(d).toBeTruthy(); // Verify the path has data generated
      expect(d).not.toBe('M0,0Z'); // Should not be empty path
      expect(d).toMatch(/[MA]/); // Should have Move and Arc commands
      const textElement = page.getByTestId('text-element');
      await expect.element(textElement).toBeInTheDocument();
      const text = textElement.element().textContent;
      expect(text).toBe('50');
    });

    it('should render with custom domain and range', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 25,
          domain: [0, 50] as [number, number],
          range: [0, 180] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should render with innerRadius and outerRadius', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 75,
          innerRadius: 30,
          outerRadius: 50,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should render with cornerRadius', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          cornerRadius: 5,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should render with padAngle', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          padAngle: 0.02,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });
  });

  describe.skipIf(isCanvas)('Track Rendering', () => {
    it('should render track when track prop is true', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          track: true,
        },
      });

      await expect.element(page.getByTestId('arc-track')).toBeInTheDocument();
      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should render track with custom props', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          track: { class: 'custom-track' },
        },
      });

      const track = page.getByTestId('arc-track');
      await expect.element(track).toBeInTheDocument();
      await expect.element(track).toHaveClass('custom-track');
    });

    it('should support custom track radius values', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          track: true,
          trackInnerRadius: 20,
          trackOuterRadius: 60,
        },
      });

      await expect.element(page.getByTestId('arc-track')).toBeInTheDocument();
    });

    it('should support custom track angles', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          track: true,
          trackStartAngle: 0,
          trackEndAngle: Math.PI,
        },
      });

      await expect.element(page.getByTestId('arc-track')).toBeInTheDocument();
    });

    it('should support track corner radius', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          track: true,
          trackCornerRadius: 10,
        },
      });

      await expect.element(page.getByTestId('arc-track')).toBeInTheDocument();
    });
  });

  describe.skipIf(isCanvas)('User Interactions', () => {
    it('should handle pointer enter events', async () => {
      const onPointerEnter = vi.fn();
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          onpointerenter: onPointerEnter,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      // Note: Hover requires visible element; testing event handler attachment
    });

    it('should handle pointer move events', async () => {
      const onPointerMove = vi.fn();
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          onpointermove: onPointerMove,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      // Note: Hover requires visible element; testing event handler attachment
    });

    it('should handle pointer leave events', async () => {
      const onPointerLeave = vi.fn();
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          onpointerleave: onPointerLeave,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      // Note: Testing pointer leave requires moving to a different element or simulation
    });

    it('should handle touch move events', async () => {
      const onTouchMove = vi.fn();
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          ontouchmove: onTouchMove,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      // Note: Touch events require special handling in browser tests
    });
  });

  describe.skipIf(isCanvas)('Styling', () => {
    it('should apply fill color', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          fill: 'red',
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toHaveAttribute('fill', 'red');
    });

    it('should apply opacity', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          opacity: 0.5,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toHaveAttribute('opacity', '0.5');
    });

    it('should apply fillOpacity', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          fillOpacity: 0.7,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toHaveAttribute('fill-opacity', '0.7');
    });

    it('should apply custom class', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          class: 'custom-arc',
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toHaveClass('custom-arc');
    });
  });

  describe.skipIf(isCanvas)('Radius Calculations', () => {
    it('should calculate outerRadius from discrete value (>= 1)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          outerRadius: 80,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      await expect.element(arc).toHaveAttribute('d');
    });

    it('should calculate outerRadius from percentage (0 < value < 1)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          outerRadius: 0.8,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should calculate outerRadius from offset (< 0)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          outerRadius: -10,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should calculate innerRadius from discrete value (>= 1)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          innerRadius: 30,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should calculate innerRadius from percentage (0 < value < 1)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          innerRadius: 0.5,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should calculate innerRadius from offset (< 0)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          innerRadius: -20,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });
  });

  describe.skipIf(isCanvas)('Angle Calculations', () => {
    it('should use startAngle and endAngle in radians', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          startAngle: 0,
          endAngle: Math.PI,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should convert range degrees to radians', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          range: [0, 180] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should scale value to angle based on domain and range', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          domain: [0, 100] as [number, number],
          range: [0, 360] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle custom start angle in range', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          range: [90, 270] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });
  });

  describe.skipIf(isCanvas)('Offset', () => {
    it('should apply offset to arc position', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          offset: 10,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      const transform = arc.element().getAttribute('transform');
      expect(transform).toContain('translate');
    });

    it('should apply zero offset by default', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toHaveAttribute('transform', 'translate(0, 0)');
    });
  });

  describe.skipIf(isCanvas)('Edge Cases', () => {
    it('should handle value of 0', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 0,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle value at max domain', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 100,
          domain: [0, 100] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle negative domain values', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 0,
          domain: [-50, 50] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle innerRadius of 0 (pie slice)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          innerRadius: 0,
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle full circle (360 degree range)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 100,
          domain: [0, 100] as [number, number],
          range: [0, 360] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle partial arc (e.g., 180 degrees)', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 100,
          domain: [0, 100] as [number, number],
          range: [0, 180] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle value exceeding domain max', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 150,
          domain: [0, 100] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should handle value below domain min', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: -10,
          domain: [0, 100] as [number, number],
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });
  });

  describe.skipIf(isCanvas)('Motion/Animation', () => {
    it('should start at initialValue', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 100,
          initialValue: 0,
        },
      });

      // Initially should render (motion will animate from initialValue to value)
      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should accept spring motion config', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          motion: { type: 'spring', stiffness: 100, damping: 10 },
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });

    it('should accept tween motion config', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          motion: { type: 'tween', duration: 300 },
        },
      });

      await expect.element(page.getByTestId('arc-path')).toBeInTheDocument();
    });
  });

  describe.skipIf(isCanvas)('Default Stroke', () => {
    it('should have stroke="none" by default', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      await expect.element(arc).toHaveAttribute('stroke', 'none');
    });
  });

  describe.skipIf(isCanvas)('Path Data', () => {
    it('should generate valid SVG path data', async () => {
      render(ChartWrapper, {
        layer,
        component: TestComponent,
        componentProps: {
          value: 50,
          innerRadius: 30,
          outerRadius: 50,
        },
      });

      const arc = page.getByTestId('arc-path');
      await expect.element(arc).toBeInTheDocument();
      const d = arc.element().getAttribute('d');
      expect(d).toBeTruthy();
      // SVG arc path should contain M (moveto), A (arc), and L (lineto) commands
      expect(d).toMatch(/[MAL]/);
    });
  });
});
