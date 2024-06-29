<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { max, min } from 'd3-array';
  import type { Series, SeriesPoint } from 'd3-shape';
  import { cls, notNull } from 'svelte-ux';

  import { chartContext } from './ChartContext.svelte';
  import Circle from './Circle.svelte';
  import Line from './Line.svelte';
  import Bar from './Bar.svelte';
  import Rect from './Rect.svelte';
  import { tooltipContext } from './TooltipContext.svelte';

  import { isScaleBand } from '$lib/utils/scales.js';

  const {
    data: contextData,
    flatData,
    x,
    xDomain,
    xScale,
    xRange,
    xGet,
    y,
    yDomain,
    yScale,
    yRange,
    yGet,
    rGet,
    config,
  } = chartContext();
  const tooltip = tooltipContext();

  /** Highlight specific data (annotate), espect uses tooltip data */
  export let data: any = undefined;

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

  // TODO: Fix circle points being backwards for stack (see AreaStack)

  let _points: { x: number; y: number; fill: string }[] = [];
  let _lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  let _area = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  $: highlightData = data ?? $tooltip.data;

  $: if (highlightData) {
    let xCoord = $xGet(highlightData);
    let xOffset = isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0;

    let yCoord = $yGet(highlightData);
    let yOffset = isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0;

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
            y1: 0,
            x2: xItem + xOffset,
            y2: max($yRange) as unknown as number,
          })),
        ];
      } else {
        _lines = [
          ..._lines,
          {
            x1: xCoord + xOffset,
            y1: 0,
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
        const index = $flatData.findIndex((d) => Number($x(d)) === Number($x(highlightData)));
        const isLastPoint = index + 1 === $flatData.length;
        const nextDataPoint = isLastPoint ? max($xDomain) : $x($flatData[index + 1]);
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
            x1: 0,
            y1: yItem + yOffset,
            x2: max($xRange) as unknown as number,
            y2: yItem + yOffset,
          })),
        ];
      } else {
        _lines = [
          ..._lines,
          {
            x1: 0,
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
        const index = $flatData.findIndex((d) => Number($x(d)) === Number($x(highlightData)));
        const isLastPoint = index + 1 === $flatData.length;
        const nextDataPoint = isLastPoint ? max($yDomain) : $x($flatData[index + 1]);
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
          const seriesPointsData = $contextData.map((series: Series<any, any>) => {
            return {
              series,
              point: series.find((d) => $y(d) === $y(highlightSeriesPoint))!,
            };
          });

          _points = seriesPointsData.map((seriesPoint, i) => ({
            x: $xScale(seriesPoint.point[1]) + xOffset,
            y: yCoord + yOffset,
            fill: $config.r ? $rGet(seriesPoint.series) : null,
          }));
        }
      } else {
        // Multi series / etc  (ex. `y={['apples', 'bananas', 'oranges']}`)
        _points = xCoord.filter(notNull).map((xItem, i) => {
          const $key = $config.x[i];
          return {
            x: xItem + xOffset,
            y: yCoord + yOffset,
            // TODO: is there a better way to expose the series key/value?
            fill: $config.r ? $rGet({ ...highlightData, $key }) : null,
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
          const seriesPointsData = $contextData.map((series: Series<any, any>) => {
            return {
              series,
              point: series.find((d) => $x(d) === $x(highlightSeriesPoint))!,
            };
          });

          _points = seriesPointsData.map((seriesPoint, i) => ({
            x: xCoord + xOffset,
            y: $yScale(seriesPoint.point[1]) + yOffset,
            fill: $config.r ? $rGet(seriesPoint.series) : null,
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
            fill: $config.r ? $rGet({ ...highlightData, $key }) : null,
          };
        });
      }
    } else {
      _points = [
        {
          x: xCoord + xOffset,
          y: yCoord + yOffset,
          fill: $config.r ? $rGet(highlightData) : null,
        },
      ];
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
        on:click
      />
    </slot>
  {/if}

  {#if bar}
    <slot name="bar" {bar}>
      <Bar
        spring={motion}
        x={typeof bar === 'object' ? bar.x : undefined}
        y={typeof bar === 'object' ? bar.y : undefined}
        inset={typeof bar === 'object' ? bar.inset : undefined}
        stroke={typeof bar === 'object' ? bar.stroke : undefined}
        strokeWidth={typeof bar === 'object' ? bar.strokeWidth : undefined}
        radius={typeof bar === 'object' ? bar.radius : undefined}
        bar={highlightData}
        class={cls(
          // @ts-expect-error
          !bar.fill && 'fill-primary',
          typeof bar === 'object' ? bar.class : null
        )}
        on:click
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
          {...typeof points === 'object' ? points : null}
          class={cls(
            'stroke-[6] stroke-white [paint-order:stroke] drop-shadow',
            !point.fill && 'fill-primary',
            typeof points === 'object' ? points.class : null
          )}
        />
      {/each}
    </slot>
  {/if}
{/if}
