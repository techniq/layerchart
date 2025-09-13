<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import type { TooltipPayload } from './tooltipMetaContext.js';
  import type { Placement } from '../types.js';

  export type Align = 'start' | 'center' | 'end';

  export type TooltipPropsWithoutHTML<T = any> = {
    /**
     * `x` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an
     * explicit fixed position.
     *
     * @default 'pointer'
     */
    x?: 'pointer' | 'data' | number;
    /**
     * `y` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an
     * explicit fixed position.
     *
     * @default 'pointer'
     */
    y?: 'pointer' | 'data' | number;

    /**
     * Offset added to `x` position
     *
     * @default x === 'pointer' ? 10 : 0
     */
    xOffset?: number;

    /**
     * Offset added to `y` position
     *
     * @default y === 'pointer' ? 10 : 0
     */
    yOffset?: number;

    /**
     * Align based on edge of tooltip
     *
     * @default 'top-left'
     */
    anchor?: Placement;

    /**
     * The default motion state of the tooltip.
     *
     * @default "spring"
     */
    motion?: MotionProp;

    /**
     * Allow pointer events.  Disabled by default to reduce accidental selection, but useful to
     * enable to allow interactive tooltips (using `locked`)
     *
     * @default false
     */
    pointerEvents?: boolean;

    /**
     * Include padding area (ex. axis)
     *
     * @default 'container'
     */
    contained?: 'container' | 'window' | false;

    /**
     * Tooltip variant
     *
     * @default 'default'
     */
    variant?: 'default' | 'invert' | 'none';

    /**
     * Classes to apply to the various elements of the tooltip.
     *
     * @default {}
     */
    classes?: {
      /**
       * Classes to apply to the root tooltip element
       */
      root?: string;
      /**
       * Classes to apply to the tooltip container element
       */
      container?: string;
      /**
       * Classes to apply to the tooltip content element
       */
      content?: string;
      /**
       * Classes to apply to the tooltip header element
       */
      header?: string;
    };

    children?: Snippet<
      [
        {
          /**
           * The chart data that triggered the tooltip.
           */
          data: T;

          /**
           * An array of tooltip payloads, each containing data for a specific series,
           * along with their own `payload` property that contains the same data as `data`.
           *
           * This is useful when working with the simplified charts, such as `AreaChart`, `BarChart`,
           * `PieChart`, etc., where series construction is handled internally.
           */
          payload: TooltipPayload[];
        },
      ]
    >;

    /**
     * A reference to the tooltip's outermost `<div>` tag.
     *
     * @bindable
     */
    rootRef?: HTMLElement;

    /**
     * Props to pass to the underlying elements rendered
     * by the Tooltip component
     */
    props?: {
      /**
       * Props to pass to the root tooltip element
       */
      root?: HTMLAttributes<HTMLElement>;
      /**
       * Props to pass to the tooltip container element
       */
      container?: HTMLAttributes<HTMLElement>;
      /**
       * Props to pass to the tooltip content element
       */
      content?: HTMLAttributes<HTMLElement>;
    };

    /**
     * Optionally pass the chart's context to the tooltip to get
     * type inference for the data.
     */
    context?: ChartContextValue<T, any, any>;
  };

  export type TooltipProps<T = any> = TooltipPropsWithoutHTML<T> &
    Without<HTMLAttributes<HTMLElement>, TooltipPropsWithoutHTML<T>>;
</script>

