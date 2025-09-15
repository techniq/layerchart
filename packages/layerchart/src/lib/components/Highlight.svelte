<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';
  import Circle from './Circle.svelte';
  import Line from './Line.svelte';
  import Bar from './Bar.svelte';
  import Rect from './Rect.svelte';
  import { accessor, type Accessor } from '$lib/utils/common.js';

  export type HighlightPointData = { x: any; y: any };
  export type HighlightPoint = { x: number; y: number; fill: string; data: HighlightPointData };

  export type HighlightPropsWithoutHTML = {
    /**
     * Highlight specific data (annotate), especte uses tooltip data
     */
    data?: any;

    /**
     * Override `x` from context
     */
    x?: Accessor;

    /**
     * Override `y` from context
     */
    y?: Accessor;

    axis?: 'x' | 'y' | 'both' | 'none';

    /**
     * Show points and pass props to Circles
     * @default false
     */
    points?:
      | boolean
      | Partial<ComponentProps<typeof Circle>>
      | Snippet<
          [
            {
              points: {
                x: number;
                y: number;
                fill: string;
                data: HighlightPointData;
              }[];
            },
          ]
        >;

    /**
     * Show lines and pass props to Lines
     * @default false
     */
    lines?:
      | boolean
      | Partial<ComponentProps<typeof Line>>
      | Snippet<
          [
            {
              lines: {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
              }[];
            },
          ]
        >;

    /**
     * Show area and pass props to Rect
     * @default false
     */
    area?:
      | boolean
      | Partial<ComponentProps<typeof Rect>>
      | Snippet<
          [
            {
              area: {
                x: number;
                y: number;
                width: number;
                height: number;
              };
            },
          ]
        >;

    /**
     * Show bar and pass props to Rect
     *
     * @default false
     */
    bar?: boolean | Partial<ComponentProps<typeof Bar>> | Snippet;

    /**
     * Set to false to disable spring transitions
     *
     * @default true
     */
    motion?: MotionProp;

    onAreaClick?: (e: MouseEvent, detail: { data: any }) => void;
    onBarClick?: (e: MouseEvent, detail: { data: any }) => void;

    onPointClick?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
    onPointEnter?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
    onPointLeave?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
  };
</script>

