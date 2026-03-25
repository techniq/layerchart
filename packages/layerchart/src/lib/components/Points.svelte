<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';

  export type Point = {
    x: number;
    y: number;
    r: number;
    xValue: any;
    yValue: any;
    data: any;
    /** Index within array accessor (0 = start/low edge, 1 = end/high edge). Undefined for single-value points. */
    edgeIndex?: number;
  };
  type Offset = number | ((value: number, context: any) => number) | undefined;

  export type PointsPropsWithoutHTML = {
    /**
     * Override data instead of using context
     */
    data?: any;

    /**
     * Override `x` accessor from Chart context
     */
    x?: Accessor;
    /**
     *  Override `y` accessor from Chart context
     */
    y?: Accessor;

    /**
     * Series key to use for accessor. Only applicable if `<Chart>` uses `series` and `x`/`y` are not set.
     */
    seriesKey?: string;

    /**
     * Override `r` accessor from Chart context
     *
     * @default 5
     */
    r?: number;

    /**
     * The offset of the point in the x direction
     */
    offsetX?: Offset;

    /**
     * The offset of the point in the y direction
     */
    offsetY?: Offset;

    children?: Snippet<[{ points: Point[] }]>;
  } & CommonStyleProps;

  export type PointsProps = PointsPropsWithoutHTML &
    Omit<Without<CircleProps, PointsPropsWithoutHTML>, 'ref'>;
</script>

<script lang="ts">
  import { pointRadial } from 'd3-shape';

  import Circle, { type CircleProps } from './Circle.svelte';
  import { isScaleBand, type AnyScale } from '../utils/scales.svelte.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const ctx = getChartContext();

  let {
    data,
    x,
    y,
    seriesKey,
    r = 5,
    offsetX,
    offsetY,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    children,
    ...restProps
  }: PointsProps = $props();

  ctx.registerComponentNode({
    name: 'Points',
    kind: 'mark',
    markInfo: () => ({ data, x, y, seriesKey, color: (fill ?? stroke) as string | undefined }),
  });

  let series = $derived(ctx.series.series.find((s) => s.key === seriesKey));
  let seriesAccessor = $derived(series?.value ?? (series?.data ? undefined : series?.key));

  // Get stack accessors if seriesKey is provided and stacking is enabled
  let stackAccessors = $derived(
    seriesKey && ctx.series.isStacked ? ctx.series.getStackAccessors(seriesKey) : null
  );

  function getOffset(value: any, offset: Offset, scale: AnyScale, subScale?: AnyScale) {
    if (typeof offset === 'function') {
      return offset(value, ctx);
    } else if (offset != null) {
      return offset;
    } else if (subScale && seriesKey) {
      // Center within grouped sub-band (replaces main band centering)
      return subScale(seriesKey) + (subScale.bandwidth?.() ?? 0) / 2;
    } else if (isScaleBand(scale) && !ctx.radial) {
      return scale.bandwidth() / 2;
    } else {
      return 0;
    }
  }

  const xAccessor = $derived(
    accessor(x ?? (ctx.valueAxis === 'x' ? seriesAccessor : undefined) ?? ctx.x)
  );

  // Use stack y1 accessor when stacking is enabled, otherwise fall back to series accessor or context
  const yAccessor = $derived(
    y
      ? accessor(y)
      : stackAccessors
        ? stackAccessors.y1
        : Array.isArray(seriesAccessor) && ctx.valueAxis === 'y'
          ? accessor(seriesAccessor[1])
          : accessor((ctx.valueAxis === 'y' ? seriesAccessor : undefined) ?? ctx.y)
  );
  const pointsData = $derived(data ?? series?.data ?? ctx.data);

  // Pre-calculate common values to avoid redundant calculations
  const getPointObject = (xVal: number, yVal: number, d: any, edgeIndex?: number): Point => {
    // Only calculate these scaled values once per point
    const scaledX: number = ctx.xScale(xVal);
    const scaledY: number = ctx.yScale(yVal);

    const x = scaledX + getOffset(scaledX, offsetX, ctx.xScale, ctx.x1Scale);
    const y = scaledY + getOffset(scaledY, offsetY, ctx.yScale, ctx.y1Scale);

    const radialPoint = pointRadial(x, y);

    return {
      x: ctx.radial ? radialPoint[0] : x,
      y: ctx.radial ? radialPoint[1] : y,
      r: ctx.config.r ? ctx.rGet(d) : r,
      xValue: xVal,
      yValue: yVal,
      data: d,
      edgeIndex,
    };
  };

  const points = $derived(
    pointsData.flatMap((d: any) => {
      const xValue: number | number[] = xAccessor(d);
      const yValue: number | number[] = yAccessor(d);

      if (Array.isArray(xValue)) {
        return xValue
          .filter(Boolean)
          .map((xVal: number, i: number) => getPointObject(xVal, yValue as number, d, i));
      } else if (Array.isArray(yValue)) {
        return yValue
          .filter(Boolean)
          .map((yVal: number, i: number) => getPointObject(xValue, yVal, d, i));
      } else if (xValue != null && yValue != null) {
        return getPointObject(xValue as number, yValue as number, d);
      }

      return [];
    }) as Point[]
  );
</script>

{#if children}
  {@render children({ points })}
{:else}
  {#each points as point}
    <Circle
      cx={point.x}
      cy={point.y}
      r={point.r}
      fill={fill ?? series?.color ?? (ctx.config.c ? ctx.cGet(point.data) : null)}
      {fillOpacity}
      {stroke}
      {strokeWidth}
      opacity={opacity ??
        (series?.key == null ||
        ctx.series.visibleSeries.length <= 1 ||
        ctx.series.isHighlighted(series.key, true)
          ? 1
          : 0.1)}
      {...series?.props}
      {...extractLayerProps(restProps, 'lc-point')}
    />
  {/each}
{/if}
