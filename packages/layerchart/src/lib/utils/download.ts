/**
 * SVG presentation and style properties that need to be inlined
 * to ensure correct rendering when the SVG is exported as an image
 * (CSS variables and class-based styles won't be available outside the DOM).
 */
const SVG_STYLE_PROPERTIES = [
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'opacity',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'text-anchor',
  'dominant-baseline',
  'alignment-baseline',
  'visibility',
  'display',
  // `<Text>` wraps each label in a nested `<svg class="lc-text-svg">` that
  // relies on `overflow: visible` so labels can render outside the wrapper
  // (axis ticks positioned at negative x). Without this inlined, the
  // rasteriser falls back to the spec default `overflow: hidden` and clips
  // the labels.
  'overflow',
  'paint-order',
  'shape-rendering',
  'text-rendering',
  'letter-spacing',
  'word-spacing',
] as const;

/**
 * Clone an SVG element and inline all computed styles so the exported image
 * renders correctly without access to the page's stylesheets or CSS variables.
 */
function inlineSvgStyles(svg: SVGSVGElement): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originalElements = Array.from(svg.querySelectorAll('*'));
  const clonedElements = Array.from(clone.querySelectorAll('*'));

  for (let i = 0; i < originalElements.length; i++) {
    const original = originalElements[i];
    const cloneEl = clonedElements[i];
    if (!(cloneEl instanceof SVGElement)) continue;

    const computed = window.getComputedStyle(original);
    for (const prop of SVG_STYLE_PROPERTIES) {
      const value = computed.getPropertyValue(prop);
      if (value) {
        cloneEl.style.setProperty(prop, value);
      }
    }
  }

  return clone;
}

/**
 * Draw an SVG element onto a canvas context at the given pixel dimensions.
 * Sets `viewBox` (if not authored) so the SVG content scales to fill the
 * destination size — without it, increasing the `width`/`height` attributes
 * leaves content at its original pixel coordinates and the result lands in
 * the top-left.
 */
function drawSvgToCanvas(
  svg: SVGSVGElement,
  ctx: CanvasRenderingContext2D,
  pixelWidth: number,
  pixelHeight: number,
  cssWidth: number,
  cssHeight: number
): Promise<void> {
  const inlined = inlineSvgStyles(svg);
  if (!inlined.getAttribute('viewBox')) {
    inlined.setAttribute('viewBox', `0 0 ${cssWidth} ${cssHeight}`);
  }
  inlined.setAttribute('width', String(pixelWidth));
  inlined.setAttribute('height', String(pixelHeight));

  const svgStr = new XMLSerializer().serializeToString(inlined);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, pixelWidth, pixelHeight);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export type ChartImageOptions = {
  /**
   * Background fill color for the exported image.
   * Defaults to transparent (PNG) or white (JPEG/WebP).
   */
  background?: string;

  /**
   * Output image format.
   *
   * @default 'png'
   */
  format?: 'png' | 'jpeg' | 'webp';

  /**
   * Quality for lossy formats (`'jpeg'` / `'webp'`), between 0 and 1.
   *
   * @default 0.92
   */
  quality?: number;

  /**
   * Device pixel ratio to use when rasterising the image. Defaults to `1`
   * so the output matches the chart's CSS dimensions (looks the same as
   * what's on the page when viewed 1:1). Set to `window.devicePixelRatio`
   * (or higher) to produce crisper images on retina displays at the cost
   * of larger files.
   */
  pixelRatio?: number;
};

/**
 * Composite all SVG and Canvas layers within a chart container element into
 * an offscreen canvas and return the result as a `Blob`.
 *
 * Layers are drawn in ascending z-index order (DOM order used as tiebreaker).
 * SVG layer styles (CSS variables, class-based colours, etc.) are inlined
 * before serialisation so the image renders correctly outside the DOM.
 */
export async function getChartImageBlob(
  container: HTMLElement,
  options: ChartImageOptions = {}
): Promise<Blob> {
  const { background, format = 'png', quality = 0.92 } = options;
  // Default to 1 so PNGs match the chart's on-page size; pass
  // `pixelRatio: window.devicePixelRatio` (or higher) for retina-sharp output.
  const dpr = options.pixelRatio ?? 1;

  // Find all SVG and Canvas layers within the container, sorted by z-index.
  // The class-name selector implicitly excludes `.lc-hit-canvas`.
  const layers = Array.from(
    container.querySelectorAll<SVGSVGElement | HTMLCanvasElement>(
      '.lc-layout-svg, .lc-layout-canvas'
    )
  ).sort((a, b) => {
    const aZ = parseFloat(window.getComputedStyle(a).zIndex) || 0;
    const bZ = parseFloat(window.getComputedStyle(b).zIndex) || 0;
    return aZ - bZ;
  });

  // Size the output to the chart layers (all share the same bounds) rather
  // than the wrapping container, so padding/margin doesn't leave blank
  // space on the right/bottom of the image.
  const layerRect = layers[0]?.getBoundingClientRect();
  const cssWidth = layerRect?.width || container.clientWidth;
  const cssHeight = layerRect?.height || container.clientHeight;
  const pixelWidth = Math.round(cssWidth * dpr);
  const pixelHeight = Math.round(cssHeight * dpr);

  const offscreen = document.createElement('canvas');
  offscreen.width = pixelWidth;
  offscreen.height = pixelHeight;
  const ctx = offscreen.getContext('2d')!;

  // Default white background for lossy formats that don't support transparency
  const bg = background ?? (format !== 'png' ? 'white' : undefined);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);
  }

  for (const layer of layers) {
    if (layer instanceof SVGElement) {
      await drawSvgToCanvas(
        layer as SVGSVGElement,
        ctx,
        pixelWidth,
        pixelHeight,
        cssWidth,
        cssHeight
      );
    } else if (layer instanceof HTMLCanvasElement) {
      // Canvas bitmaps are sized to `cssSize × window.devicePixelRatio`
      // (set by `scaleCanvas`). Map them to the requested output size so
      // the result matches `pixelRatio`.
      ctx.drawImage(layer, 0, 0, pixelWidth, pixelHeight);
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      `image/${format}`,
      quality
    );
  });
}

