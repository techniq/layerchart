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
  import { cls } from '@layerstack/tailwind';
  import { contours as d3Contours } from 'd3-contour';
  import { geoPath, geoTransform } from 'd3-geo';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';
  import { max, min } from 'd3-array';

  import Group from './Group.svelte';
  import Path from './Path.svelte';
  import { accessor as resolveAccessor, chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import {
    blurGridIgnoringNaN,
    gridCellCenterToBounds,
    gridPointToBounds,
    resolveRasterBounds,
  } from '$lib/utils/index.js';
  import { interpolateGrid } from '$lib/utils/rasterInterpolate.js';

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
    thresholds = 10,
    blur: blurRadius = 0,
    smooth = true,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    ...restProps
  }: ContourProps = $props();

  // Detect grid mode: data + width/height
  const isGridMode = $derived(!!(dataProp && widthProp && heightProp));
  const hasExplicitBounds = $derived(
    x1Prop !== undefined || y1Prop !== undefined || x2Prop !== undefined || y2Prop !== undefined
  );
  const gridBounds = $derived(
    resolveRasterBounds(widthProp ?? 0, heightProp ?? 0, x1Prop, y1Prop, x2Prop, y2Prop)
  );

  // Register as composite-mark with markInfo for grid mode domain participation
  ctx.registerComponent({
    name: 'Contour',
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

  // Grid dimensions: use provided, or derive from chart size
  const gridW = $derived(widthProp ?? Math.min(Math.ceil(ctx.width), 200));
  const gridH = $derived(heightProp ?? Math.min(Math.ceil(ctx.height), 200));

  // Scale factors from grid coordinates to chart pixel coordinates
  const scaleX = $derived(ctx.width / gridW);
  const scaleY = $derived(ctx.height / gridH);
  const contourScaleX = $derived(gridW / ctx.width);
  const contourScaleY = $derived(gridH / ctx.height);
  const useProjectedGridSampling = $derived(!!(geo.projection && isGridMode && hasExplicitBounds));

  // Resolve grid values from one of three input modes
  const gridValues = $derived.by(() => {
    if (!ctx.width || !ctx.height) return new Float64Array(0);

    // Mode 1: Grid data (flat array + width/height)
    if (isGridMode) {
      return dataProp instanceof Float64Array ? dataProp : Float64Array.from(dataProp as number[]);
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
        const value = gridValues[row * widthProp + column];
        if (!Number.isFinite(value)) continue;

        const point = gridCellCenterToBounds(column, row, widthProp, heightProp, gridBounds);
        const projected = geo.projection([point.x, point.y]);
        if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1]))
          continue;

        points.push([projected[0] * contourScaleX, projected[1] * contourScaleY, value]);
      }
    }

    return points;
  });

  const contourGridValues = $derived.by(() => {
    if (useProjectedGridSampling) {
      return interpolateGrid(projectedGridPoints, gridW, gridH, interpolateMethod);
    }

    return gridValues;
  });

  // Apply optional blur
  const blurredValues = $derived.by(() => {
    if (!blurRadius || contourGridValues.length === 0) return contourGridValues;
    return blurGridIgnoringNaN(contourGridValues, gridW, gridH, blurRadius);
  });

  // Run d3 contour generator
  const contourData = $derived.by(() => {
    if (blurredValues.length === 0) return [];
    const generator = d3Contours().size([gridW, gridH]).smooth(smooth);
    generator.thresholds(thresholds);
    return generator(Array.from(blurredValues));
  });

  // Path generator that maps contour geometry into either data or geo space.
  const pathGenerator = $derived.by(() => {
    if (useProjectedGridSampling) {
      return geoPath(
        geoTransform({
          point(x, y) {
            this.stream.point(x * scaleX, y * scaleY);
          },
        })
      );
    }

    if (isGridMode && hasExplicitBounds) {
      return geoPath(
        geoTransform({
          point(x, y) {
            const point = gridPointToBounds(x, y, gridW, gridH, gridBounds);
            this.stream.point(ctx.xScale(point.x), ctx.yScale(point.y));
          },
        })
      );
    }

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
      const scale = ctx.cScale.copy();
      return ctx.props.cDomain ? scale : scale.domain([minValue, maxValue]);
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
        class={cls('lc-contour-band', className)}
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
