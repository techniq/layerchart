<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import type { Readable } from 'svelte/store';

  export const tooltipContextKey = Symbol();

  type TooltipMode =
    | 'bisect-x'
    | 'bisect-y'
    | 'band'
    | 'bisect-band'
    | 'bounds'
    | 'voronoi'
    | 'quadtree'
    | 'manual';

  export type TooltipContextValue = {
    x: number;
    y: number;
    data: any;
    show(e: PointerEvent, tooltipData?: any): void;
    hide(e?: PointerEvent): void;
    mode: TooltipMode;
  };

  export type TooltipContext = Readable<TooltipContextValue>;

  const defaultContext: TooltipContext = writable({
    x: 0,
    y: 0,
    data: null as any,
    show: () => {},
    hide: () => {},
    mode: 'manual',
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
  import { sortFunc, localPoint } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Svg from './../layout/Svg.svelte';
  import { chartContext } from './../ChartContext.svelte';
  import ChartClipPath from './../ChartClipPath.svelte';
  import Voronoi from './../Voronoi.svelte';

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
  export let mode: TooltipMode = 'manual';
  /**
   * @type {'closest' | 'left' | 'right'}
   */
  export let findTooltipData: 'closest' | 'left' | 'right' = 'closest';

  /** Similar to d3-selection's raise, re-insert the e.target as the last child of its parent, so to be the top-most element */
  export let raiseTarget = false;

  /** Lock tooltip (keep open, do not update on mouse movement).  Allows for clicking on tooltip */
  export let locked = false;

  /** quadtree search radius
   * @type {number}
   */
  export let radius: number = Infinity;
  /** Enable debug view (show hit targets, etc) */
  export let debug = false;

  export let onclick: (e: MouseEvent, { data }: { data: any }) => any = () => {};

  /** Exposed to allow binding in Chart */
  export let tooltip = writable({
    x: 0,
    y: 0,
    data: null as any,
    show: showTooltip,
    hide: hideTooltip,
    mode,
  });
  setTooltipContext(tooltip);

  /** Delay in ms before hiding tooltip */
  export let hideDelay = 0;

  let isHoveringTooltip = false;
  let hideTimeoutId: NodeJS.Timeout;
  let tooltipContextNode: HTMLDivElement;

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
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }

    if (locked) {
      // Ignore (keep current position / data)
      return;
    }

    const containerNode = (e.target as Element).closest('.layercake-container')!;
    const point = localPoint(e, containerNode);

    if (
      tooltipData == null && // mode !== 'manual' but support annotations
      (point.x < tooltipContextNode.offsetLeft ||
        point.x > tooltipContextNode.offsetLeft + tooltipContextNode.offsetWidth ||
        point.y < tooltipContextNode.offsetTop ||
        point.y > tooltipContextNode.offsetTop + tooltipContextNode.offsetHeight)
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
            const { radians } = cartesianToPolar(point.x - $width / 2, point.y - $height / 2);
            xValueAtPoint = scaleInvert($xScale, radians);
          } else {
            xValueAtPoint = scaleInvert($xScale, point.x - $padding.left);
          }

          const index = bisectX($flatData, xValueAtPoint, 1);
          const previousValue = $flatData[index - 1];
          const currentValue = $flatData[index];
          tooltipData = findData(previousValue, currentValue, xValueAtPoint, $x);
          break;
        }

        case 'bisect-y': {
          // `y` value at pointer coordinate
          const yValueAtPoint = scaleInvert($yScale, point.y - $padding.top);

          const index = bisectY($flatData, yValueAtPoint, 1);
          const previousValue = $flatData[index - 1];
          const currentValue = $flatData[index];
          tooltipData = findData(previousValue, currentValue, yValueAtPoint, $y);
          break;
        }

        case 'bisect-band': {
          // `x` and `y` values at pointer coordinate
          const xValueAtPoint = scaleInvert($xScale, point.x);
          const yValueAtPoint = scaleInvert($yScale, point.y);

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
          tooltipData = quadtree.find(point.x, point.y, radius);
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
        x: point.x,
        y: point.y,
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
    // Additional hideDelay can be configured to extend this delay further
    hideTimeoutId = setTimeout(() => {
      if (!isHoveringTooltip) {
        $tooltip = { ...$tooltip, data: null };
      }
    }, hideDelay);
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
  style:top="{$padding.top}px"
  style:left="{$padding.left}px"
  style:width="{$width}px"
  style:height="{$height}px"
  class={cls(
    'TooltipContext absolute touch-none',
    debug && triggerPointerEvents && 'bg-danger/10 outline outline-danger'
  )}
  on:pointerenter={(e) => {
    isHoveringTooltip = true;
    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }}
  on:pointermove={(e) => {
    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }}
  on:pointerleave={(e) => {
    isHoveringTooltip = false;
    hideTooltip();
  }}
  on:click={(e) => {
    // Ignore clicks without data (triggered from Legend clicks, for example)
    if (triggerPointerEvents && $tooltip?.data != null) {
      onclick(e, { data: $tooltip?.data });
    }
  }}
  bind:this={tooltipContextNode}
>
  <!-- Rendering slot within TooltipContext to allow pointer events to bubble up (ex. Brush) -->
  <div
    class="absolute"
    style:top="-{$padding.top ?? 0}px"
    style:left="-{$padding.left ?? 0}px"
    style:width="{$containerWidth}px"
    style:height="{$containerHeight}px"
  >
    <slot tooltip={$tooltip} />

    {#if mode === 'voronoi'}
      <Svg>
        <Voronoi
          onpointerenter={(e, { data }) => {
            showTooltip(e, data);
          }}
          onpointermove={(e, { data }) => {
            showTooltip(e, data);
          }}
          onpointerleave={hideTooltip}
          onpointerdown={(e) => {
            // @ts-expect-error
            if (e.target?.hasPointerCapture(e.pointerId)) {
              // @ts-expect-error
              e.target.releasePointerCapture(e.pointerId);
            }
          }}
          onclick={(e, { data }) => {
            onclick(e, { data });
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
                onclick(e, { data: rect.data });
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
