<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Accessor } from '$lib/utils/common.js';
  import type { InterpolateMethod } from '$lib/utils/rasterInterpolate.js';

  export type RasterPropsWithoutHTML = {
    /**
     * Input data. Interpretation depends on other props:
     * - With `width`/`height`: flat array of grid values (row-major order)
     * - With `value` accessor: array of objects with x/y/value properties (scattered data)
     * - Without: uses chart context data for scattered interpolation
     */
    data?: number[] | Float64Array | any[];
    /** Grid width (columns). When set, `data` is treated as a flat grid array. */
    width?: number;
    /** Grid height (rows). When set, `data` is treated as a flat grid array. */
    height?: number;

    /**
     * Value channel. Interpretation depends on the type:
     * - `(x, y) => number`: continuous function evaluated at each pixel (function sampling mode)
     * - `string | number | (d) => any`: accessor for scattered data interpolation
     * @default 'value'
     */
    value?: Accessor | ((x: number, y: number) => number);

    /** X accessor for scattered data. Defaults to chart context. */
    x?: Accessor;
    /** Y accessor for scattered data. Defaults to chart context. */
    y?: Accessor;

    /** Interpolation method for scattered data. @default 'barycentric' */
    interpolate?: InterpolateMethod;

    /** Pixel size (downsampling factor). Higher = fewer pixels, faster. @default 1 */
    pixelSize?: number;
    /** Gaussian blur radius applied to grid values. @default 0 */
    blur?: number;

    /** Image rendering quality hint. @default 'auto' */
    imageRendering?: 'auto' | 'pixelated' | 'crisp-edges';
  } & Pick<CommonStyleProps, 'opacity'>;

  export type RasterProps = RasterPropsWithoutHTML &
    Without<SVGAttributes<SVGImageElement>, RasterPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';
  import { max, min, blur2 } from 'd3-array';
  import { rgb } from 'd3-color';

  import { accessor as resolveAccessor, chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { interpolateGrid } from '$lib/utils/rasterInterpolate.js';
  import Image from './Image.svelte';

  const ctx = getChartContext();

  let {
    data: dataProp,
    width: widthProp,
    height: heightProp,
    value: valueProp,
    x: xProp,
    y: yProp,
    interpolate: interpolateMethod = 'barycentric',
    pixelSize = 1,
    blur: blurRadius = 0,
    imageRendering = 'auto',
    opacity,
    class: className,
    ...restProps
  }: RasterProps = $props();

  // Detect grid mode: data + width/height
  const isGridMode = $derived(!!(dataProp && widthProp && heightProp));

  // Register as composite-mark with markInfo for grid mode domain participation
  ctx.registerComponentNode({
    name: 'Raster',
    kind: 'composite-mark',
    markInfo: () => {
      if (!isGridMode) return {};
      return {
        data: [
          { x: 0, y: 0 },
          { x: widthProp, y: heightProp },
        ],
        x: 'x',
        y: 'y',
      };
    },
  });

  // Grid dimensions (accounting for pixelSize downsampling)
  const gridW = $derived(
    widthProp ?? Math.max(1, Math.ceil(ctx.width / pixelSize))
  );
  const gridH = $derived(
    heightProp ?? Math.max(1, Math.ceil(ctx.height / pixelSize))
  );

  // Scale factors from grid to chart pixel coordinates
  const scaleX = $derived(ctx.width / gridW);
  const scaleY = $derived(ctx.height / gridH);

  // Resolve grid values
  const gridValues = $derived.by(() => {
    if (!ctx.width || !ctx.height) return new Float64Array(0);

    // Mode 1: Grid data (flat array + width/height)
    if (isGridMode) {
      return dataProp instanceof Float64Array
        ? dataProp
        : Float64Array.from(dataProp as number[]);
    }

    // Mode 2: Continuous function
    if (typeof valueProp === 'function' && valueProp.length >= 2) {
      const fn = valueProp as (x: number, y: number) => number;
      const grid = new Float64Array(gridW * gridH);
      const xInvert = ctx.xScale.invert;
      const yInvert = ctx.yScale.invert;
      for (let j = 0; j < gridH; j++) {
        for (let i = 0; i < gridW; i++) {
          const px = (i + 0.5) * scaleX;
          const py = (j + 0.5) * scaleY;
          const dataX = xInvert ? xInvert(px) : px;
          const dataY = yInvert ? yInvert(py) : py;
          grid[j * gridW + i] = fn(dataX, dataY);
        }
      }
      return grid;
    }

    // Mode 3: Scattered data
    const chartData = dataProp ? (dataProp as any[]) : chartDataArray(ctx.data);
    if (!chartData || chartData.length === 0) return new Float64Array(0);

    const xAcc = xProp ? resolveAccessor(xProp) : ctx.x;
    const yAcc = yProp ? resolveAccessor(yProp) : ctx.y;
    const valAcc = resolveAccessor(valueProp ?? 'value');

    const points: [number, number, number][] = chartData.map((d: any) => [
      ctx.xScale(xAcc(d)) / scaleX,
      ctx.yScale(yAcc(d)) / scaleY,
      valAcc(d),
    ]);

    return interpolateGrid(points, gridW, gridH, interpolateMethod);
  });

  // Apply optional blur
  const blurredValues = $derived.by(() => {
    if (!blurRadius || gridValues.length === 0) return gridValues;
    const copy = new Float64Array(gridValues);
    blur2({ data: copy, width: gridW, height: gridH }, blurRadius);
    return copy;
  });

  // Color scale: use chart's cScale (with auto-computed domain) or fall back to default
  const colorScale = $derived.by(() => {
    const validValues = blurredValues.filter((v) => !isNaN(v));
    const minValue = min(validValues) ?? 0;
    const maxValue = max(validValues) ?? 1;
    if (ctx.cScale) {
      return ctx.cScale.copy().domain([minValue, maxValue]);
    }
    return scaleSequential([minValue, maxValue], interpolateYlGnBu);
  });

  // Pre-compute color lookup table (256 entries) for fast pixel mapping
  const LUT_SIZE = 256;
  const colorLut = $derived.by(() => {
    const lut = new Uint8ClampedArray(LUT_SIZE * 4);
    for (let i = 0; i < LUT_SIZE; i++) {
      const t = i / (LUT_SIZE - 1);
      // Map through the color scale's domain
      const [lo, hi] = colorScale.domain();
      const value = lo + t * (hi - lo);
      const c = rgb(String(colorScale(value)));
      lut[i * 4] = c.r;
      lut[i * 4 + 1] = c.g;
      lut[i * 4 + 2] = c.b;
      lut[i * 4 + 3] = 255;
    }
    return lut;
  });

  // Generate image data URL via offscreen canvas
  const imageDataUrl = $derived.by(() => {
    if (typeof document === 'undefined') return '';
    if (blurredValues.length === 0 || gridW <= 0 || gridH <= 0) return '';

    const [minValue, maxValue] = colorScale.domain();
    const range = maxValue - minValue || 1;

    const canvas = document.createElement('canvas');
    canvas.width = gridW;
    canvas.height = gridH;
    const canvasCtx = canvas.getContext('2d')!;
    const imageData = canvasCtx.createImageData(gridW, gridH);
    const pixels = imageData.data;

    for (let i = 0; i < blurredValues.length; i++) {
      const v = blurredValues[i];
      const offset = i * 4;

      if (isNaN(v)) {
        pixels[offset] = 0;
        pixels[offset + 1] = 0;
        pixels[offset + 2] = 0;
        pixels[offset + 3] = 0;
        continue;
      }

      const t = Math.max(0, Math.min(1, (v - minValue) / range));
      const lutIndex = Math.round(t * (LUT_SIZE - 1));
      const lutOffset = lutIndex * 4;
      pixels[offset] = colorLut[lutOffset];
      pixels[offset + 1] = colorLut[lutOffset + 1];
      pixels[offset + 2] = colorLut[lutOffset + 2];
      pixels[offset + 3] = colorLut[lutOffset + 3];
    }

    canvasCtx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  });
</script>

{#if imageDataUrl}
  <Image
    href={imageDataUrl}
    x={ctx.width / 2}
    y={ctx.height / 2}
    width={ctx.width}
    height={ctx.height}
    {imageRendering}
    {opacity}
    preserveAspectRatio="none"
    class={cls('lc-raster', className)}
  />
{/if}
