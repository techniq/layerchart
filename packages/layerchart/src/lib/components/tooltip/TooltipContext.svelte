<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import type { Readable } from 'svelte/store';

  export const tooltipContextKey = Symbol();

  export type TooltipContextValue = {
    x: number;
    y: number;
    data: any;
    locked: boolean;
    show(e: PointerEvent, tooltipData?: any): void;
    hide(e?: PointerEvent): void;
  };

  export type TooltipContext = Readable<TooltipContextValue>;

  const defaultContext: TooltipContext = writable({
    x: 0,
    y: 0,
    data: null as any,
    locked: false,
    show: () => {},
    hide: () => {},
  });
  export function tooltipContext() {
    return getContext<TooltipContext>(tooltipContextKey) ?? defaultContext;
  }

  function setTooltipContext(tooltip: TooltipContext) {
    setContext(tooltipContextKey, tooltip);
  }
</script>

<script lang="ts">
  import { raise } from 'layercake';
  import { writable } from 'svelte/store';
  import { bisector, max, min } from 'd3-array';
  import { quadtree as d3Quadtree, type Quadtree } from 'd3-quadtree';
  import { sortFunc } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Svg from './../layout/Svg.svelte';
  import { chartContext } from './../ChartContext.svelte';
  import ChartClipPath from './../ChartClipPath.svelte';
  import Voronoi from './../Voronoi.svelte';

  import { localPoint } from '$lib/utils/event.js';
  import { isScaleBand, scaleInvert } from '$lib/utils/scales.js';
  import { cartesianToPolar } from '$lib/utils/math.js';
  import { quadtreeRects } from '$lib/utils/quadtree.js';

  const {
    flatData,
    x,
    xScale,
    xGet,
    xRange,
    y,
    yScale,
    yGet,
    yRange,
    width,
    height,
    containerWidth,
    containerHeight,
    padding,
    radial,
  } = chartContext<any>();

  /*
		TODO: Defaults to consider (if possible to detect scale type, which might not be possible)
		- scaleTime / scaleLinear: bisect
		- scaleTime / scaleLinear (multi/stack): bisect 
		- scaleTime / scaleBand: bisect (or band)
		- scaleTime (multi) / scaleBand: bounds (or possible band if not overlapping)
		- scaleBand, scaleLinear: band (or bounds)
		- scaleBand, scaleLinear: band (or bounds) - multiple (overlapping) bars
		- scaleLinear, scaleLinear: voronoi (or quadtree)
	*/

  /**
   * @type {'bisect-x' | 'bisect-y' | 'band' | 'bisect-band' | 'bounds' | 'voronoi' | 'quadtree' | 'manual'}
   */
  export let mode:
    | 'bisect-x'
    | 'bisect-y'
    | 'band'
    | 'bisect-band'
    | 'bounds'
    | 'voronoi'
    | 'quadtree'
    | 'manual' = 'manual';
  /**
   * @type {'closest' | 'left' | 'right'}
   */
  export let findTooltipData: 'closest' | 'left' | 'right' = 'closest';

  /** Similar to d3-selection's raise, re-insert the e.target as the last child of its parent, so to be the top-most element */
  export let raiseTarget = false;

  /** Lock tooltip (keep open, do not update on mouse movement).  Allows for kicking on tooltip */
  export let locked = false;

  /** quadtree search radius
   * @type {number}
   */
  export let radius: number = Infinity;
  /** Enable debug view (show hit targets, etc) */
  export let debug = false;

  export let onClick: ({ data }: { data: any }) => any = () => {};

  /** Exposed to allow binding in Chart */
  export let tooltip = writable({
    y: 0,
    x: 0,
    data: null as any,
    show: showTooltip,
    hide: hideTooltip,
  });
  setTooltipContext(tooltip);

  let hideTimeoutId: NodeJS.Timeout;

  $: bisectX = bisector((d: any) => {
    const value = $x(d);
    if (Array.isArray(value)) {
      // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
      // Using first value.  Consider using average, max, etc
      // const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
      // return midpoint;
      return value[0];
    } else {
      return value;
    }
  }).left;

  $: bisectY = bisector((d: any) => {
    const value = $y(d);
    if (Array.isArray(value)) {
      // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
      // Using first value.  Consider using average, max, etc
      // const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
      // return midpoint;
      return value[0];
    } else {
      return value;
    }
  }).left;

  function findData(previousValue: any, currentValue: any, valueAtPoint: any, accessor: Function) {
    switch (findTooltipData) {
      case 'closest':
        if (currentValue === undefined) {
          return previousValue;
        } else if (previousValue === undefined) {
          return currentValue;
        } else {
          return Number(valueAtPoint) - Number(accessor(previousValue)) >
            Number(accessor(currentValue)) - Number(valueAtPoint)
            ? currentValue
            : previousValue;
        }
      case 'left':
        return previousValue;
      case 'right':
      default:
        return currentValue;
    }
  }

  function showTooltip(e: PointerEvent, tooltipData?: any) {
    // Cancel hiding tooltip if from previous event loop
    clearTimeout(hideTimeoutId);

    if (locked) {
      // Ignore (keep current position / data)
      return;
    }

    const referenceNode = (e.target as Element).closest('.layercake-container')!;
    const point = localPoint(referenceNode, e);
    const pointerX = point?.x ?? 0;
    const pointerY = point?.y ?? 0;

    if (
      // @ts-expect-error
      pointerX < e.currentTarget?.offsetLeft ||
      // @ts-expect-error
      pointerX > e.currentTarget?.offsetLeft + e.currentTarget?.offsetWidth ||
      // @ts-expect-error
      pointerY < e.currentTarget?.offsetTop ||
      // @ts-expect-error
      pointerY > e.currentTarget?.offsetTop + e.currentTarget?.offsetHeight
    ) {
      // Ignore if within padding of chart
      hideTooltip();
      return;
    }

    // If tooltipData not provided already (voronoi, etc), attempt to find it
    // TODO: When using bisect-x/y/band, values should be sorted.  Typically they are for `x`, but not `y` (and band depends on if x or y scale)
    if (tooltipData == null) {
      switch (mode) {
        case 'bisect-x': {
          let xValueAtPoint: any;
          if ($radial) {
            // Assume radial is always centered
            const { radians } = cartesianToPolar(pointerX - $width / 2, pointerY - $height / 2);
            xValueAtPoint = scaleInvert($xScale, radians);
          } else {
            xValueAtPoint = scaleInvert($xScale, pointerX - $padding.left);
          }

          const index = bisectX($flatData, xValueAtPoint, 1);
          const previousValue = $flatData[index - 1];
          const currentValue = $flatData[index];
          tooltipData = findData(previousValue, currentValue, xValueAtPoint, $x);
          break;
        }

        case 'bisect-y': {
          // `y` value at pointer coordinate
          const yValueAtPoint = scaleInvert($yScale, pointerY - $padding.top);

          const index = bisectY($flatData, yValueAtPoint, 1);
          const previousValue = $flatData[index - 1];
          const currentValue = $flatData[index];
          tooltipData = findData(previousValue, currentValue, yValueAtPoint, $y);
          break;
        }

        case 'bisect-band': {
          // `x` and `y` values at pointer coordinate
          const xValueAtPoint = scaleInvert($xScale, pointerX);
          const yValueAtPoint = scaleInvert($yScale, pointerY);

          if (isScaleBand($xScale)) {
            // Find point closest to pointer within the x band
            const bandData = $flatData
              .filter((d) => $x(d) === xValueAtPoint)
              .sort(sortFunc($y as () => any)); // sort for bisect
            const index = bisectY(bandData, yValueAtPoint, 1);
            const previousValue = bandData[index - 1];
            const currentValue = bandData[index];
            tooltipData = findData(previousValue, currentValue, yValueAtPoint, $y);
          } else if (isScaleBand($yScale)) {
            // Find point closest to pointer within the y band
            const bandData = $flatData
              .filter((d) => $y(d) === yValueAtPoint)
              .sort(sortFunc($x as () => any)); // sort for bisect
            const index = bisectX(bandData, xValueAtPoint, 1);
            const previousValue = bandData[index - 1];
            const currentValue = bandData[index];
            tooltipData = findData(previousValue, currentValue, xValueAtPoint, $x);
          } else {
            // TODO: Support `bisect-band` without band?  Fallback to bisect?
          }
          break;
        }

        case 'quadtree': {
          tooltipData = quadtree.find(pointerX, pointerY, radius);
          break;
        }
      }
    }

    if (tooltipData) {
      if (raiseTarget) {
        raise(e.target as Element);
      }

      $tooltip = {
        ...$tooltip,
        x: pointerX,
        y: pointerY,
        data: tooltipData,
      };
    } else {
      // Hide tooltip if unable to locate
      hideTooltip();
    }
  }

  function hideTooltip() {
    if (locked) {
      // Ignore (keep open)
      return;
    }

    // Wait an event loop tick in case `showTooltip` is called immediately on another element, to allow tweeneing (ex. moving between bands/bars)
    hideTimeoutId = setTimeout(() => {
      $tooltip = { ...$tooltip, data: null };
    });
  }

  let quadtree: Quadtree<[number, number]>;
  $: if (mode === 'quadtree') {
    quadtree = d3Quadtree()
      .extent([
        [0, 0],
        [$width, $height],
      ])
      .x((d) => {
        const value = $xGet(d);

        if (Array.isArray(value)) {
          // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
          // Using first value.  Consider using average, max, etc
          // const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
          // return midpoint;
          return min(value);
        } else {
          return value;
        }
      })
      .y((d) => {
        const value = $yGet(d);

        if (Array.isArray(value)) {
          // `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
          // Using first value.  Consider using average, max, etc
          // const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
          // return midpoint;
          return min(value);
        } else {
          return value;
        }
      })
      .addAll($flatData as [number, number][]);
  }

  let rects: Array<{ x: number; y: number; width: number; height: number; data: any }> = [];
  $: if (mode === 'bounds' || mode === 'band') {
    // @ts-expect-error
    rects = $flatData
      .map((d) => {
        const xValue = $xGet(d);
        const yValue = $yGet(d);

        const x = Array.isArray(xValue) ? xValue[0] : xValue;
        const y = Array.isArray(yValue) ? yValue[0] : yValue;

        const xOffset = isScaleBand($xScale) ? ($xScale.padding() * $xScale.step()) / 2 : 0;
        const yOffset = isScaleBand($yScale) ? ($yScale.padding() * $yScale.step()) / 2 : 0;

        // @ts-expect-error
        const fullWidth = max($xRange) - min($xRange);
        // @ts-expect-error
        const fullHeight = max($yRange) - min($yRange);

        if (mode === 'band') {
          // full band width/height regardless of value
          return {
            x: isScaleBand($xScale) ? x - xOffset : min($xRange),
            y: isScaleBand($yScale) ? y - yOffset : min($yRange),
            width: isScaleBand($xScale) ? $xScale.step() : fullWidth,
            height: isScaleBand($yScale) ? $yScale.step() : fullHeight,
            data: d,
          };
        } else if (mode === 'bounds') {
          return {
            x: isScaleBand($xScale) || Array.isArray(xValue) ? x - xOffset : min($xRange),
            // y: isScaleBand($yScale) || Array.isArray(yValue) ? y - yOffset : min($yRange),
            y: y - yOffset,

            width: Array.isArray(xValue)
              ? xValue[1] - xValue[0]
              : isScaleBand($xScale)
                ? $xScale.step()
                : min($xRange) + x,
            height: Array.isArray(yValue)
              ? yValue[1] - yValue[0]
              : isScaleBand($yScale)
                ? $yScale.step()
                : // @ts-expect-error
                  max($yRange) - y,
            data: d,
          };
        }
      })
      .sort(sortFunc('x'));
  }

  $: triggerPointerEvents = ['bisect-x', 'bisect-y', 'bisect-band', 'quadtree'].includes(mode);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  style:width="{$width}px"
  style:height="{$height}px"
  style:top="{$padding.top}px"
  style:left="{$padding.left}px"
  class={cls(
    'tooltip-trigger absolute touch-none',
    debug && triggerPointerEvents && 'bg-danger/10 outline outline-danger'
  )}
  on:pointerenter={triggerPointerEvents ? showTooltip : undefined}
  on:pointermove={triggerPointerEvents ? showTooltip : undefined}
  on:pointerleave={triggerPointerEvents ? hideTooltip : undefined}
  on:click={(e) => {
    if (triggerPointerEvents) {
      onClick({ data: $tooltip?.data });
    }
  }}
