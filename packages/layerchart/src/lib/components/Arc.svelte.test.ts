import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, type Locator } from 'vitest/browser';
import ChartHarness from './tests/ChartHarness.svelte';

// Component-specific configuration ---------------------------------------
import TestComponent from './Arc.svelte';
const componentName = 'Arc';
const supportedLayers: Array<'svg' | 'html' | 'canvas'> = ['svg'];
const componentTestId = 'test-lc-component';
const accessoryTestIds = ['arc-track']; // optional (defined in Component) 1
// -------------------------------------------------------------------------
let el: Locator | HTMLElement | SVGElement | null; // resuable

for (const layer of supportedLayers) {
  const isCanvas = layer === 'canvas';

  describe(`${componentName} Testing (${layer})`, () => {
    // Note: Canvas tests require different assertions (no DOM elements to query)

    describe('Initial Layers Renderings', () => {
      it(`should render correct in layer ${layer}`, async () => {
        const { container } = render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
          },
        });

        /* ---------------------------------------------------------------------
        | This section for class based tests
        ------------------------------------------------------------------------*/
        if (layer === 'canvas') {
          // Canvas-specific tests
          el = container.querySelector('canvas') as HTMLCanvasElement | null;
          await expect.element(el).toBeInTheDocument();
        } else if (layer === 'svg') {
          // SVG-specific tests
          el = container.querySelector('svg') as SVGElement | null;
          await expect.element(el).toBeInTheDocument();
        } else if (layer === 'html') {
          // HTML-specific tests
          el = container.querySelector('div') as HTMLElement | null;
          await expect.element(el).toBeInTheDocument();
        }
      });

      it('should render correct Component elements', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            track: { class: 'fill-none stroke-surface-content/10' },
            value: 50,
          },
        });

        // Test Chart element
        el = page.getByTestId('test-lc-chart');
        await expect.element(el).toBeInTheDocument();

        // Test Component element
        el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
      });
    });

    describe.skipIf(isCanvas)(`It should render accessory elements`, () => {
      for (const testId of accessoryTestIds) {
        it(`${testId} should be rendered`, async () => {
          render(ChartHarness, {
            layer,
            component: TestComponent,
            componentProps: {
              value: 50,
              track: { class: 'fill-none stroke-surface-content/10', 'data-testid': testId },
            },
          });

          el = page.getByTestId(testId);
          await expect.element(el).toBeInTheDocument();
        });
      }
    });

    describe.skipIf(layer === 'canvas')('Checking Props', () => {
      it('should render an arc path with value', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
          },
        });

        el = page.getByTestId(componentTestId).first();
        await expect.element(el).toBeInTheDocument();
        const element = el.element() as SVGPathElement;
        if (layer === 'svg') {
          const d = element.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
        }
      });

      it('should render with custom domain and range', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 25,
            domain: [0, 50] as [number, number],
            range: [0, 180] as [number, number],
          },
        });

        el = page.getByTestId(componentTestId).first();
        await expect.element(el).toBeInTheDocument();
        const element = el.element() as SVGPathElement;
        if (layer === 'svg') {
          const d = element.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,0,1,100,0L0,0Z');
        }
      });

      it('should render with innerRadius and outerRadius', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 75,
            innerRadius: 30,
            outerRadius: 50,
          },
        });

        el = page.getByTestId(componentTestId).first();
        await expect.element(el).toBeInTheDocument();
        const element = el.element() as SVGPathElement;
        if (layer === 'svg') {
          const d = element.getAttribute('d');
          expect(d).toBe('M0,-50A50,50,0,1,1,-50,0L-30,0A30,30,0,1,0,0,-30Z');
        }
      });

      it('should render with cornerRadius', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            cornerRadius: 5,
          },
        });

        el = page.getByTestId(componentTestId).first();
        await expect.element(el).toBeInTheDocument();
        const element = el.element() as SVGPathElement;
        if (layer === 'svg') {
          const d = element.getAttribute('d');
          expect(d).toBe(
            'M0,-94.868A5,5,0,0,1,5.263,-99.861A100,100,0,0,1,5.263,99.861A5,5,0,0,1,0,94.868L0,0Z'
          );
        }
      });

      it('should render with padAngle', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            padAngle: 0.02,
          },
        });

        el = page.getByTestId(componentTestId).first();
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el?.element()?.getAttribute('d');
          expect(d).toBe('M1,-99.995A100,100,0,0,1,1,99.995L0,0Z');
        }
      });

      it('should render track when track prop is true', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            track: { 'data-testid': 'arc-track' },
          },
        });

        el = page.getByTestId('arc-track');
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z');
        }
      });

      it('should render track with custom props', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            track: { class: 'fill-none stroke-surface-content/10', 'data-testid': 'arc-track' },
          },
        });

        const el = page.getByTestId('arc-track');
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          await expect.element(el).toHaveClass('fill-none');
          await expect.element(el).toHaveClass('stroke-surface-content/10');
        }
      });

      it('should support custom track radius values', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            track: { class: 'fill-none stroke-surface-content/10', 'data-testid': 'arc-track' },
            trackInnerRadius: 20,
            trackOuterRadius: 60,
          },
        });

        el = page.getByTestId('arc-track');
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe(
            'M0,-60A60,60,0,1,1,0,60A60,60,0,1,1,0,-60M0,-20A20,20,0,1,0,0,20A20,20,0,1,0,0,-20Z'
          );
        }
      });

      it('should support custom track angles', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            track: { class: 'fill-none stroke-surface-content/10', 'data-testid': 'arc-track' },
            trackStartAngle: 0,
            trackEndAngle: Math.PI,
          },
        });

        el = page.getByTestId('arc-track');
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
        }
      });

      // TODO: Implement this test
      // IT PASSES WITH ANY CORNER RADIUS, NOT SURE HOW TO TEST THIS
      // it('should support track corner radius', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       track: { class: 'fill-none stroke-surface-content/10', dataTestId: 'arc-track' },
      //       trackCornerRadius: 10,
      //     },
      //   });

      //   el = page.getByTestId('arc-track');
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z');
      //   }
      // });

      //-------------------------------------------------------------------------
      // INTERACTIONS TESTS
      //-------------------------------------------------------------------------

      it('should handle pointer enter events', async () => {
        const onPointerEnter = vi.fn();
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
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
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
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
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
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

      it('should apply fill color', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            fill: 'red',
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toHaveAttribute('fill', 'red');
      });

      it('should apply opacity', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            opacity: 0.5,
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        await expect.element(el).toHaveAttribute('opacity', '0.5');
      });

      it('should apply fillOpacity', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            fillOpacity: 0.7,
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        await expect.element(el).toHaveAttribute('fill-opacity', '0.7');
      });

      it('should apply custom class', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            class: 'custom-arc-class',
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        await expect.element(el).toHaveClass('custom-arc-class');
      });

      // TODO:
      // PASSES WITH ANY OUTER RADIUS, NOT SURE HOW TO TEST THIS
      // it('should calculate outerRadius from discrete value (>= 1)', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       outerRadius: 80,
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-80A80,80,0,1,1,0,80A80,80,0,1,1,0,-80Z');
      //   }
      // });

      // it('should calculate outerRadius from percentage (0 < value < 1)', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       outerRadius: 0.8,
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-80A80,80,0,1,1,0,80A80,80,0,1,1,0,-80Z');
      //   }
      // });

      // it('should calculate outerRadius from offset (< 0)', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       outerRadius: -10,
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-10A10,10,0,1,0,0,10A10,10,0,1,0,0,-10Z');
      //   }
      // });

      // it('should calculate innerRadius from discrete value (>= 1)', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       innerRadius: 30,
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-30A30,30,0,1,0,0,30A30,30,0,1,0,0,-30Z');
      //   }
      // });

      // it('should calculate innerRadius from percentage (0 < value < 1)', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       innerRadius: 0.5,
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-30A30,30,0,1,0,0,30A30,30,0,1,0,0,-30Z');
      //   }
      // });

      // it('should calculate innerRadius from offset (< 0)', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       innerRadius: -20,
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-30A30,30,0,1,0,0,30A30,30,0,1,0,0,-30Z');
      //   }
      // });

      // it('should use startAngle and endAngle in radians', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       startAngle: 0,
      //       endAngle: Math.PI / 2,
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z');
      //   }
      // });

      it('should convert range degrees to radians', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            range: [0, 180] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,0,1,100,0L0,0Z');
        }
      });

      it('should scale value to angle based on domain and range', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            domain: [0, 100] as [number, number],
            range: [0, 360] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
        }
      });

      it('should handle custom start angle in range', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            range: [90, 270] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M100,0A100,100,0,0,1,0,100L0,0Z');
        }
      });

      it('should apply offset to arc position', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            offset: 10,
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const transform = el.element()?.getAttribute('transform');
          expect(transform).toContain('translate(9.84807753012208, 1.736481776669303)');
        }
      });

      it('should apply zero offset by default', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const transform = el.element()?.getAttribute('transform');
          expect(transform).toBe('translate(0, 0)');
        }
      });

      // ------------------------------------------------------------
      // Edge Cases
      // ------------------------------------------------------------

      it('should handle value of 0', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 0,
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100L0,0Z');
        }
      });

      it('should handle value at max domain', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 100,
            domain: [0, 100] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z');
        }
      });

      it('should handle negative domain values', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 0,
            domain: [-50, 50] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
        }
      });

      it('should handle innerRadius of 0 (pie slice)', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
            innerRadius: 0,
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
        }
      });

      it('should handle full circle (360 degree range)', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 100,
            domain: [0, 100] as [number, number],
            range: [0, 360] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z');
        }
      });

      it('should handle partial arc (e.g., 180 degrees)', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 100,
            domain: [0, 100] as [number, number],
            range: [0, 180] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
        }
      });

      it('should handle value exceeding domain max', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 150,
            domain: [0, 100] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z');
        }
      });

      it('should handle value below domain min', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: -10,
            domain: [0, 100] as [number, number],
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        if (layer === 'svg') {
          const d = el.element()?.getAttribute('d');
          expect(d).toBe('M0,-100A100,100,0,0,0,-58.779,-80.902L0,0Z');
        }
      });

      // TODO
      // not sure how to test this, check before motion applied?
      // it('should start at initialValue', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       motion: { type: 'tween', duration: 300 },
      //       value: 100,
      //       initialValue: 0,
      //     },
      //   });

      //   // Initially should render (motion will animate from initialValue to value)
      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-100L0,0Z');
      //   }
      // });

      // TODO
      // not sure how to test this
      // it('should accept spring motion config', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       motion: { type: 'spring', stiffness: 100, damping: 10 },
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('MM0,-100A100,100,0,1,1,0,100L0,0Z');
      //   }
      // });

      // TODO
      // not sure how to test this
      // it('should accept tween motion config', async () => {
      //   render(ChartHarness, {
      //     layer,
      //     component: TestComponent,
      //     componentProps: {
      //       value: 50,
      //       motion: { type: 'tween', duration: 300 },
      //     },
      //   });

      //   const el = page.getByTestId(componentTestId);
      //   await expect.element(el).toBeInTheDocument();
      //   if (layer === 'svg') {
      //     const d = el.element()?.getAttribute('d');
      //     expect(d).toBe('M0,-100A100,100,0,1,1,0,100L0,0Z');
      //   }
      // });

      it('should have stroke="none" by default', async () => {
        render(ChartHarness, {
          layer,
          component: TestComponent,
          componentProps: {
            value: 50,
          },
        });

        const el = page.getByTestId(componentTestId);
        await expect.element(el).toBeInTheDocument();
        await expect.element(el).toHaveAttribute('stroke', 'none');
      });
    });
  });
}