<script lang="ts">
  import { max, min } from 'd3-array';
  import { pointRadial, type Series, type SeriesPoint } from 'd3-shape';
  import { notNull } from '@layerstack/utils';

  import { isScaleBand, isScaleTime } from '$lib/utils/scales.svelte.js';
  import { asAny } from '$lib/utils/types.js';
  import { getChartContext } from './Chart.svelte';
  import { getTooltipContext } from './tooltip/TooltipContext.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';
  import Arc from './Arc.svelte';

  const ctx = getChartContext();
  const tooltipCtx = getTooltipContext();

  let {
    data,
    x: xProp = ctx.x,
    y: yProp = ctx.y,
    axis: axisProp,
    points = false,
    lines: linesProp = false,
    area = false,
    bar = false,
    motion = 'spring',
    onAreaClick,
    onBarClick,
    onPointClick,
    onPointEnter,
    onPointLeave,
  }: HighlightPropsWithoutHTML = $props();

  const x = $derived(accessor(xProp));
  const y = $derived(accessor(yProp));

  const highlightData = $derived(data ?? tooltipCtx.data);
  const xValue = $derived(x(highlightData));
  const xCoord = $derived(
    Array.isArray(xValue) ? xValue.map((v) => ctx.xScale(v)) : ctx.xScale(xValue)
  );
  const xOffset = $derived(isScaleBand(ctx.xScale) && !ctx.radial ? ctx.xScale.bandwidth() / 2 : 0);
  const yValue = $derived(y(highlightData));
  const yCoord = $derived(
    Array.isArray(yValue) ? yValue.map((v) => ctx.yScale(v)) : ctx.yScale(yValue)
  );
  const yOffset = $derived(isScaleBand(ctx.yScale) && !ctx.radial ? ctx.yScale.bandwidth() / 2 : 0);
  const axis = $derived(
    axisProp == null ? (isScaleBand(ctx.yScale) || isScaleTime(ctx.yScale) ? 'y' : 'x') : axisProp
  );

  const _lines: { x1: number; y1: number; x2: number; y2: number }[] = $derived.by(() => {
    let tmpLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    if (!highlightData) return tmpLines;
    if (axis === 'x' || axis === 'both') {
      if (Array.isArray(xCoord)) {
        // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
        tmpLines = [
          ...tmpLines,
          ...xCoord.filter(notNull).map((xItem, i) => ({
            x1: xItem + xOffset,
            y1: min(ctx.yRange) as unknown as number,
            x2: xItem + xOffset,
            y2: max(ctx.yRange) as unknown as number,
          })),
        ];
      } else if (xCoord != null) {
        tmpLines = [
          ...tmpLines,
          {
            x1: xCoord + xOffset,
            y1: min(ctx.yRange) as unknown as number,
            x2: xCoord + xOffset,
            y2: max(ctx.yRange) as unknown as number,
          },
        ];
      }
    }

    if (axis === 'y' || axis === 'both') {
      // y lines
      if (Array.isArray(yCoord)) {
        // `y` accessor with multiple properties (ex. `y={['start', 'end']})`)
        tmpLines = [
          ...tmpLines,
          ...yCoord.filter(notNull).map((yItem, i) => ({
            x1: min(ctx.xRange) as unknown as number,
            y1: yItem + yOffset,
            x2: max(ctx.xRange) as unknown as number,
            y2: yItem + yOffset,
          })),
        ];
      } else if (yCoord != null) {
        tmpLines = [
          ...tmpLines,
          {
            x1: min(ctx.xRange) as unknown as number,
            y1: yCoord + yOffset,
            x2: max(ctx.xRange) as unknown as number,
            y2: yCoord + yOffset,
          },
        ];
      }
    }

    if (ctx.radial) {
      tmpLines = tmpLines.map((l) => {
        const [x1, y1] = pointRadial(l.x1, l.y1);
        const [x2, y2] = pointRadial(l.x2, l.y2);
        return {
          ...l,
          x1,
          y1,
          x2,
          y2,
        };
      });
    }

    return tmpLines;
  });

  const _area: {
    x: number;
    y: number;
    width: number;
    height: number;
  } = $derived.by(() => {
    const tmpArea: {
      x: number;
      y: number;
      width: number;
      height: number;
    } = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    if (!highlightData) return tmpArea;

    if (axis === 'x' || axis === 'both') {
      // x area
      if (Array.isArray(xCoord)) {
        // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
        tmpArea.width = max(xCoord) - min(xCoord); // Use first/last values for width
      } else if (isScaleBand(ctx.xScale)) {
        tmpArea.width = ctx.xScale.step();
      } else {
        // Find width to next data point
        const index = ctx.flatData.findIndex((d) => Number(x(d)) === Number(x(highlightData)));
        const isLastPoint = index + 1 === ctx.flatData.length;
        const nextDataPoint = isLastPoint ? max(ctx.xDomain) : x(ctx.flatData[index + 1]);
        tmpArea.width = (ctx.xScale(nextDataPoint) ?? 0) - (xCoord ?? 0);
      }

      // If array, use left-most value for top left of rect
      tmpArea.x =
        (Array.isArray(xCoord) ? min(xCoord) : xCoord) -
        (isScaleBand(ctx.xScale) ? (ctx.xScale.padding() * ctx.xScale.step()) / 2 : 0);

      if (axis === 'x') {
        tmpArea.y = min(ctx.yRange) as unknown as number;
        tmpArea.height = (max(ctx.yRange) - min(ctx.yRange)) as unknown as number;
      }
    }

    if (axis === 'y' || axis === 'both') {
      // y area
      if (Array.isArray(yCoord)) {
        // `y` accessor with multiple properties (ex. `y={['start', 'end']})`)
        tmpArea.height = max(yCoord) - min(yCoord); // Use first/last values for width
      } else if (isScaleBand(ctx.yScale)) {
        tmpArea.height = ctx.yScale.step();
      } else {
        // Find width to next data point
        const index = ctx.flatData.findIndex((d) => Number(y(d)) === Number(y(highlightData)));
        const isLastPoint = index + 1 === ctx.flatData.length;
        const nextDataPoint = isLastPoint ? max(ctx.yDomain) : y(ctx.flatData[index + 1]);
        tmpArea.height = (ctx.yScale(nextDataPoint) ?? 0) - (yCoord ?? 0);
      }

      // If array, use left-most value for top left of rect
      tmpArea.y =
        (Array.isArray(yCoord) ? min(yCoord) : yCoord) -
        (isScaleBand(ctx.yScale) ? (ctx.yScale.padding() * ctx.yScale.step()) / 2 : 0);

      if (axis === 'y') {
        tmpArea.width = max(ctx.xRange) as unknown as number;
      }
    }
    return tmpArea;
  });

  const _points: { x: number; y: number; fill: string; data: HighlightPointData }[] = $derived.by(
    () => {
      let tmpPoints: { x: number; y: number; fill: string; data: HighlightPointData }[] = [];
      if (!highlightData) return tmpPoints;
      if (Array.isArray(xCoord)) {
        // `x` accessor with multiple properties (ex. `x={['start', 'end']}` or `x={[0, 1]}`)

        if (Array.isArray(highlightData)) {
          // Stack series  (ex. `y={[['apples', 'bananas', 'oranges']]})`)
          // `highlightData` is a single stack layer/point, which is an 2 element array with an extra `data` property `[number, number, data: any]`.
          const highlightSeriesPoint = highlightData as SeriesPoint<any>;

          // Ignore non-array data such as hierarchy and graph (make Typescript happy)
          if (Array.isArray(ctx.data)) {
            // For each series, find the related data point
            const seriesPointsData = (ctx.data as any[])
              .map((series: Series<any, any>) => {
                return {
                  series,
                  point: series.find((d) => y(d) === y(highlightSeriesPoint))!,
                };
              })
              .filter((d) => d.point); // remove if no point found (ex. Histogram);

            tmpPoints = seriesPointsData.map((seriesPoint, i) => {
              return {
                x: ctx.xScale(seriesPoint.point[1]) + xOffset,
                y: yCoord + yOffset,
                fill: ctx.config.c ? ctx.cGet(seriesPoint.series) : null,
                data: {
                  x: seriesPoint.point[1],
                  y: yValue,
                },
              };
            });
          }
        } else {
          // Multi series / etc  (ex. `y={['apples', 'bananas', 'oranges']}`)
          tmpPoints = xCoord.filter(notNull).map((xItem, i) => {
            // @ts-expect-error - TODO: fix type
            const _key = ctx.config.x?.[i];
            return {
              x: xItem + xOffset,
              y: yCoord + yOffset,
              // TODO: is there a better way to expose the series key/value?
              fill: ctx.config.c ? ctx.cGet({ ...highlightData, $key: _key }) : null,
              data: {
                x: xValue, // TODO: use highlightData[$key]?
                y: yValue,
              },
            };
          });
        }
      } else if (Array.isArray(yCoord)) {
        // `y` accessor with multiple properties (ex. `y={['apples', 'bananas', 'oranges']}` or `y={[0, 1]})

        if (Array.isArray(highlightData)) {
          // Stack series  (ex. `y={[['apples', 'bananas', 'oranges']]})`)
          // `highlightData` is a single stack layer/point, which is an 2 element array with an extra `data` property `[number, number, data: any]`.
          const highlightSeriesPoint = highlightData as SeriesPoint<any>;

          // Ignore non-array data such as hierarchy and graph (make Typescript happy)
          if (Array.isArray(ctx.data)) {
            // For each series, find the related data point
            const seriesPointsData = (ctx.data as any[])
              .map((series: Series<any, any>) => {
                return {
                  series,
                  point: series.find((d) => x(d) === x(highlightSeriesPoint))!,
                };
              })
              .filter((d) => d.point); // remove if no point found (ex. Histogram)

            tmpPoints = seriesPointsData.map((seriesPoint, i) => ({
              x: xCoord + xOffset,
              y: ctx.yScale(seriesPoint.point[1]) + yOffset,
              fill: ctx.config.c ? ctx.cGet(seriesPoint.series) : null,
              data: {
                x: xValue,
                y: seriesPoint.point[1],
              },
            }));
          }
        } else {
          // Multi series / etc  (ex. `y={['apples', 'bananas', 'oranges']}`)
          tmpPoints = yCoord.filter(notNull).map((yItem, i) => {
            // @ts-expect-error - TODO: fix type
            const _key = ctx.config.y[i];
            return {
              x: xCoord + xOffset,
              y: yItem + yOffset,
              // TODO: is there a better way to expose the series key/value?
              fill: ctx.config.c ? ctx.cGet({ ...highlightData, $key: _key }) : null,
              data: {
                x: xValue,
                y: yValue, // TODO: use highlightData[$key] ?
              },
            };
          });
        }
      } else if (xCoord != null && yCoord != null) {
        tmpPoints = [
          {
            x: xCoord + xOffset,
            y: yCoord + yOffset,
            fill: ctx.config.c ? ctx.cGet(highlightData) : null,
            data: {
              x: xValue,
              y: yValue,
            },
          },
        ];
      } else {
        tmpPoints = [];
      }

      if (ctx.radial) {
        // Translate x/y to angle/radius
        tmpPoints = tmpPoints.map((p) => {
          const [x, y] = pointRadial(p.x, p.y);
          return {
            ...p,
            x,
            y,
          };
        });
      }
      return tmpPoints;
    }
  );
