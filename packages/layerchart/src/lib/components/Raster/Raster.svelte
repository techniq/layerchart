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

    /** Left bound of the raster in data coordinates. Defaults to `0` in grid mode. */
    x1?: number;
    /** Top bound of the raster in data coordinates. Defaults to `0` in grid mode. */
    y1?: number;
    /** Right bound of the raster in data coordinates. Defaults to `width` in grid mode. */
    x2?: number;
    /** Bottom bound of the raster in data coordinates. Defaults to `height` in grid mode. */
    y2?: number;

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
  import { max, min } from 'd3-array';
  import { rgb } from 'd3-color';

  import { accessor as resolveAccessor, chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { gridCellCenterToBounds, resolveRasterBounds } from '$lib/utils/index.js';
  import { interpolateGrid } from '$lib/utils/rasterInterpolate.js';
  import Image from '../Image/Image.svelte';

  const ctx = getChartContext();
  const geo = getGeoContext();

  let {
    data: dataProp,
    width: widthProp,
    height: heightProp,
    x1: x1Prop,
    y1: y1Prop,
    x2: x2Prop,
    y2: y2Prop,
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
  const hasExplicitBounds = $derived(
    x1Prop !== undefined || y1Prop !== undefined || x2Prop !== undefined || y2Prop !== undefined
  );
  const gridBounds = $derived(
    resolveRasterBounds(widthProp ?? 0, heightProp ?? 0, x1Prop, y1Prop, x2Prop, y2Prop)
  );
  const useProjectedGridSampling = $derived(
    !!(geo.projection && geo.projection.invert && isGridMode && hasExplicitBounds)
  );

  // Register as composite-mark with markInfo for grid mode domain participation
  ctx.registerComponent({
    name: 'Raster',
    kind: 'composite-mark',
    markInfo: () => {
      if (!isGridMode) return {};
      return {
        data: [
          { x: gridBounds.x1, y: gridBounds.y1 },
          { x: gridBounds.x2, y: gridBounds.y2 },
        ],
        x: 'x',
        y: 'y',
      };
    },
  });

  // Grid dimensions (accounting for pixelSize downsampling)
  const gridW = $derived(widthProp ?? Math.max(1, Math.ceil(ctx.width / pixelSize)));
  const gridH = $derived(heightProp ?? Math.max(1, Math.ceil(ctx.height / pixelSize)));

  // Scale factors from grid to chart pixel coordinates
  const scaleX = $derived(ctx.width / gridW);
  const scaleY = $derived(ctx.height / gridH);

  const rasterScaleX = $derived(gridW / ctx.width);
  const rasterScaleY = $derived(gridH / ctx.height);

  // Resolve grid values
  const sourceGridValues = $derived.by(() => {
    if (!ctx.width || !ctx.height) return new Float64Array(0);

    // Mode 1: Grid data (flat array + width/height)
    if (isGridMode) {
      return dataProp instanceof Float64Array ? dataProp : Float64Array.from(dataProp as number[]);
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
    const valAcc = resolveAccessor((valueProp ?? 'value') as Accessor);

    const points: [number, number, number][] = chartData.map((d: any) => [
      ctx.xScale(xAcc(d)) / scaleX,
      ctx.yScale(yAcc(d)) / scaleY,
      valAcc(d),
    ]);

    return interpolateGrid(points, gridW, gridH, interpolateMethod);
  });

  const projectedGridPoints = $derived.by(() => {
    if (!useProjectedGridSampling || !widthProp || !heightProp || !geo.projection) return [];

    const points: [number, number, number][] = [];
    for (let row = 0; row < heightProp; row++) {
      for (let column = 0; column < widthProp; column++) {
        const value = sourceGridValues[row * widthProp + column];
        if (!Number.isFinite(value)) continue;

        const point = gridCellCenterToBounds(column, row, widthProp, heightProp, gridBounds);
        const projected = geo.projection([point.x, point.y]);
        if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1]))
          continue;

        points.push([projected[0] * rasterScaleX, projected[1] * rasterScaleY, value]);
      }
    }

    return points;
  });

  const rasterValues = $derived.by(() => {
    if (useProjectedGridSampling) {
      return interpolateGrid(projectedGridPoints, gridW, gridH, interpolateMethod);
    }

    return sourceGridValues;
  });

  // Color scale: use chart's cScale (with auto-computed domain) or fall back to default
  const colorScale = $derived.by(() => {
    const validValues = rasterValues.filter((v) => !isNaN(v));
    const minValue = min(validValues) ?? 0;
    const maxValue = max(validValues) ?? 1;
    if (ctx.cScale) {
      const scale = ctx.cScale.copy();
      return ctx.props.cDomain ? scale : scale.domain([minValue, maxValue]);
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

  const imagePlacement = $derived.by(() => {
    if (useProjectedGridSampling) {
      return {
        x: ctx.width / 2,
        y: ctx.height / 2,
        width: ctx.width,
        height: ctx.height,
      };
    }

    if (isGridMode && hasExplicitBounds) {
      const x1 = ctx.xScale(gridBounds.x1);
      const x2 = ctx.xScale(gridBounds.x2);
      const y1 = ctx.yScale(gridBounds.y1);
      const y2 = ctx.yScale(gridBounds.y2);

      return {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };
    }

    return {
      x: ctx.width / 2,
      y: ctx.height / 2,
      width: ctx.width,
      height: ctx.height,
    };
  });

  // Generate image data URL via offscreen canvas
  const imageDataUrl = $derived.by(() => {
    if (typeof document === 'undefined') return '';
    if (rasterValues.length === 0 || gridW <= 0 || gridH <= 0) return '';

    const [minValue, maxValue] = colorScale.domain();
    const range = maxValue - minValue || 1;

    const canvas = document.createElement('canvas');

    canvas.width = gridW;
    canvas.height = gridH;
    const canvasCtx = canvas.getContext('2d')!;
    const imageData = canvasCtx.createImageData(gridW, gridH);
    const pixels = imageData.data;

    for (let i = 0; i < rasterValues.length; i++) {
      const v = rasterValues[i];
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

    if (blurRadius > 0) {
      const blurredCanvas = document.createElement('canvas');
      blurredCanvas.width = gridW;
      blurredCanvas.height = gridH;
      const blurredCtx = blurredCanvas.getContext('2d')!;
      blurredCtx.filter = `blur(${blurRadius}px)`;
      blurredCtx.drawImage(canvas, 0, 0);
      return blurredCanvas.toDataURL();
    }

    return canvas.toDataURL();
  });
</script>

{#if imageDataUrl}
  <Image
    href={imageDataUrl}
    x={imagePlacement.x}
    y={imagePlacement.y}
    width={imagePlacement.width}
    height={imagePlacement.height}
    {imageRendering}
    {opacity}
    preserveAspectRatio="none"
    class={cls('lc-raster', className)}
  />
{/if}
