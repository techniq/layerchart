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
  /** Width of the output image in pixels. */
  width: number;
  /** Height of the output image in pixels. */
  height: number;
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

/**
 * Create a capture callback for use with `render()` from `svelte/server`.
 * Pass the returned `onCapture` as the `_onCapture` prop to your chart component.
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
 * const rendered = render(MyChart, { props: { data, width: 800, height: 400, _onCapture: onCapture } });
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
 * Render a captured chart component tree to an image buffer.
 * Call this after `render()` from `svelte/server` has been used to build
 * the component tree with a capture callback.
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
 * const rendered = render(MyChart, { props: { data, width: 800, height: 400, _onCapture: onCapture } });
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
  options: RenderOptions
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
