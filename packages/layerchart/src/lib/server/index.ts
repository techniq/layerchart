import { render } from 'svelte/server';
import type { Component } from 'svelte';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { ComponentNode } from '$lib/states/chart.svelte.js';
import type { CaptureTarget } from './captureStore.js';
import { renderTree } from './renderTree.js';
export { renderTree } from './renderTree.js';
export { default as ServerChart } from './ServerChart.svelte';
export {
  getSSRCapture,
  setSSRCapture,
  type CaptureTarget,
  type SSRCapture,
} from './captureStore.js';

export type CapturedChart = {
  chartState: ChartState;
  rootNode: ComponentNode;
};

export type CanvasRenderContext = Omit<CanvasRenderingContext2D, 'drawFocusIfNeeded' | 'canvas'> & {
  canvas?: unknown;
};

export type CanvasFactory = (
  width: number,
  height: number
) => {
  getContext(type: '2d'): unknown;
  toBuffer(mimeType: string, ...args: any[]): Buffer | Uint8Array;
};

export type RenderOptions = {
  /** Pixel ratio for high-DPI output. @default 1 */
  devicePixelRatio?: number;
  /** Output format. @default 'png' */
  format?: 'png' | 'jpeg';
  /** JPEG quality (0-1). Only used when format is 'jpeg'. @default 0.92 */
  quality?: number;
  /**
   * Canvas factory function.
   *
   * Example with \@napi-rs/canvas:
   * ```ts
   * import { createCanvas } from '\@napi-rs/canvas';
   * createCanvas: (w, h) => createCanvas(w, h)
   * ```
   */
  createCanvas: CanvasFactory;
};

export type RenderChartOptions = RenderOptions & {
  /** Width of the output image in pixels. */
  width: number;
  /** Height of the output image in pixels. */
  height: number;
  /** Additional props to pass to the chart component. */
  props?: Record<string, any>;
};

/**
 * Create a capture callback for use with `render()` from `svelte/server`.
 * Pass the returned `onCapture` as the `onCapture` prop to your chart component.
 * After `render()` completes, call `getCapture()` to retrieve the chart state and
 * component tree.
 *
 * @example
 * ```ts
 * import { render } from 'svelte/server';
 * import { createCaptureCallback, renderCapturedChart } from 'layerchart/server';
 * import MyChart from './MyChart.svelte';
 *
 * const { onCapture, getCapture } = createCaptureCallback();
 * const rendered = render(MyChart, { props: { data, width: 800, height: 400, onCapture } });
 * rendered.body; // Force the SSR render to fully flush before reading capture state
 * const capture = getCapture();
 * ```
 */
export function createCaptureCallback() {
  let captured: CaptureTarget | null = null;
  return {
    onCapture: (data: CaptureTarget) => {
      captured = data;
    },
    getCapture: () => captured,
  };
}

/**
 * Render a chart component to an image buffer in a single call.
 *
 * This is a convenience function that handles SSR rendering, capture, and
 * canvas rendering in one step. The component should use `<ServerChart>`
 * internally and accept `width`, `height`, and `capture` props.
 *
 * @example
 * ```ts
 * import { createCanvas, Path2D } from '\@napi-rs/canvas';
 * import { renderChart } from 'layerchart/server';
 * import MyChart from './MyChart.svelte';
 *
 * // Register Path2D globally for canvas rendering
 * if (typeof globalThis.Path2D === 'undefined') (globalThis as any).Path2D = Path2D;
 *
 * const buffer = renderChart(MyChart, {
 *   width: 800,
 *   height: 400,
 *   props: { data: myData },
 *   createCanvas: (w, h) => createCanvas(w, h),
 * });
 *
 * // Use as a Response in a SvelteKit endpoint
 * return new Response(buffer, {
 *   headers: { 'Content-Type': 'image/png' }
 * });
 * ```
 */
export function renderChart(
  component: Component<any>,
  options: RenderChartOptions
): Buffer | Uint8Array {
  const { width, height, props = {}, ...renderOptions } = options;
  const captureTarget: CaptureTarget = {};

  // SSR render to build the component tree and capture chart state
  const rendered = render(component, {
    props: { ...props, width, height, capture: captureTarget }
  });
  // Force the SSR render to fully flush
  void rendered.body;

  if (!captureTarget.chartState || !captureTarget.rootNode) {
    throw new Error(
      'Failed to capture chart state. Ensure the component uses <ServerChart> with a `capture` prop.'
    );
  }

  return renderCapturedChart(captureTarget as CapturedChart, {
    width,
    height,
    ...renderOptions,
  });
}

/**
 * Render a captured chart component tree to an image buffer.
 * Call this after `render()` from `svelte/server` has been used to build
 * the component tree with a capture callback.
 *
 * For most use cases, prefer {@link renderChart} which handles the full pipeline.
 *
 * @example
 * ```ts
 * import { render } from 'svelte/server';
 * import { createCanvas, Path2D } from '\@napi-rs/canvas';
 * import { createCaptureCallback, renderCapturedChart } from 'layerchart/server';
 * import MyChart from './MyChart.svelte';
 *
 * // Register canvas globals
 * if (typeof globalThis.Path2D === 'undefined') (globalThis as any).Path2D = Path2D;
 *
 * // Build component tree via SSR render
 * const { onCapture, getCapture } = createCaptureCallback();
 * const rendered = render(MyChart, { props: { data, width: 800, height: 400, onCapture } });
 * rendered.body; // Force the SSR render to fully flush before reading capture state
 *
 * // Render to image
 * const buffer = renderCapturedChart(getCapture()!, {
 *   width: 800,
 *   height: 400,
 *   createCanvas: (w, h) => createCanvas(w, h),
 * });
 * ```
 */
export function renderCapturedChart(
  capture: CapturedChart,
  options: RenderOptions & { width: number; height: number }
): Buffer | Uint8Array {
  const {
    width,
    height,
    devicePixelRatio = 1,
    format = 'png',
    quality = 0.92,
    createCanvas,
  } = options;

  // Create canvas
  const canvasWidth = Math.round(width * devicePixelRatio);
  const canvasHeight = Math.round(height * devicePixelRatio);
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Apply DPI scaling
  if (devicePixelRatio !== 1) {
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  // Apply padding translation (mirrors what Canvas.svelte's update() does)
  if (capture.chartState) {
    const padding = capture.chartState.padding;
    if (padding) {
      ctx.translate(padding.left ?? 0, padding.top ?? 0);
    }
  }

  // Render the component tree onto the canvas
  renderTree(ctx as CanvasRenderingContext2D, capture.rootNode);

  // Export to buffer
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  if (format === 'jpeg') {
    return canvas.toBuffer(mimeType, quality);
  }
  return canvas.toBuffer(mimeType);
}
