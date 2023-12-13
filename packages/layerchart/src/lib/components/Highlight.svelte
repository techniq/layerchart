<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import { max, min } from 'd3-array';
  import { cls, notNull } from 'svelte-ux';

  import { isScaleBand } from '$lib/utils/scales';
  import Circle from './Circle.svelte';
  import Line from './Line.svelte';
  import Bar from './Bar.svelte';
  import Rect from './Rect.svelte';
  import { tooltipContext } from './TooltipContext.svelte';

  const {
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
  } = getContext('LayerCake');
  const tooltip = tooltipContext();

  export let axis: 'x' | 'y' | 'both' | 'none' | undefined = undefined;

  /** Show points and pass props to Circles */
  export let points: boolean | ComponentProps<Circle> = false;

  /** Show lines and pass props to Lines */
  export let lines: boolean | ComponentProps<Line> = false;

  /** Show area and pass props to Rect */
  export let area: boolean | ComponentProps<Rect> = false;

  /** Show bar and pass props to Rect */
  export let bar: boolean | ComponentProps<Rect> = false;

  // TODO: Fix circle points being backwards for stack (see AreaStack)

  let _points = [];
  let _lines = [];
  let _area = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  $: if ($tooltip.data) {
    let xCoord = $xGet($tooltip.data);
    let xOffset = isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0;

    let yCoord = $yGet($tooltip.data);
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
            y2: max($yRange),
          })),
        ];
      } else {
        _lines = [
          ..._lines,
          {
            x1: xCoord + xOffset,
            y1: 0,
            x2: xCoord + xOffset,
            y2: max($yRange),
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
        const index = $flatData.findIndex((d) => Number($x(d)) === Number($x($tooltip.data)));
        const isLastPoint = index + 1 === $flatData.length;
        const nextDataPoint = isLastPoint ? max($xDomain) : $x($flatData[index + 1]);
        _area.width = ($xScale(nextDataPoint) ?? 0) - (xCoord ?? 0);
      }

      // If array, use left-most value for top left of rect
      _area.x =
        (Array.isArray(xCoord) ? min(xCoord) : xCoord) -
        (isScaleBand($xScale) ? ($xScale.padding() * $xScale.step()) / 2 : 0);

      if (axis === 'x') {
        _area.height = max($yRange);
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
            x2: max($xRange),
            y2: yItem + yOffset,
          })),
        ];
      } else {
        _lines = [
          ..._lines,
          {
            x1: 0,
            y1: yCoord + yOffset,
            x2: max($xRange),
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
        const index = $flatData.findIndex((d) => Number($x(d)) === Number($x($tooltip.data)));
        const isLastPoint = index + 1 === $flatData.length;
        const nextDataPoint = isLastPoint ? max($yDomain) : $x($flatData[index + 1]);
        _area.height = ($yScale(nextDataPoint) ?? 0) - (yCoord ?? 0);
      }

      // If array, use left-most value for top left of rect
      _area.y =
        (Array.isArray(yCoord) ? min(yCoord) : yCoord) -
        (isScaleBand($yScale) ? ($yScale.padding() * $yScale.step()) / 2 : 0);

      if (axis === 'y') {
        _area.width = max($xRange);
      }
    }

    // points
    if (Array.isArray(xCoord)) {
      // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
      _points = xCoord.filter(notNull).map((xItem, i) => ({
        x: xItem + xOffset,
        y: $yGet($tooltip.data) + yOffset,
      }));
    } else if (Array.isArray($tooltip.data)) {
      // Stack series
      _points = $tooltip.data.map((yValue, i) => ({
        x: xCoord + xOffset,
        y: $yScale(yValue) + yOffset,
      }));
    } else {
      _points = [
        {
          x: xCoord + xOffset,
          y: $yGet($tooltip.data) + yOffset,
        },
      ];
    }
  }
</script>

{#if $tooltip.data}
  {#if area}
    <slot name="area" area={_area}>
      <Rect
        spring
        {..._area}
        {...typeof area === 'object' ? area : null}
        class={cls(
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
        spring
        x={typeof bar === 'object' ? bar.x : null}
        y={typeof bar === 'object' ? bar.y : null}
        inset={typeof bar === 'object' ? bar.inset : null}
        stroke={typeof bar === 'object' ? bar.stroke : null}
        strokeWidth={typeof bar === 'object' ? bar.strokeWidth : null}
        radius={typeof bar === 'object' ? bar.radius : null}
        bar={$tooltip.data}
        class={cls(!bar.fill && 'fill-primary', typeof bar === 'object' ? bar.class : null)}
        on:click
      />
    </slot>
  {/if}

  {#if lines}
    <slot name="lines" lines={_lines}>
      {#each _lines as line}
        <Line
          spring
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
        <!-- TODO: Improve color with stacked data -->
        {@const fill = $config.r ? $rGet($tooltip.data) : null}
        <Circle
          spring
          cx={point.x}
          cy={point.y}
          r={4}
          {fill}
          {...typeof points === 'object' ? points : null}
          class={cls(
            'stroke-[6] stroke-white [paint-order:stroke] drop-shadow',
            !fill && 'fill-primary',
            typeof points === 'object' ? points.class : null
          )}
        />
      {/each}
    </slot>
  {/if}
{/if}
