<script lang="ts" context="module">
  export type HighlightPointData = { x: any; y: any };
</script>

<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { max, min } from 'd3-array';
  import { pointRadial, type Series, type SeriesPoint } from 'd3-shape';
  import { notNull } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from './ChartContext.svelte';
  import Circle from './Circle.svelte';
  import Line from './Line.svelte';
  import Bar from './Bar.svelte';
  import Rect from './Rect.svelte';
  import { tooltipContext } from './tooltip/TooltipContext.svelte';

  import { isScaleBand } from '$lib/utils/scales.js';
  import { accessor, type Accessor } from '$lib/utils/common.js';
  import { asAny } from '$lib/utils/types.js';

  const {
    data: contextData,
    flatData,
    x: xContext,
    xDomain,
    xScale,
    xRange,
    y: yContext,
    yDomain,
    yScale,
    yRange,
    cGet,
    config,
    radial,
  } = chartContext();
  const tooltip = tooltipContext();

  /** Highlight specific data (annotate), espect uses tooltip data */
  export let data: any = undefined;

  /**
   * Override `x` from context
   */
  export let x: Accessor = $xContext;

  /**
   * Override `y` from context
   */
  export let y: Accessor = $yContext;

  export let axis: 'x' | 'y' | 'both' | 'none' | undefined = undefined;

  /** Show points and pass props to Circles */
  export let points: boolean | Partial<ComponentProps<Circle>> = false;

  /** Show lines and pass props to Lines */
  export let lines: boolean | Partial<ComponentProps<Line>> = false;

  /** Show area and pass props to Rect */
  export let area: boolean | Partial<ComponentProps<Rect>> = false;

  /** Show bar and pass props to Rect */
  export let bar: boolean | Partial<ComponentProps<Bar>> = false;

  /** Set to false to disable spring transitions */
  export let motion = true;

  export let onareaclick: ((e: MouseEvent, detail: { data: any }) => void) | undefined = undefined;
  export let onbarclick: ((e: MouseEvent, detail: { data: any }) => void) | undefined = undefined;

  export let onpointclick:
    | ((e: MouseEvent, detail: { point: (typeof _points)[number]; data: any }) => void)
    | undefined = undefined;
  export let onpointenter:
    | ((e: MouseEvent, detail: { point: (typeof _points)[number]; data: any }) => void)
    | undefined = undefined;
  export let onpointleave:
    | ((e: MouseEvent, detail: { point: (typeof _points)[number]; data: any }) => void)
    | undefined = undefined;

  const _x = accessor(x);
  const _y = accessor(y);

  let _points: { x: number; y: number; fill: string; data: HighlightPointData }[] = [];
  let _lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  let _area = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  $: highlightData = data ?? $tooltip.data;

  $: if (highlightData) {
    const xValue = _x(highlightData);
    const xCoord = Array.isArray(xValue) ? xValue.map((v) => $xScale(v)) : $xScale(xValue);
    const xOffset = isScaleBand($xScale) && !$radial ? $xScale.bandwidth() / 2 : 0;

    const yValue = _y(highlightData);
    const yCoord = Array.isArray(yValue) ? yValue.map((v) => $yScale(v)) : $yScale(yValue);
    const yOffset = isScaleBand($yScale) && !$radial ? $yScale.bandwidth() / 2 : 0;

    // Reset lines
    _lines = [];

    const defaultAxis = isScaleBand($yScale) ? 'y' : 'x';
    if (axis == null) {
      axis = defaultAxis;
    }

    if (axis === 'x' || axis === 'both') {
      // x lines
      if (Array.isArray(xCoord)) {
        // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
        _lines = [
          ..._lines,
          ...xCoord.filter(notNull).map((xItem, i) => ({
            x1: xItem + xOffset,
            y1: min($yRange) as unknown as number,
            x2: xItem + xOffset,
            y2: max($yRange) as unknown as number,
          })),
        ];
      } else if (xCoord) {
        _lines = [
          ..._lines,
          {
            x1: xCoord + xOffset,
            y1: min($yRange) as unknown as number,
            x2: xCoord + xOffset,
            y2: max($yRange) as unknown as number,
          },
        ];
      }

      // x area
      if (Array.isArray(xCoord)) {
        // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
        _area.width = max(xCoord) - min(xCoord); // Use first/last values for width
      } else if (isScaleBand($xScale)) {
        _area.width = $xScale.step();
      } else {
        // Find width to next data point
        const index = $flatData.findIndex((d) => Number(_x(d)) === Number(_x(highlightData)));
        const isLastPoint = index + 1 === $flatData.length;
        const nextDataPoint = isLastPoint ? max($xDomain) : _x($flatData[index + 1]);
        _area.width = ($xScale(nextDataPoint) ?? 0) - (xCoord ?? 0);
      }

      // If array, use left-most value for top left of rect
      _area.x =
        (Array.isArray(xCoord) ? min(xCoord) : xCoord) -
        (isScaleBand($xScale) ? ($xScale.padding() * $xScale.step()) / 2 : 0);

      if (axis === 'x') {
        _area.height = max($yRange) as unknown as number;
      }
    }

    if (axis === 'y' || axis === 'both') {
      // y lines
      if (Array.isArray(yCoord)) {
        // `y` accessor with multiple properties (ex. `y={['start', 'end']})`)
        _lines = [
          ..._lines,
          ...yCoord.filter(notNull).map((yItem, i) => ({
            x1: min($xRange) as unknown as number,
            y1: yItem + yOffset,
            x2: max($xRange) as unknown as number,
            y2: yItem + yOffset,
          })),
        ];
      } else if (yCoord) {
        _lines = [
          ..._lines,
          {
            x1: min($xRange) as unknown as number,
            y1: yCoord + yOffset,
            x2: max($xRange) as unknown as number,
            y2: yCoord + yOffset,
          },
        ];
      }

      // y area
      if (Array.isArray(yCoord)) {
        // `y` accessor with multiple properties (ex. `y={['start', 'end']})`)
        _area.height = max(yCoord) - min(yCoord); // Use first/last values for width
      } else if (isScaleBand($yScale)) {
        _area.height = $yScale.step();
      } else {
        // Find width to next data point
        const index = $flatData.findIndex((d) => Number(_x(d)) === Number(_x(highlightData)));
        const isLastPoint = index + 1 === $flatData.length;
        const nextDataPoint = isLastPoint ? max($yDomain) : _x($flatData[index + 1]);
        _area.height = ($yScale(nextDataPoint) ?? 0) - (yCoord ?? 0);
      }

      // If array, use left-most value for top left of rect
      _area.y =
        (Array.isArray(yCoord) ? min(yCoord) : yCoord) -
        (isScaleBand($yScale) ? ($yScale.padding() * $yScale.step()) / 2 : 0);

      if (axis === 'y') {
        _area.width = max($xRange) as unknown as number;
      }
    }

    // points
    if (Array.isArray(xCoord)) {
      // `x` accessor with multiple properties (ex. `x={['start', 'end']}` or `x={[0, 1]}`)

      if (Array.isArray(highlightData)) {
        // Stack series  (ex. `y={[['apples', 'bananas', 'oranges']]})`)
        // `highlightData` is a single stack layer/point, which is an 2 element array with an extra `data` property `[number, number, data: any]`.
        const highlightSeriesPoint = highlightData as SeriesPoint<any>;

        // Ignore non-array data such as hierarchy and graph (make Typescript happy)
        if (Array.isArray($contextData)) {
          // For each series, find the related data point
          const seriesPointsData = $contextData
            .map((series: Series<any, any>) => {
              return {
                series,
                point: series.find((d) => _y(d) === _y(highlightSeriesPoint))!,
              };
            })
            .filter((d) => d.point); // remove if no point found (ex. Histogram);

          _points = seriesPointsData.map((seriesPoint, i) => {
            return {
              x: $xScale(seriesPoint.point[1]) + xOffset,
              y: yCoord + yOffset,
              fill: $config.c ? $cGet(seriesPoint.series) : null,
              data: {
                x: seriesPoint.point[1],
                y: yValue,
              },
            };
          });
        }
      } else {
        // Multi series / etc  (ex. `y={['apples', 'bananas', 'oranges']}`)
        _points = xCoord.filter(notNull).map((xItem, i) => {
          const $key = $config.x[i];
          return {
            x: xItem + xOffset,
            y: yCoord + yOffset,
            // TODO: is there a better way to expose the series key/value?
            fill: $config.c ? $cGet({ ...highlightData, $key }) : null,
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
        if (Array.isArray($contextData)) {
          // For each series, find the related data point
          const seriesPointsData = $contextData
            .map((series: Series<any, any>) => {
              return {
                series,
                point: series.find((d) => _x(d) === _x(highlightSeriesPoint))!,
              };
            })
            .filter((d) => d.point); // remove if no point found (ex. Histogram)

          _points = seriesPointsData.map((seriesPoint, i) => ({
            x: xCoord + xOffset,
            y: $yScale(seriesPoint.point[1]) + yOffset,
            fill: $config.c ? $cGet(seriesPoint.series) : null,
            data: {
              x: xValue,
              y: seriesPoint.point[1],
            },
          }));
        }
      } else {
        // Multi series / etc  (ex. `y={['apples', 'bananas', 'oranges']}`)
        _points = yCoord.filter(notNull).map((yItem, i) => {
          const $key = $config.y[i];
          return {
            x: xCoord + xOffset,
            y: yItem + yOffset,
            // TODO: is there a better way to expose the series key/value?
            fill: $config.c ? $cGet({ ...highlightData, $key }) : null,
            data: {
              x: xValue,
              y: yValue, // TODO: use highlightData[$key] ?
            },
          };
        });
      }
    } else if (xCoord != null && yCoord != null) {
      _points = [
        {
          x: xCoord + xOffset,
          y: yCoord + yOffset,
          fill: $config.c ? $cGet(highlightData) : null,
          data: {
            x: xValue,
            y: yValue,
          },
        },
      ];
    } else {
      _points = [];
    }

    if ($radial) {
      // Translate x/y to angle/radius
      _points = _points.map((p) => {
        const [x, y] = pointRadial(p.x, p.y);
        return {
          ...p,
          x,
          y,
        };
      });

      _lines = _lines.map((l) => {
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

      // TODO: How to handle _areas
    }
  }
</script>

{#if highlightData}
  {#if area}
    <slot name="area" area={_area}>
      <Rect
        spring={motion}
        {..._area}
        {...typeof area === 'object' ? area : null}
        class={cls(
          // @ts-expect-error
          !area.fill && 'fill-surface-content/5',
          typeof area === 'object' ? area.class : null
        )}
        onclick={onareaclick && ((e) => onareaclick(e, { data: highlightData }))}
      />
    </slot>
  {/if}

  {#if bar}
    <slot name="bar" {bar}>
      <Bar
        spring={motion}
        bar={highlightData}
        {...typeof bar === 'object' ? bar : null}
        class={cls(
          // @ts-expect-error
          !bar.fill && 'fill-primary',
          typeof bar === 'object' ? bar.class : null
        )}
        onclick={onbarclick && ((e) => onbarclick(e, { data: highlightData }))}
      />
    </slot>
  {/if}

  {#if lines}
    <slot name="lines" lines={_lines}>
      {#each _lines as line}
        <Line
          spring={motion}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          {...typeof lines === 'object' ? lines : null}
          class={cls(
            'stroke-surface-content/20 stroke-2 [stroke-dasharray:2,2] pointer-events-none',
            typeof lines === 'object' ? lines.class : null
          )}
        />
      {/each}
    </slot>
  {/if}

  {#if points}
    <slot name="points" points={_points}>
      {#each _points as point}
        <Circle
          spring={motion}
          cx={point.x}
          cy={point.y}
          fill={point.fill}
          r={4}
          strokeWidth={6}
          {...typeof points === 'object' ? points : null}
          class={cls(
            'stroke-white [paint-order:stroke] drop-shadow',
            !point.fill && (typeof points === 'boolean' || !points.fill) && 'fill-primary',
            typeof points === 'object' ? points.class : null
          )}
          onpointerdown={onpointclick &&
            ((e) => {
              // Do not propagate `pointerdown` event to `BrushContext` if `onclick` is provided
              e.stopPropagation();
            })}
          onclick={onpointclick && ((e) => onpointclick(e, { point, data: highlightData }))}
          onpointerenter={onpointenter &&
            ((e) => {
              if (onpointclick) {
                asAny(e.target).style.cursor = 'pointer';
              }
              onpointenter(e, { point, data: highlightData });
            })}
          onpointerleave={onpointleave &&
            ((e) => {
              if (onpointclick) {
                asAny(e.target).style.cursor = 'default';
              }
              onpointleave(e, { point, data: highlightData });
            })}
        />
      {/each}
    </slot>
  {/if}
{/if}
