<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';

  export type Point = { x: number; y: number; r: number; xValue: any; yValue: any; data: any };
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

  function getOffset(value: any, offset: Offset, scale: AnyScale) {
    if (typeof offset === 'function') {
      return offset(value, ctx);
    } else if (offset != null) {
      return offset;
    } else if (isScaleBand(scale) && !ctx.radial) {
      return scale.bandwidth() / 2;
    } else {
      return 0;
    }
  }

  const xAccessor = $derived(x ? accessor(x) : ctx.x);
  const yAccessor = $derived(y ? accessor(y) : ctx.y);
  const pointsData = $derived(data ?? ctx.data);

  // Pre-calculate common values to avoid redundant calculations
  const getPointObject = (xVal: number, yVal: number, d: any): Point => {
    // Only calculate these scaled values once per point
    const scaledX: number = ctx.xScale(xVal);
    const scaledY: number = ctx.yScale(yVal);

    const x = scaledX + getOffset(scaledX, offsetX, ctx.xScale);
    const y = scaledY + getOffset(scaledY, offsetY, ctx.yScale);

    const radialPoint = pointRadial(x, y);

    return {
      x: ctx.radial ? radialPoint[0] : x,
      y: ctx.radial ? radialPoint[1] : y,
      r: ctx.config.r ? ctx.rGet(d) : r,
      xValue: xVal,
      yValue: yVal,
      data: d,
    };
  };

  const points = $derived(
    pointsData.flatMap((d: any) => {
      const xValue: number | number[] = xAccessor(d);
      const yValue: number | number[] = yAccessor(d);

      if (Array.isArray(xValue)) {
        return xValue
          .filter(Boolean)
          .map((xVal: number) => getPointObject(xVal, yValue as number, d));
      } else if (Array.isArray(yValue)) {
        return yValue.filter(Boolean).map((yVal: number) => getPointObject(xValue, yVal, d));
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
      fill={fill ?? (ctx.config.c ? ctx.cGet(point.data) : null)}
      {fillOpacity}
      {stroke}
      {strokeWidth}
      {opacity}
      {...extractLayerProps(restProps, 'lc-point')}
    />
  {/each}
{/if}
