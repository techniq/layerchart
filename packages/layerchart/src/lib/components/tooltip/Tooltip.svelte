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
  import { getChartContext, type ChartContextValue } from '$lib/contexts/chart.js';
  import { getTooltipContext } from './TooltipContext.svelte';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { type Snippet } from 'svelte';

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

  let tooltipWidth = $state<number | null>(null);
  let tooltipHeight = $state<number | null>(null);

  function alignValue(value: number, align: Align, additionalOffset: number, tooltipSize: number) {
    const alignOffset = align === 'center' ? tooltipSize / 2 : align === 'end' ? tooltipSize : 0;
    return value + (align === 'end' ? -additionalOffset : additionalOffset) - alignOffset;
  }

  const positions = $derived.by(() => {
    // if no data or tooltip size is not known yet, return null
    if (!tooltipCtx.data || tooltipWidth === null || tooltipHeight === null) {
      return { x: null, y: null };
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

  const motionX = createMotion(null, () => positions.x, motion);
  const motionY = createMotion(null, () => positions.y, motion);

  $effect(() => {
    if (!tooltipCtx.data) {
      tooltipCtx.isHoveringTooltipContent = false;
    }
  });
</script>

{#if tooltipCtx.data}
  <div
    {...props.root}
    class={cls('lc-tooltip-root', classes.root, props.root?.class)}
    class:disablePointerEvents={pointerEvents === false}
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
      class={cls('lc-tooltip-container', classes.container, props.container?.class, className)}
      data-variant={variant}
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
  @layer component {
    :where(.lc-tooltip-root) {
      position: absolute;
      z-index: 50;
      user-select: none;

      &.disablePointerEvents {
        pointer-events: none;
      }
    }

    :where(.lc-tooltip-container) {
      &:not([data-variant='none']) {
        font-size: 0.875rem;
        line-height: 1.25rem;
        padding: 4px 8px;
        height: 100%;
        border-radius: 0.25rem; /* rounded-sm */
        box-shadow: /* elevation-1 */
          0px 2px 1px -1px hsl(0 0% 0% / 20%),
          0px 1px 1px 0px hsl(0 0% 0% / 14%),
          0px 1px 3px 0px hsl(0 0% 0% / 12%);
        /* STYLE-TODO: vendor prefix (-webkit?) */
        backdrop-filter: blur(2px);
      }

      &[data-variant='default'] {
        color: var(--color-surface-content, currentColor);
        background-color: color-mix(
          in oklab,
          light-dark(var(--color-surface-100, white), var(--color-surface-300, black)) 90%,
          transparent
        );

        :global(& .label) {
          color: color-mix(in oklab, var(--color-surface-content, currentColor) 75%, transparent);
        }
      }

      &[data-variant='invert'] {
        color: var(--color-surface-100, light-dark(white, black));
        background-color: color-mix(
          in oklab,
          var(--color-surface-content, currentColor) 90%,
          transparent
        );

        :global(& .label) {
          color: color-mix(
            in oklab,
            var(--color-surface-100, light-dark(white, black)) 50%,
            transparent
          );
        }
      }
    }
  }
</style>
