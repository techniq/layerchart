<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import { setTooltipContext, type TooltipContextValue } from '$lib/contexts/tooltip.js';

  export type TooltipMode =
    | 'bisect-x' // requires values to be sorted
    | 'bisect-y' // requires values to be sorted
    | 'band'
    | 'bisect-band' // requires values to be sorted
    | 'bounds'
    | 'voronoi'
    | 'quadtree'
    | 'quadtree-x' // ignores y values (constant 0)
    | 'quadtree-y' // ignores x values (constant 0)
    | 'manual';

  type TooltipContextPropsWithoutHTML<T = any> = {
    /**
     * The tooltip interaction mode
     * @default 'manual'
     */
    mode?: TooltipMode;

    /**
     * Method to find tooltip data
     * @default 'closest'
     */
    findTooltipData?: 'closest' | 'left' | 'right';

    /**
     * Similar to d3-selection's raise, re-insert the e.target as the last child of its parent, so
     * to be the top-most element
     * @default false
     */
    raiseTarget?: boolean;

    /**
     * Lock tooltip (keep open, do not update on mouse movement). Allows for clicking on tooltip
     * @default false
     */
    locked?: boolean;

    /**
     * Controls the touch event behavior on the tooltip container.
     * By default uses `pan-y` to allow verticle scrolling but horizontal scrubbing.
     * Use `none` to disable all touch events (useful for improved transform/geo charts interactions)
     * @default 'pan-y'
     */
    touchEvents?: 'none' | 'pan-x' | 'pan-y' | 'auto';

    /**
     * quadtree search or voronoi clip radius
     * @default Infinity
     */
    radius?: number;

    /**
     * Enable debug view (show hit targets, etc)
     * @default false
     */
    debug?: boolean;

    /**
     * Click handler for the tooltip
     * @default () => {}
     */
    onclick?: (e: MouseEvent, { data }: { data: any }) => any;

    /**
     * Exposed to allow binding in Chart
     * @default { x: 0, y: 0, data: null, show: showTooltip, hide: hideTooltip, mode }
     */
    tooltipContext?: TooltipContextValue<T>;

    /**
     * Delay in ms before hiding tooltip
     * @default 0
     */
    hideDelay?: number;

    /**
     * A reference to the tooltip container element.
     *
     * @bindable
     */
    ref?: HTMLElement;

    children?: Snippet<[{ tooltipContext: TooltipContextValue<T> }]>;
  };

  export type TooltipContextProps<T = any> = TooltipContextPropsWithoutHTML<T> &
    Without<HTMLAttributes<HTMLElement>, TooltipContextPropsWithoutHTML<T>>;
</script>

