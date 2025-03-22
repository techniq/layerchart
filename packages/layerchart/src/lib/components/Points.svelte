<script lang="ts" module>
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

    /**
     * Enable showing links between related points (array x/y accessors)
     *
     * @default false
     */
    links?: boolean | Partial<ComponentProps<typeof Link>>;

    children?: Snippet<[{ points: Point[] }]>;
  } & CommonStyleProps;

  export type PointsProps = PointsPropsWithoutHTML &
    Omit<Without<CircleProps, PointsPropsWithoutHTML>, 'ref'>;
</script>

<script lang="ts">
  import { type ComponentProps, type Snippet } from 'svelte';
  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';
  import { notNull } from '@layerstack/utils';

  import Circle, { type CircleProps } from './Circle.svelte';
  import Link from './Link.svelte';
  import { isScaleBand, type AnyScale } from '../utils/scales.svelte.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import { getChartContext } from './Chart.svelte';
  import { createDataAttr } from '$lib/utils/attributes.js';

  const ctx = getChartContext();

  let {
    data,
    x,
    y,
    r = 5,
    offsetX,
    offsetY,
    links = false,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
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

  const points = $derived(
    pointsData
      .flatMap((d: any) => {
        const xValue = xAccessor(d);
        const yValue = yAccessor(d);

        if (Array.isArray(xValue)) {
          /*
				x={["prop1" ,"prop2"]}
				y="prop3"
			*/
          return xValue.filter(notNull).map((xValue: number) => {
            return {
              x: ctx.xScale(xValue) + getOffset(ctx.xScale(xValue), offsetX, ctx.xScale),
              y: ctx.yScale(yValue) + getOffset(ctx.yScale(yValue), offsetY, ctx.yScale),
              r: ctx.config.r ? ctx.rGet(d) : r,
              xValue,
              yValue,
              data: d,
            };
          });
        } else if (Array.isArray(yValue)) {
          /*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
          return yValue.filter(notNull).map((yValue: number) => {
            return {
              x: ctx.xScale(xValue) + getOffset(ctx.xScale(xValue), offsetX, ctx.xScale),
              y: ctx.yScale(yValue) + getOffset(ctx.yScale(yValue), offsetY, ctx.yScale),
              r: ctx.config.r ? ctx.rGet(d) : r,
              xValue,
              yValue,
              data: d,
            };
          });
        } else if (xValue != null && yValue != null) {
          /*
				x="prop1"
				y="prop2"
			*/
          return {
            x: ctx.xScale(xValue) + getOffset(ctx.xScale(xValue), offsetX, ctx.xScale),
            y: ctx.yScale(yValue) + getOffset(ctx.yScale(yValue), offsetY, ctx.yScale),
            r: ctx.config.r ? ctx.rGet(d) : r,
            xValue,
            yValue,
            data: d,
          };
        }
      })
      .filter((p: Point) => p) as Point[]
  );

  const _links = $derived(
    pointsData.flatMap((d: any) => {
      const xValue = xAccessor(d);
      const yValue = yAccessor(d);

      if (Array.isArray(xValue)) {
        /*
				x={["prop1" ,"prop2"]}
				y="prop3"
			*/
        const [xMin, xMax] = extent(ctx.xGet(d)) as unknown as [number, number];
        const y = ctx.yGet(d) + getOffset(ctx.yGet(d), offsetY, ctx.yScale);
        return {
          source: {
            x: xMin + getOffset(xMin, offsetX, ctx.xScale) + (ctx.config.r ? ctx.rGet(d) : r),
            y,
          },
          target: {
            x: xMax + getOffset(xMax, offsetX, ctx.xScale) - (ctx.config.r ? ctx.rGet(d) : r),
            y: y,
          },
          data: d,
        };
      } else if (Array.isArray(yValue)) {
        /*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
        const x = ctx.xGet(d) + getOffset(ctx.xGet(d), offsetX, ctx.xScale);
        const [yMin, yMax] = extent(ctx.yGet(d)) as unknown as [number, number];
        return {
          source: {
            x: x,
            y: yMin + getOffset(yMin, offsetY, ctx.yScale),
          },
          target: {
            x: x,
            y: yMax + getOffset(yMax, offsetY, ctx.yScale),
          },
          data: d,
        };
      }
    })
  );
</script>

{#if children}
  {@render children({ points })}
{:else}
  {#if links}
    {#each _links as link}
      <Link
        data={link}
        stroke={fill ?? (ctx.config.c ? ctx.cGet(link.data) : null)}
        {...createDataAttr('link')}
        {...typeof links === 'object' ? links : null}
      />
    {/each}
  {/if}

  {#each points as point}
    {@const radialPoint = pointRadial(point.x, point.y)}
    <Circle
      {...createDataAttr('point')}
      cx={ctx.radial ? radialPoint[0] : point.x}
      cy={ctx.radial ? radialPoint[1] : point.y}
      r={point.r}
      fill={fill ?? (ctx.config.c ? ctx.cGet(point.data) : null)}
      {fillOpacity}
      {stroke}
      {strokeWidth}
      {opacity}
      class={className}
      {...restProps}
    />
  {/each}
{/if}