</script>

{#if highlightData}
  {#if area}
    {#if typeof area === 'function'}
      {@render area({ area: _area })}
    {:else if ctx.radial}
      <!-- TODO: What should we do about areaProps -->
      <Arc
        motion={motion === 'spring' ? 'spring' : undefined}
        startAngle={_area.x}
        endAngle={_area.x + _area.width}
        innerRadius={_area.y}
        outerRadius={_area.y + _area.height}
        class="lc-highlight-area"
        onclick={onAreaClick && ((e) => onAreaClick(e, { data: highlightData }))}
      />
    {:else}
      <Rect
        motion={motion === 'spring' ? 'spring' : undefined}
        {..._area}
        {...extractLayerProps(area, 'lc-highlight-area')}
        onclick={onAreaClick && ((e) => onAreaClick(e, { data: highlightData }))}
      />
    {/if}
  {/if}

  {#if bar}
    {#if typeof bar === 'function'}
      {@render bar()}
    {:else}
      <Bar
        motion={motion === 'spring' ? 'spring' : undefined}
        data={highlightData}
        {...extractLayerProps(bar, 'lc-highlight-bar')}
        onclick={onBarClick && ((e) => onBarClick(e, { data: highlightData }))}
      />
    {/if}
  {/if}

  {#if linesProp}
    {#if typeof linesProp === 'function'}
      {@render linesProp({ lines: _lines })}
    {:else}
      {#each _lines as line}
        <Line
          motion={motion === 'spring' ? 'spring' : undefined}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          {...extractLayerProps(linesProp, 'lc-highlight-line')}
        />
      {/each}
    {/if}
  {/if}

  {#if points}
    {#if typeof points === 'function'}
      {@render points({ points: _points })}
    {:else}
      {#each _points as point}
        <Circle
          motion={motion === 'spring' ? 'spring' : undefined}
          cx={point.x}
          cy={point.y}
          fill={point.fill}
          r={4}
          strokeWidth={6}
          {...extractLayerProps(points, 'lc-highlight-point')}
          onpointerdown={onPointClick &&
            ((e) => {
              // Do not propagate `pointerdown` event to `BrushContext` if `onclick` is provided
              e.stopPropagation();
            })}
          onclick={onPointClick && ((e) => onPointClick(e, { point, data: highlightData }))}
          onpointerenter={onPointEnter &&
            ((e) => {
              if (onPointClick) {
                asAny(e.target).style.cursor = 'pointer';
              }
              onPointEnter(e, { point, data: highlightData });
            })}
          onpointerleave={onPointLeave &&
            ((e) => {
              if (onPointClick) {
                asAny(e.target).style.cursor = 'default';
              }
              onPointLeave(e, { point, data: highlightData });
            })}
        />
      {/each}
    {/if}
  {/if}
{/if}

<style>
  @layer components {
    :global(:where(.lc-highlight-area)) {
      --fill-color: color-mix(in oklch, var(--color-surface-content, currentColor) 5%, transparent);
    }

    :global(:where(.lc-highlight-bar)) {
      --fill-color: var(--color-primary, currentColor);
    }

    :global(:where(.lc-highlight-line)) {
      --stroke-color: color-mix(
        in oklch,
        var(--color-surface-content, currentColor) 20%,
        transparent
      );
      stroke-width: 2;
      stroke-dasharray: 2 2;
      pointer-events: none;
    }

    :global(:where(.lc-highlight-point)) {
      --stroke-color: white;
      --fill-color: var(--color-primary, currentColor);
      paint-order: stroke;
      filter: drop-shadow(var(--drop-shadow-sm, 0 1px 2px rgb(0 0 0 / 0.15)));
    }
  }
</style>