<script lang="ts" generics="T = any">
  import { fade } from 'svelte/transition';
  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '../../utils/scales.svelte.js';
  import { getChartContext, type ChartContextValue } from '../Chart.svelte';
  import { getTooltipContext } from './TooltipContext.svelte';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { untrack, type Snippet } from 'svelte';

  let {
    anchor = 'top-left',
    classes = {},
    contained = 'container',
    motion = 'spring',
    pointerEvents = false,
    variant = 'default',
    x = 'pointer',
    xOffset = x === 'pointer' ? 10 : 0,
    y = 'pointer',
    yOffset = y === 'pointer' ? 10 : 0,
    children,
    rootRef: rootRefProp = $bindable(),
    props = {
      root: {},
      container: {},
      content: {},
    },
    class: className,
  }: TooltipProps<T> = $props();

  let rootRef = $state<HTMLElement>();
  $effect.pre(() => {
    rootRefProp = rootRef;
  });

  const ctx = getChartContext();
  const tooltipCtx = getTooltipContext();

  let tooltipWidth = $state(0);
  let tooltipHeight = $state(0);

  function alignValue(value: number, align: Align, additionalOffset: number, tooltipSize: number) {
    const alignOffset = align === 'center' ? tooltipSize / 2 : align === 'end' ? tooltipSize : 0;
    return value + (align === 'end' ? -additionalOffset : additionalOffset) - alignOffset;
  }

  const positions = $derived.by(() => {
    if (!tooltipCtx.data) {
      // if no data, fallback?
      const tooltipX = untrack(() => tooltipCtx.x);
      const tooltipY = untrack(() => tooltipCtx.y);
      return { x: tooltipX, y: tooltipY };
    }
    const xBandOffset = isScaleBand(ctx.xScale)
      ? ctx.xScale.step() / 2 - (ctx.xScale.padding() * ctx.xScale.step()) / 2
      : 0;

    const xValue: number =
      typeof x === 'number'
        ? x
        : x === 'data'
          ? ctx.xGet(tooltipCtx.data) + ctx.padding.left + xBandOffset
          : tooltipCtx.x;

    let xAlign: Align = 'start';
    switch (anchor) {
      case 'top-left':
      case 'left':
      case 'bottom-left':
        xAlign = 'start';
        break;

      case 'top':
      case 'center':
      case 'bottom':
        xAlign = 'center';
        break;

      case 'top-right':
      case 'right':
      case 'bottom-right':
        xAlign = 'end';
        break;
    }

    const yBandOffset = isScaleBand(ctx.yScale)
      ? ctx.yScale.step() / 2 - (ctx.yScale.padding() * ctx.yScale.step()) / 2
      : 0;
    const yValue: number =
      typeof y === 'number'
        ? y
        : y === 'data'
          ? ctx.yGet(tooltipCtx.data) + ctx.padding.top + yBandOffset
          : tooltipCtx.y;

    let yAlign: Align = 'start';
    switch (anchor) {
      case 'top-left':
      case 'top':
      case 'top-right':
        yAlign = 'start';
        break;

      case 'left':
      case 'center':
      case 'right':
        yAlign = 'center';
        break;

      case 'bottom-left':
      case 'bottom':
      case 'bottom-right':
        yAlign = 'end';
        break;
    }

    const rect = {
      top: alignValue(yValue, yAlign, yOffset, tooltipHeight),
      left: alignValue(xValue, xAlign, xOffset, tooltipWidth),
      // set below
      bottom: 0,
      right: 0,
    };
    rect.bottom = rect.top + tooltipHeight;
    rect.right = rect.left + tooltipWidth;

    if (contained === 'container') {
      // Only attempt repositioning if not fixed (ie. `pointer`/`data`)
      if (typeof x !== 'number') {
        // Check if outside of container and swap align side accordingly
        if ((xAlign === 'start' || xAlign === 'center') && rect.right > ctx.containerWidth) {
          rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
        }
        if ((xAlign === 'end' || xAlign === 'center') && rect.left < ctx.padding.left) {
          rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
        }
      }
      rect.right = rect.left + tooltipWidth;

      if (typeof y !== 'number') {
        if ((yAlign === 'start' || yAlign === 'center') && rect.bottom > ctx.containerHeight) {
          rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
        }
        if ((yAlign === 'end' || yAlign === 'center') && rect.top < ctx.padding.top) {
          rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
        }
      }
      rect.bottom = rect.top + tooltipHeight;
    } else if (contained === 'window') {
      // Check if outside of window / viewport and swap align side accordingly
      // Root <div> won't be available on initial mount
      if (rootRef?.parentElement) {
        const parentViewportRect = rootRef.parentElement.getBoundingClientRect();

        // Only attempt repositioning if not fixed (ie. `pointer`/`data`)
        if (typeof x !== 'number') {
          if (
            (xAlign === 'start' || xAlign === 'center') &&
            parentViewportRect.left + rect.right > window.innerWidth
          ) {
            rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
          }
          if (
            (xAlign === 'end' || xAlign === 'center') &&
            parentViewportRect.left + rect.left < 0
          ) {
            rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
          }
        }
        rect.right = rect.left + tooltipWidth;

        if (typeof y !== 'number') {
          if (
            (yAlign === 'start' || yAlign === 'center') &&
            parentViewportRect.top + rect.bottom > window.innerHeight
          ) {
            rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
          }
          if ((yAlign === 'end' || yAlign === 'center') && parentViewportRect.top + rect.top < 0) {
            rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
          }
        }
        rect.bottom = rect.top + tooltipHeight;
      }
    }
    return {
      x: rect.left,
      y: rect.top,
    };
  });

  const motionX = createMotion(tooltipCtx.x, () => positions.x, motion);
  const motionY = createMotion(tooltipCtx.y, () => positions.y, motion);

  $effect(() => {
    if (!tooltipCtx.data) {
      tooltipCtx.isHoveringTooltipContent = false;
    }
  });
</script>

{#if tooltipCtx.data}
  <div
    {...props.root}
    class={cls('root', 'lc-tooltip-root', classes.root, props.root?.class)}
    class:pointer-events-none={!pointerEvents}
    style:top="{motionY.current}px"
    style:left="{motionX.current}px"
    transition:fade={{ duration: 100 }}
    bind:clientWidth={tooltipWidth}
    bind:clientHeight={tooltipHeight}
    bind:this={rootRef}
    onpointerenter={() => {
      tooltipCtx.isHoveringTooltipContent = true;
    }}
    onpointerleave={() => {
      tooltipCtx.isHoveringTooltipContent = false;
    }}
  >
    <div
      {...props.container}
      class={cls(
        'lc-tooltip-container',
        variant !== 'none' && ['text-sm py-1 px-2 h-full rounded-sm elevation-1'],
        {
          default: [
            'bg-surface-100/90 dark:bg-surface-300/90 backdrop-filter backdrop-blur-[2px] text-surface-content',
            '[&_.label]:text-surface-content/75',
          ],
          invert: [
            'bg-surface-content/90 backdrop-filter backdrop-blur-[2px] text-surface-100 border border-surface-content',
            '[&_.label]:text-surface-100/50',
          ],
          none: '',
        }[variant],
        classes.container,
        props.container?.class,
        className
      )}
    >
      {#if children}
        <div {...props.content} class={cls('lc-tooltip-content', classes.content)}>
          {@render children({ data: tooltipCtx.data, payload: tooltipCtx.payload })}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .root {
    position: absolute;
    z-index: 50;
    user-select: none;
  }

  .pointer-events-none {
    pointer-events: none;
  }
</style>
