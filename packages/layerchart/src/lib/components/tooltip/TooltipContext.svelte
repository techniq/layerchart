<script lang="ts" module>
  import { Context } from 'runed';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';

  const _TooltipContext = new Context<TooltipContextValue>('TooltipContext');

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
    payload: any[];
    show(e: PointerEvent, tooltipData?: any, payload?: any): void;
    hide(e?: PointerEvent): void;
    mode: TooltipMode;
  };

  const defaultContext = {
    x: 0,
    y: 0,
    data: null as any,
    payload: [],
    show: () => {},
    hide: () => {},
    mode: 'manual',
  } as TooltipContextValue;

  export function getTooltipContext() {
    return _TooltipContext.getOr(defaultContext);
  }

  function setTooltipContext(tooltip: TooltipContextValue) {
    return _TooltipContext.set(tooltip);
  }

  type TooltipContextPropsWithoutHTML = {
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
     * quadtree search radius
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
    tooltipContext?: TooltipContextValue;

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

    children?: Snippet<[{ tooltipContext: TooltipContextValue }]>;
  };

  export type TooltipContextProps = TooltipContextPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, TooltipContextPropsWithoutHTML>;
</script>

<script lang="ts">
  import { bisector, max, min } from 'd3-array';
  import { quadtree as d3Quadtree, type Quadtree } from 'd3-quadtree';
  import { sortFunc, localPoint } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Svg from './../layout/Svg.svelte';
  import ChartClipPath from './../ChartClipPath.svelte';
  import Voronoi from './../Voronoi.svelte';

  import { isScaleBand, scaleInvert } from '$lib/utils/scales.svelte.js';
  import { cartesianToPolar } from '$lib/utils/math.js';
  import { quadtreeRects } from '$lib/utils/quadtree.js';
  import { raise } from '$lib/utils/chart.js';
  import { getChartContext } from '../Chart.svelte';
  import type { Snippet } from 'svelte';
  import { createDataAttr } from '$lib/utils/attributes.js';
  import { getTooltipMetaContext, getTooltipPayload } from './tooltipMetaContext.js';

  const ctx = getChartContext<any>();

  let {
    ref = $bindable(),
    debug = false,
    findTooltipData = 'closest',
    hideDelay = 0,
    locked = false,
    mode = 'manual',
    onclick = () => {},
    radius = Infinity,
    raiseTarget = false,
    tooltipContext: tooltipContextProp = $bindable() as TooltipContextValue,
    children,
  }: TooltipContextProps = $props();

  tooltipContextProp = {
    x: 0,
    y: 0,
    data: null,
    payload: [],
    show: showTooltip,
    hide: hideTooltip,
    mode,
  };

  const metaCtx = getTooltipMetaContext();

  const tooltipContext = {
    get x() {
      return tooltipContextProp!.x;
    },
    get y() {
      return tooltipContextProp!.y;
    },
    get data() {
      return tooltipContextProp!.data;
    },
    get payload() {
      return tooltipContextProp!.payload;
    },
    show: showTooltip,
    hide: hideTooltip,
    get mode() {
      return tooltipContextProp!.mode;
    },
  };

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

  let isHoveringTooltip = false;
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

  function showTooltip(e: PointerEvent, tooltipData?: any) {
    // Cancel hiding tooltip if from previous event loop
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }

    if (locked) {
      // Ignore (keep current position / data)
      return;
    }

    const containerNode = (e.target as Element).closest('[data-lc-root-container]')!;
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
    // TODO: When using bisect-x/y/band, values should be sorted.  Typically they are for `x`, but not `y` (and band depends on if x or y scale)
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

          const index = bisectX(ctx.flatData, xValueAtPoint, 1);
          const previousValue = ctx.flatData[index - 1];
          const currentValue = ctx.flatData[index];
          tooltipData = findData(previousValue, currentValue, xValueAtPoint, ctx.x);
          break;
        }

        case 'bisect-y': {
          // `y` value at pointer coordinate
          const yValueAtPoint = scaleInvert(ctx.yScale, point.y - ctx.padding.top);

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
            const index = bisectY(bandData, yValueAtPoint, 1);
            const previousValue = bandData[index - 1];
            const currentValue = bandData[index];
            tooltipData = findData(previousValue, currentValue, yValueAtPoint, ctx.y);
          } else if (isScaleBand(ctx.yScale)) {
            // Find point closest to pointer within the y band
            const bandData = ctx.flatData
              .filter((d) => ctx.y(d) === yValueAtPoint)
              .sort(sortFunc(ctx.x as () => any)); // sort for bisect
            const index = bisectX(bandData, xValueAtPoint, 1);
            const previousValue = bandData[index - 1];
            const currentValue = bandData[index];
            tooltipData = findData(previousValue, currentValue, xValueAtPoint, ctx.x);
          } else {
            // TODO: Support `bisect-band` without band?  Fallback to bisect?
          }
          break;
        }

        case 'quadtree': {
          tooltipData = quadtree?.find(point.x, point.y, radius);
          break;
        }
      }
    }

    if (tooltipData) {
      if (raiseTarget) {
        raise(e.target as Element);
      }

      const payload = getTooltipPayload({ ctx, tooltipData, metaCtx });

      tooltipContextProp = {
        ...tooltipContextProp,
        x: point.x,
        y: point.y,
        data: tooltipData,
        payload,
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

    // Wait an event loop tick in case `showTooltip` is called immediately on another element,
    // to allow tweening (ex. moving between bands/bars)
    // Additional hideDelay can be configured to extend this delay further
    hideTimeoutId = setTimeout(() => {
      if (!isHoveringTooltip) {
        tooltipContextProp = {
          ...tooltipContextProp,
          data: null,
          payload: [],
        };
      }
    }, hideDelay);
  }

  const quadtree: Quadtree<[number, number]> | undefined = $derived.by(() => {
    if (mode === 'quadtree') {
      return d3Quadtree()
        .extent([
          [0, 0],
          [ctx.width, ctx.height],
        ])
        .x((d) => {
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

  const rects: Array<
    { x: number; y: number; width: number; height: number; data: any } | undefined
  > = $derived.by(() => {
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
            // full band width/height regardless of value
            return {
              x: isScaleBand(ctx.xScale) ? x - xOffset : min(ctx.xRange),
              y: isScaleBand(ctx.yScale) ? y - yOffset : min(ctx.yRange),
              width: isScaleBand(ctx.xScale) ? ctx.xScale.step() : fullWidth,
              height: isScaleBand(ctx.yScale) ? ctx.yScale.step() : fullHeight,
              data: d,
            };
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
        .sort(sortFunc('x'));
    }
    return [];
  });

  const triggerPointerEvents = $derived(
    ['bisect-x', 'bisect-y', 'bisect-band', 'quadtree'].includes(mode)
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  style:top="{ctx.padding.top}px"
  style:left="{ctx.padding.left}px"
  style:width="{ctx.width}px"
  style:height="{ctx.height}px"
  class={cls(
    'TooltipContext absolute touch-none',
    debug && triggerPointerEvents && 'bg-danger/10 outline outline-danger'
  )}
  onpointerenter={(e) => {
    isHoveringTooltip = true;
    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }}
  onpointermove={(e) => {
    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }}
  onpointerleave={(e) => {
    isHoveringTooltip = false;
    hideTooltip();
  }}
  onclick={(e) => {
    // Ignore clicks without data (triggered from Legend clicks, for example)
    if (triggerPointerEvents && tooltipContext.data != null) {
      onclick(e, { data: tooltipContext.data });
    }
  }}
  onkeydown={() => {}}
  {...createDataAttr('tooltip-context')}
  bind:this={ref}
>
  <!-- Rendering slot within TooltipContext to allow pointer events to bubble up (ex. Brush) -->
  <div
    class="absolute"
    style:top="-{ctx.padding.top ?? 0}px"
    style:left="-{ctx.padding.left ?? 0}px"
    style:width="{ctx.containerWidth}px"
    style:height="{ctx.containerHeight}px"
    {...createDataAttr('tooltip-context-container')}
  >
    {@render children?.({ tooltipContext: tooltipContext })}

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
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <rect
              x={rect?.x}
              y={rect?.y}
              width={rect?.width}
              height={rect?.height}
              class={cls(debug ? 'fill-danger/10 stroke-danger' : 'fill-transparent')}
              onpointerenter={(e) => showTooltip(e, rect?.data)}
              onpointermove={(e) => showTooltip(e, rect?.data)}
              onpointerleave={hideTooltip}
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
          {/each}
        </g>
      </Svg>
    {:else if mode === 'quadtree' && debug}
      <Svg pointerEvents={false}>
        <ChartClipPath>
          <g class="tooltip-quadtree">
            {#if quadtree}
              {#each quadtreeRects(quadtree, false) as rect}
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  class={cls(debug ? 'fill-danger/10 stroke-danger' : 'fill-transparent')}
                />
              {/each}
            {/if}
          </g>
        </ChartClipPath>
      </Svg>
    {/if}
  </div>
</div>
