<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Accessor } from '$lib/utils/common.js';
  import type { InterpolateMethod } from '$lib/utils/rasterInterpolate.js';

  export type ContourPropsWithoutHTML = {
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

    /** Number of contour thresholds or explicit threshold values. @default 10 */
    thresholds?: number | number[];
    /** Gaussian blur radius applied to grid values. @default 0 */
    blur?: number;
    /** Whether to smooth contour lines. @default true */
    smooth?: boolean;
  } & CommonStyleProps;

  export type ContourProps = ContourPropsWithoutHTML &
    Without<SVGAttributes<SVGGElement>, ContourPropsWithoutHTML>;
</script>

<script lang="ts">
  import { contours as d3Contours } from 'd3-contour';
  import { geoPath, geoTransform } from 'd3-geo';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';
  import { max, min, blur2 } from 'd3-array';

  import Group from './Group.svelte';
  import Path from './Path.svelte';
  import { accessor as resolveAccessor, chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { interpolateGrid } from '$lib/utils/rasterInterpolate.js';

  const ctx = getChartContext();

  let {
    data: dataProp,
    width: widthProp,
    height: heightProp,
    value: valueProp,
    x: xProp,
    y: yProp,
    interpolate: interpolateMethod = 'barycentric',
    thresholds = 10,
    blur: blurRadius = 0,
    smooth = true,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
  }: ContourProps = $props();

  // Detect grid mode: data + width/height
  const isGridMode = $derived(!!(dataProp && widthProp && heightProp));

  // Register as composite-mark with markInfo for grid mode domain participation
  ctx.registerComponentNode({
    name: 'Contour',
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

  // Grid dimensions: use provided, or derive from chart size
  const gridW = $derived(widthProp ?? Math.min(Math.ceil(ctx.width), 200));
  const gridH = $derived(heightProp ?? Math.min(Math.ceil(ctx.height), 200));

  // Scale factors from grid coordinates to chart pixel coordinates
  const scaleX = $derived(ctx.width / gridW);
  const scaleY = $derived(ctx.height / gridH);

  // Resolve grid values from one of three input modes
  const gridValues = $derived.by(() => {
    if (!ctx.width || !ctx.height) return new Float64Array(0);

    // Mode 1: Grid data (flat array + width/height)
    if (isGridMode) {
      return dataProp instanceof Float64Array
        ? dataProp
        : Float64Array.from(dataProp as number[]);
    }

    // Mode 2: Continuous function — evaluate at each grid cell
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

    // Mode 3: Scattered data — interpolate onto grid
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

  // Run d3 contour generator
  const contourData = $derived.by(() => {
    if (blurredValues.length === 0) return [];
    const generator = d3Contours().size([gridW, gridH]).smooth(smooth);
    generator.thresholds(thresholds);
    return generator(Array.from(blurredValues));
  });

  // Path generator that scales from grid to chart pixel coordinates
  const pathGenerator = $derived.by(() => {
    if (scaleX === 1 && scaleY === 1) return geoPath();
    return geoPath(
      geoTransform({
        point(x, y) {
          this.stream.point(x * scaleX, y * scaleY);
        },
      })
    );
  });

  // Color scale: use chart's cScale (with auto-computed domain) or fall back to default
  const colorScale = $derived.by(() => {
    if (fill) return null;
    const minValue = min(contourData, (d) => d.value) ?? 0;
    const maxValue = max(contourData, (d) => d.value) ?? 1;
    if (ctx.cScale) {
      return ctx.cScale.copy().domain([minValue, maxValue]);
    }
    return scaleSequential([minValue, maxValue], interpolateYlGnBu);
  });

  function getContourFill(contour: { value: number }) {
    if (fill) return fill;
    return colorScale ? String(colorScale(contour.value)) : 'steelblue';
  }
</script>

{#if contourData.length > 0}
  <Group class="lc-contour" {opacity}>
    {#each contourData as contour, i (i)}
      <Path
        pathData={pathGenerator(contour) ?? ''}
        fill={getContourFill(contour)}
        {fillOpacity}
        {stroke}
        {strokeWidth}
        class="lc-contour-band"
      />
    {/each}
  </Group>
{/if}

<style>
  @layer components {
    :global(:where(.lc-contour-band)) {
      --stroke-color: none;
    }
  }
</style>