export type ChartSvgOptions = {
  /**
   * File name without extension.
   *
   * @default 'chart'
   */
  filename?: string;
};

/**
 * Collect and sort all `.lc-layout-svg` layers within a chart container by z-index,
 * preserving DOM order as a tiebreaker (Array.from + stable sort).
 */
function getSvgLayers(container: HTMLElement): SVGSVGElement[] {
  return Array.from(container.querySelectorAll<SVGSVGElement>('.lc-layout-svg')).sort((a, b) => {
    const aZ = parseFloat(window.getComputedStyle(a).zIndex) || 0;
    const bZ = parseFloat(window.getComputedStyle(b).zIndex) || 0;
    return aZ - bZ;
  });
}

/**
 * Return a self-contained SVG string for all SVG layers within a chart container.
 *
 * - Computed styles (CSS variables, class-based colours, etc.) are inlined so
 *   the file renders correctly in editors, browsers, and other tools.
 * - When multiple `<Svg>` layers are present they are composited into a single
 *   `<svg>` in z-index order by merging their `<defs>` and content `<g>` elements.
 * - Returns `null` when the container has no SVG layers (e.g. Canvas-only charts).
 */
export function getChartSvgString(container: HTMLElement): string | null {
  const layers = getSvgLayers(container);
  if (layers.length === 0) return null;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Single layer — inline styles, stamp dimensions, serialise.
  if (layers.length === 1) {
    const inlined = inlineSvgStyles(layers[0]);
    inlined.setAttribute('width', String(width));
    inlined.setAttribute('height', String(height));
    return new XMLSerializer().serializeToString(inlined);
  }

  // Multiple layers — composite into one <svg>.
  const ns = 'http://www.w3.org/2000/svg';
  const wrapper = document.createElementNS(ns, 'svg');
  wrapper.setAttribute('xmlns', ns);
  wrapper.setAttribute('width', String(width));
  wrapper.setAttribute('height', String(height));
  wrapper.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const combinedDefs = document.createElementNS(ns, 'defs');
  wrapper.appendChild(combinedDefs);

  for (const layer of layers) {
    const inlined = inlineSvgStyles(layer);

    // Collect <defs> children (gradients, clip paths, filters, etc.)
    for (const child of Array.from(inlined.querySelectorAll(':scope > defs > *'))) {
      combinedDefs.appendChild(child);
    }

    // Append the content <g> (carries the padding translate and any zoom transform)
    const contentG = inlined.querySelector('.lc-layout-svg-g');
    if (contentG) wrapper.appendChild(contentG);
  }

  return new XMLSerializer().serializeToString(wrapper);
}

/**
 * Download the SVG layers of a chart container as a `.svg` file.
 *
 * Canvas layers are not included — use `downloadImage` when the chart uses
 * `<Canvas>` layers or contains a mix of SVG and Canvas.
 *
 * Returns `false` without throwing if the container has no SVG layers.
 *
 * @example
 * ```svelte
 * <script>
 *   import { downloadSvg } from 'layerchart';
 *   let chartRef = $state<HTMLElement>();
 * </script>
 *
 * <Chart bind:ref={chartRef} ...>...</Chart>
 * <button onclick={() => downloadSvg(chartRef, { filename: 'my-chart' })}>
 *   Download SVG
 * </button>
 * ```
 */
export function downloadSvg(container: HTMLElement, options: ChartSvgOptions = {}): boolean {
  const { filename = 'chart' } = options;
  const svgStr = getChartSvgString(container);
  if (svgStr === null) return false;

  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/**
 * Download a chart container as an image file.
 *
 * @example
 * ```svelte
 * <script>
 *   import { downloadImage } from 'layerchart';
 *   let chartRef = $state<HTMLElement>();
 * </script>
 *
 * <Chart bind:ref={chartRef} ...>...</Chart>
 * <button onclick={() => downloadImage(chartRef, { filename: 'my-chart' })}>
 *   Download PNG
 * </button>
 * ```
 */
export async function downloadImage(
  container: HTMLElement,
  options: ChartImageOptions & {
    /**
     * File name without extension.
     *
     * @default 'chart'
     */
    filename?: string;
  } = {}
): Promise<void> {
  const { filename = 'chart', format = 'png', ...imageOptions } = options;
  const blob = await getChartImageBlob(container, { format, ...imageOptions });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${format}`;
  a.click();
  // Revoke after a short delay to ensure the browser has started the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