>
  <!-- Rendering slot within tooltip-trigger allows pointer events to bubble up (ex. Brush) -->
  <div
    class="absolute"
    style:width="{$containerWidth}px"
    style:height="{$containerHeight}px"
    style:top="-{$padding.top ?? 0}px"
    style:left="-{$padding.left ?? 0}px"
  >
    <slot tooltip={$tooltip} />

    {#if mode === 'voronoi'}
      <Svg>
        <Voronoi
          on:pointerenter={(e) => {
            showTooltip(e.detail.event, e.detail.data);
          }}
          on:pointermove={(e) => {
            showTooltip(e.detail.event, e.detail.data);
          }}
          on:pointerleave={hideTooltip}
          on:pointerdown={(e) => {
            // @ts-expect-error
            if (e.target?.hasPointerCapture(e.pointerId)) {
              // @ts-expect-error
              e.target.releasePointerCapture(e.pointerId);
            }
          }}
          on:click={(e) => {
            onClick({ data: e.detail.data });
          }}
          classes={{ path: cls(debug && 'fill-danger/10 stroke-danger') }}
        />
      </Svg>
    {:else if mode === 'bounds' || mode === 'band'}
      <Svg>
        <g class="tooltip-rects">
          {#each rects as rect}
            <rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              class={cls(debug ? 'fill-danger/10 stroke-danger' : 'fill-transparent')}
              on:pointerenter={(e) => showTooltip(e, rect.data)}
              on:pointermove={(e) => showTooltip(e, rect.data)}
              on:pointerleave={hideTooltip}
              on:pointerdown={(e) => {
                // @ts-expect-error
                if (e.target?.hasPointerCapture(e.pointerId)) {
                  // @ts-expect-error
                  e.target.releasePointerCapture(e.pointerId);
                }
              }}
              on:click={(e) => {
                onClick({ data: rect.data });
              }}
            />
          {/each}
        </g>
      </Svg>
    {:else if mode === 'quadtree' && debug}
      <Svg pointerEvents={false}>
        <ChartClipPath>
          <g class="tooltip-quadtree">
            {#each quadtreeRects(quadtree, false) as rect}
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                class={cls(debug ? 'fill-danger/10 stroke-danger' : 'fill-transparent')}
              />
            {/each}
          </g>
        </ChartClipPath>
      </Svg>
    {/if}
  </div>
</div>