<script lang="ts" generics="TData = any">
  import type { Snippet } from 'svelte';
  import { bisector, max, min } from 'd3-array';
  import { quadtree as d3Quadtree, type Quadtree } from 'd3-quadtree';
  import { sortFunc, localPoint } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import Svg from './../layers/Svg.svelte';
  import Arc from '../Arc.svelte';
  import ChartClipPath from './../ChartClipPath.svelte';
  import Voronoi from './../Voronoi.svelte';

  import { isScaleBand, isScaleTime, scaleInvert } from '$lib/utils/scales.svelte.js';
  import { cartesianToPolar } from '$lib/utils/math.js';
  import { quadtreeRects } from '$lib/utils/quadtree.js';
  import { raise } from '$lib/utils/chart.js';
  import {
    getTooltipMetaContext,
    getTooltipPayload,
    type TooltipPayload,
  } from './tooltipMetaContext.js';

  const ctx = getChartContext<any>();
  const geoCtx = getGeoContext();

  let {
    ref: refProp = $bindable(),
    debug = false,
    findTooltipData = 'closest',
    hideDelay = 0,
    locked = false,
    touchEvents = 'pan-y',
    mode = 'manual',
    onclick = () => {},
    radius = Infinity,
    raiseTarget = false,
    tooltipContext: tooltipContextProp = $bindable() as TooltipContextValue<TData>,
    children,
  }: TooltipContextProps<TData> = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  let x = $state(0);
  let y = $state(0);
  let data = $state(null);
  let payload = $state<TooltipPayload[]>([]);

  /**
   * If we're hovering the tooltip area on the chart
   */
  let isHoveringTooltipArea = $state(false);

  /**
   * If we're hovering the tooltip content container
   */
  let isHoveringTooltipContent = $state(false);

  const metaCtx = getTooltipMetaContext();

  const tooltipContext: TooltipContextValue = {
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get data() {
      return data;
    },
    get payload() {
      return payload;
    },
    show: showTooltip,
    hide: hideTooltip,
    get mode() {
      return mode;
    },
    get isHoveringTooltipArea() {
      return isHoveringTooltipArea;
    },
    get isHoveringTooltipContent() {
      return isHoveringTooltipContent;
    },
    set isHoveringTooltipContent(value) {
      isHoveringTooltipContent = value;
    },
  };
  tooltipContextProp = tooltipContext;

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
  setTooltipContext(tooltipContext);

  let hideTimeoutId: ReturnType<typeof setTimeout>;

  const bisectX = bisector((d: any) => {
    const value = ctx.x(d);
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

  const bisectY = bisector((d: any) => {
    const value = ctx.y(d);
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

  function showTooltip(e: PointerEvent | MouseEvent | TouchEvent, tooltipData?: any) {
    // Cancel hiding tooltip if from previous event loop
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }

    if (locked) {
      // Ignore (keep current position / data)
      return;
    }

    const containerNode = (e.target as Element).closest('.lc-root-container')!;
    const point = localPoint(e, containerNode);

    if (
      ref !== undefined &&
      tooltipData == null && // mode !== 'manual' but support annotations
      (point.x < ref.offsetLeft ||
        point.x > ref.offsetLeft + ref.offsetWidth ||
        point.y < ref.offsetTop ||
        point.y > ref.offsetTop + ref.offsetHeight)
    ) {
      // Ignore if within padding of chart
      hideTooltip();
      return;
    }

    // If tooltipData not provided already (voronoi, etc), attempt to find it
    if (tooltipData == null) {
      switch (mode) {
        case 'bisect-x': {
          let xValueAtPoint: any;
          if (ctx.radial) {
            // Assume radial is always centered
            const { radians } = cartesianToPolar(point.x - ctx.width / 2, point.y - ctx.height / 2);
            xValueAtPoint = scaleInvert(ctx.xScale, radians);
          } else {
            xValueAtPoint = scaleInvert(ctx.xScale, point.x - ctx.padding.left);
          }

          // Requires values to be sorted
          const index = bisectX(ctx.flatData, xValueAtPoint, 1);
          const previousValue = ctx.flatData[index - 1];
          const currentValue = ctx.flatData[index];
          tooltipData = findData(previousValue, currentValue, xValueAtPoint, ctx.x);
          break;
        }

        case 'bisect-y': {
          // `y` value at pointer coordinate
          const yValueAtPoint = scaleInvert(ctx.yScale, point.y - ctx.padding.top);

          // Requires values to be sorted
          const index = bisectY(ctx.flatData, yValueAtPoint, 1);
          const previousValue = ctx.flatData[index - 1];
          const currentValue = ctx.flatData[index];
          tooltipData = findData(previousValue, currentValue, yValueAtPoint, ctx.y);
          break;
        }

        case 'bisect-band': {
          // `x` and `y` values at pointer coordinate
          const xValueAtPoint = scaleInvert(ctx.xScale, point.x);
          const yValueAtPoint = scaleInvert(ctx.yScale, point.y);

          if (isScaleBand(ctx.xScale)) {
            // Find point closest to pointer within the x band
            const bandData = ctx.flatData
              .filter((d) => ctx.x(d) === xValueAtPoint)
              .sort(sortFunc(ctx.y as () => any)); // sort for bisect
            // Requires values to be sorted
            const index = bisectY(bandData, yValueAtPoint, 1);
            const previousValue = bandData[index - 1];
            const currentValue = bandData[index];
            tooltipData = findData(previousValue, currentValue, yValueAtPoint, ctx.y);
          } else if (isScaleBand(ctx.yScale)) {
            // Find point closest to pointer within the y band
            const bandData = ctx.flatData
              .filter((d) => ctx.y(d) === yValueAtPoint)
              .sort(sortFunc(ctx.x as () => any)); // sort for bisect
            // Requires values to be sorted
            const index = bisectX(bandData, xValueAtPoint, 1);
            const previousValue = bandData[index - 1];
            const currentValue = bandData[index];
            tooltipData = findData(previousValue, currentValue, xValueAtPoint, ctx.x);
          } else {
            // TODO: Support `bisect-band` without band?  Fallback to bisect?
          }
          break;
        }

        case 'quadtree-x':
        case 'quadtree-y':
        case 'quadtree': {
          tooltipData = quadtree?.find(
            point.x - ctx.padding.left,
            point.y - ctx.padding.top,
            radius
          );
          break;
        }
      }
    }

    if (tooltipData) {
      if (raiseTarget) {
        raise(e.target as Element);
      }

      const payloadData = getTooltipPayload({ ctx, tooltipData, metaCtx });

      x = point.x;
      y = point.y;
      data = tooltipData;
      payload = payloadData;
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

    isHoveringTooltipArea = false;

    // Wait an event loop tick in case `showTooltip` is called immediately on another element,
    // to allow tweening (ex. moving between bands/bars)
    // Additional hideDelay can be configured to extend this delay further
    hideTimeoutId = setTimeout(() => {
      if (!isHoveringTooltipArea && !isHoveringTooltipContent) {
        data = null;
        payload = [];
      }
    }, hideDelay);
  }

  const quadtree: Quadtree<[number, number]> | undefined = $derived.by(() => {
    if (['quadtree', 'quadtree-x', 'quadtree-y'].includes(mode)) {
      return d3Quadtree()
        .x((d) => {
          if (mode === 'quadtree-y') {
            return 0;
          }

          if (geoCtx.projection) {
            const lat = ctx.x(d);
            const long = ctx.y(d);
            const geoValue = geoCtx.projection([lat, long]) ?? [0, 0];
            return geoValue[0];
          }

          const value = ctx.xGet(d);

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
          if (mode === 'quadtree-x') {
            return 0;
          }

          if (geoCtx.projection) {
            const lat = ctx.x(d);
            const long = ctx.y(d);
            const geoValue = geoCtx.projection([lat, long]) ?? [0, 0];
            return geoValue[1];
          }

          const value = ctx.yGet(d);

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
        .addAll(ctx.flatData as [number, number][]);
    }
  });

  const rects: Array<{ x: number; y: number; width: number; height: number; data: any }> =
    $derived.by(() => {
      if (mode === 'bounds' || mode === 'band') {
        return ctx.flatData
          .map((d) => {
            const xValue = ctx.xGet(d);
            const yValue = ctx.yGet(d);

            const x = Array.isArray(xValue) ? xValue[0] : xValue;
            const y = Array.isArray(yValue) ? yValue[0] : yValue;

            const xOffset = isScaleBand(ctx.xScale)
              ? (ctx.xScale.padding() * ctx.xScale.step()) / 2
              : 0;
            const yOffset = isScaleBand(ctx.yScale)
              ? (ctx.yScale.padding() * ctx.yScale.step()) / 2
              : 0;

            const fullWidth = max(ctx.xRange) - min(ctx.xRange);
            const fullHeight = max(ctx.yRange) - min(ctx.yRange);

            if (mode === 'band') {
              if (isScaleBand(ctx.xScale)) {
                // full band width/height regardless of value
                return {
                  x: x - xOffset,
                  y: isScaleBand(ctx.yScale) ? y - yOffset : min(ctx.yRange),
                  width: ctx.xScale.step(),
                  height: isScaleBand(ctx.yScale) ? ctx.yScale.step() : fullHeight,
                  data: d,
                };
              } else if (isScaleBand(ctx.yScale)) {
                return {
                  x: isScaleBand(ctx.xScale) ? x - xOffset : min(ctx.xRange),
                  y: y - yOffset,
                  width: isScaleBand(ctx.xScale) ? ctx.xScale.step() : fullWidth,
                  height: ctx.yScale.step(),
                  data: d,
                };
              } else if (isScaleTime(ctx.xScale)) {
                // Find width to next data point
                const index = ctx.flatData.findIndex(
                  (d2) => Number(ctx.x(d2)) === Number(ctx.x(d))
                );
                const isLastPoint = index + 1 === ctx.flatData.length;
                const nextDataPoint = isLastPoint
                  ? max(ctx.xDomain)
                  : ctx.x(ctx.flatData[index + 1]);

                return {
                  x: x - xOffset,
                  y: isScaleBand(ctx.yScale) ? y - yOffset : min(ctx.yRange),
                  width: (ctx.xScale(nextDataPoint) ?? 0) - (xValue ?? 0),
                  height: isScaleBand(ctx.yScale) ? ctx.yScale.step() : fullHeight,
                  data: d,
                };
              } else if (isScaleTime(ctx.yScale)) {
                // Find height to next data point
                const index = ctx.flatData.findIndex(
                  (d2) => Number(ctx.y(d2)) === Number(ctx.y(d))
                );
                const isLastPoint = index + 1 === ctx.flatData.length;
                const nextDataPoint = isLastPoint
                  ? max(ctx.yDomain)
                  : ctx.y(ctx.flatData[index + 1]);

                return {
                  x: isScaleBand(ctx.xScale) ? x - xOffset : min(ctx.xRange),
                  y: y - yOffset,
                  width: isScaleBand(ctx.xScale) ? ctx.xScale.step() : fullWidth,
                  height: (ctx.yScale(nextDataPoint) ?? 0) - (yValue ?? 0),
                  data: d,
                };
              } else {
                console.warn(
                  '[layerchart] TooltipContext band mode requires at least one scale to be band or time.'
                );
                return undefined;
              }
            } else if (mode === 'bounds') {
              return {
                x: isScaleBand(ctx.xScale) || Array.isArray(xValue) ? x - xOffset : min(ctx.xRange),
                // y: isScaleBand($yScale) || Array.isArray(yValue) ? y - yOffset : min($yRange),
                y: y - yOffset,

                width: Array.isArray(xValue)
                  ? xValue[1] - xValue[0]
                  : isScaleBand(ctx.xScale)
                    ? ctx.xScale.step()
                    : min(ctx.xRange) + x,
                height: Array.isArray(yValue)
                  ? yValue[1] - yValue[0]
                  : isScaleBand(ctx.yScale)
                    ? ctx.yScale.step()
                    : max(ctx.yRange) - y,
                data: d,
              };
            }
          })
          .filter((x) => x !== undefined) // make typescript happy
          .sort(sortFunc('x'));
      }
      return [];
    });

  const triggerPointerEvents = $derived(
    ['bisect-x', 'bisect-y', 'bisect-band', 'quadtree', 'quadtree-x', 'quadtree-y'].includes(mode)
  );

  function onPointerEnter(e: PointerEvent | MouseEvent | TouchEvent) {
    isHoveringTooltipArea = true;
    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }

  function onPointerMove(e: PointerEvent | MouseEvent | TouchEvent) {
    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }

  function onPointerLeave(e: PointerEvent | MouseEvent | TouchEvent) {
    isHoveringTooltipArea = false;
    hideTooltip();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  style:top="{ctx.padding.top}px"
  style:left="{ctx.padding.left}px"
  style:width="{ctx.width}px"
  style:height="{ctx.height}px"
  style:--touch-action={touchEvents}
  class="lc-tooltip-context"
  class:debug={debug && triggerPointerEvents}
  onpointerenter={onPointerEnter}
  onpointermove={onPointerMove}
  onpointerleave={onPointerLeave}
  onclick={(e) => {
    // Ignore clicks without data (triggered from Legend clicks, for example)
    if (triggerPointerEvents && tooltipContext.data != null) {
      onclick(e, { data: tooltipContext.data });
    }
  }}
  onkeydown={() => {}}
  bind:this={ref}
>
  <!-- Rendering slot within TooltipContext to allow pointer events to bubble up (ex. Brush) -->
  <div
    class="lc-tooltip-context-container"
    style:top="-{ctx.padding.top ?? 0}px"
    style:left="-{ctx.padding.left ?? 0}px"
    style:width="{ctx.containerWidth}px"
    style:height="{ctx.containerHeight}px"
  >
    {@render children?.({ tooltipContext: tooltipContext })}

    {#if mode === 'voronoi'}
      <Svg>
        <Voronoi
          r={radius}
          onpointerenter={(e, { data }) => {
            showTooltip(e, data);
          }}
          onpointermove={(e, { data }) => {
            showTooltip(e, data);
          }}
          onpointerleave={() => hideTooltip()}
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
          classes={{ path: cls('lc-tooltip-voronoi-path', debug && 'debug') }}
        />
      </Svg>
    {:else if mode === 'bounds' || mode === 'band'}
      <Svg center={ctx.radial}>
        <g class="lc-tooltip-rects-g">
          {#each rects as rect}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            {#if ctx.radial}
              <Arc
                innerRadius={rect.y}
                outerRadius={rect.y + rect.height}
                startAngle={rect.x}
                endAngle={rect.x + rect.width}
                class={cls('lc-tooltip-rect', debug && 'debug')}
                onpointerenter={(e) => showTooltip(e, rect?.data)}
                onpointermove={(e) => showTooltip(e, rect?.data)}
                onpointerleave={() => hideTooltip()}
                onpointerdown={(e) => {
                  const target = e.target as Element;
                  if (target?.hasPointerCapture(e.pointerId)) {
                    target.releasePointerCapture(e.pointerId);
                  }
                }}
                onclick={(e) => {
                  onclick(e, { data: rect?.data });
                }}
              />
            {:else}
              <rect
                x={rect?.x}
                y={rect?.y}
                width={rect?.width}
                height={rect?.height}
                class={cls('lc-tooltip-rect', debug && 'debug')}
                onpointerenter={(e) => showTooltip(e, rect?.data)}
                onpointermove={(e) => showTooltip(e, rect?.data)}
                onpointerleave={() => hideTooltip()}
                onpointerdown={(e) => {
                  const target = e.target as Element;
                  if (target?.hasPointerCapture(e.pointerId)) {
                    target.releasePointerCapture(e.pointerId);
                  }
                }}
                onclick={(e) => {
                  onclick(e, { data: rect?.data });
                }}
              />
            {/if}
          {/each}
        </g>
      </Svg>
    {:else if ['quadtree', 'quadtree-x', 'quadtree-y'].includes(mode) && debug}
      <Svg pointerEvents={false}>
        <ChartClipPath>
          <g class="lc-tooltip-quadtree-g">
            {#if quadtree}
              {#each quadtreeRects(quadtree, false) as rect}
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  class={cls('lc-tooltip-quadtree-rect', debug && 'debug')}
                />
              {/each}
            {/if}
          </g>
        </ChartClipPath>
      </Svg>
    {/if}
  </div>
</div>

<style>
  @layer component {
    :where(.lc-tooltip-context-container) {
      position: absolute;
    }

    :where(.lc-tooltip-context) {
      position: absolute;
      touch-action: var(--touch-action);

      &.debug {
        outline: 1px solid var(--color-danger);
        background-color: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }

    :global(:where(.lc-tooltip-voronoi-path)) {
      &.debug {
        stroke: var(--color-danger);
        fill: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }

    :where(.lc-tooltip-rect) {
      fill: transparent;

      &.debug {
        stroke: var(--color-danger);
        fill: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }

    :where(.lc-tooltip-quadtree-rect) {
      fill: transparent;

      &.debug {
        stroke: var(--color-danger);
        fill: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }
  }
</style>
