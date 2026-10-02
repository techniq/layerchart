<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { PortalOptions } from '@layerstack/svelte-actions/portal';
  import type { Without } from '$lib/utils/types.js';
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
     * The row to show, instead of the one the chart's pointer resolved.
     *
     * Lets a chart show more than one tooltip at a time, which is what `facetAll` does.
     */
    data?: T;

    /**
     * In a faceted chart, show one tooltip per panel — each labelling *its* row at the hovered
     * position, beside its own point.  Panels with nothing there show nothing.
     *
     * Pairs with `<Highlight facetAll />`, which marks those same rows.
     *
     * @default false
     */
    facetAll?: boolean;
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
     * @default x === 'pointer' ? 10 : 0 (0 when following a finger or pen)
     */
    xOffset?: number;

    /**
     * Offset added to `y` position
     *
     * @default y === 'pointer' ? 10 : 0 (32 when following a finger or pen)
     */
    yOffset?: number;

    /**
     * Align based on edge of tooltip
     *
     * When following a finger or pen, defaults to `'bottom'` (with a larger `yOffset`) so the
     * tooltip sits above it instead of under the hand.  Setting `anchor` opts out of this.
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
     * Duration of the fade in/out transition in milliseconds.
     * Set to `0` to disable the fade transition.
     *
     * @default 100
     */
    fadeDuration?: number;

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
     * Portal the tooltip outside the chart DOM hierarchy to avoid overflow clipping.
     * Pass `true` to portal to `.PortalTarget` or `document.body`, a string CSS selector,
     * an HTMLElement, or `false` to disable.
     *
     * @default true
     */
    portal?: PortalOptions;

    /**
     * Optionally pass the chart's context to the tooltip to get
     * type inference for the data.
     */
    context?: ChartState<T, any, any>;
  };

  export type TooltipProps<T = any> = TooltipPropsWithoutHTML<T> &
    Without<HTMLAttributes<HTMLElement>, TooltipPropsWithoutHTML<T>>;
</script>

<script lang="ts" generics="T = any">
  import { fade } from 'svelte/transition';
  import { createSubscriber } from 'svelte/reactivity';
  import { on } from 'svelte/events';
  import { cls } from '@layerstack/tailwind';
  import { portal as portalAction } from '@layerstack/svelte-actions/portal';

  import { dataCoords } from '$lib/utils/tooltip.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { panelDatum } from '$lib/utils/tooltip.js';
  import type { ChartState } from '$lib/states/chart.svelte.js';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { type Snippet } from 'svelte';

  let {
    anchor: anchorProp,
    classes = {},
    contained = 'container',
    fadeDuration = 100,
    motion = 'spring',
    pointerEvents = false,
    portal: portalProp = true,
    variant = 'default',
    data: dataProp,
    facetAll = false,
    x = 'pointer',
    xOffset: xOffsetProp,
    y = 'pointer',
    yOffset: yOffsetProp,
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

  // Imports itself to render the per-panel copies of `facetAll`
  import Self from './Tooltip.svelte';

  const ctx = getChartContext();

  /**
   * Whether to keep the tooltip clear of a finger or pen it is following.  The default below-right
   * placement puts it under the finger (or pen tip) and the hand behind it, so it moves above
   * instead.  An explicit `anchor` opts out.
   *
   * Driven by the event rather than a `(pointer: coarse)` media query so a touchscreen laptop
   * gets this for a tap and the usual placement for its mouse.
   */
  const avoidPointer = $derived(
    anchorProp === undefined &&
      (ctx.tooltip.pointerType === 'touch' || ctx.tooltip.pointerType === 'pen') &&
      ((x === 'pointer' && y === 'pointer') || facetAll)
  );

  const anchor = $derived<Placement>(anchorProp ?? (avoidPointer ? 'bottom' : 'top-left'));
  const xOffset = $derived(
    xOffsetProp ?? (avoidPointer ? 0 : x === 'pointer' || facetAll ? 10 : 0)
  );
  const yOffset = $derived(
    yOffsetProp ?? (avoidPointer ? 32 : y === 'pointer' || facetAll ? 10 : 0)
  );

  /** The row this tooltip shows — its own when given, else whatever the pointer resolved */
  const tooltipData = $derived(dataProp ?? ctx.tooltip.data);

  let tooltipWidth = $state<number | null>(null);
  let tooltipHeight = $state<number | null>(null);

  function alignValue(value: number, align: Align, additionalOffset: number, tooltipSize: number) {
    const alignOffset = align === 'center' ? tooltipSize / 2 : align === 'end' ? tooltipSize : 0;
    return value + (align === 'end' ? -additionalOffset : additionalOffset) - alignOffset;
  }

  /**
   * Keep a flipped tooltip within `[min, max]`, as flipping to the other side can overflow that
   * side instead (ex. a wide tooltip on a narrow chart).  `min` (the left/top edge) wins when the
   * tooltip doesn't fit either way.
   */
  function clampToEdges(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * `[min, max]` narrowed to the visible `[visibleMin, visibleMax]`, unless the tooltip wouldn't
   * fit in what's left (including when none of it is visible).
   */
  function visibleBounds(
    min: number,
    max: number,
    visibleMin: number,
    visibleMax: number,
    tooltipSize: number
  ) {
    const narrowedMin = Math.max(min, visibleMin);
    const narrowedMax = Math.min(max, visibleMax);
    return narrowedMax - narrowedMin >= tooltipSize ? [narrowedMin, narrowedMax] : [min, max];
  }

  /**
   * The visible part of the page, in the layout viewport coordinates `getBoundingClientRect()`
   * and `position: fixed` use.  Pinch-zoom shrinks and pans this within the layout viewport,
   * which `innerWidth` / `innerHeight` don't reflect, so bounding by those can place the tooltip
   * off screen.
   */
  function getVisibleViewport() {
    const vv = window.visualViewport;
    return vv
      ? {
          left: vv.offsetLeft,
          top: vv.offsetTop,
          right: vv.offsetLeft + vv.width,
          bottom: vv.offsetTop + vv.height,
        }
      : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  }

  const isPortaled = $derived(
    typeof portalProp === 'boolean' ? portalProp : portalProp?.enabled !== false
  );

  /**
   * Makes reading the container's viewport rect reactive to scrolling and resizing.
   *
   * A portaled tooltip is positioned from the chart container's *viewport* rect, and
   * `getBoundingClientRect()` is not reactive — scrolling moves the chart out from under a
   * tooltip that never re-measures.  Pointer-driven tooltips mostly dodge this (scrolling fires
   * `pointercancel`, or a pointer event as content moves under the cursor), but one shown
   * programmatically — keyboard navigation, a chart group, `locked` — has no pointer to cancel it
   * and must follow the chart.
   *
   * `createSubscriber` ties the listeners to whether anything is actually reading: they attach
   * when `positions` starts depending on this and detach when it stops, so an idle chart costs
   * nothing.
   *
   * `capture` is what catches scrolling of any *ancestor* (ex. a dashboard inside a scrolling
   * panel), not just the window — which is also why `scrollY` from `svelte/reactivity/window`
   * isn't enough here, and why runed's `ScrollState` (bound to one element) doesn't fit either.
   *
   * Pinch-zoom only fires `visualViewport` events, not the window's.
   */
  const subscribeToViewport = createSubscriber((update) => {
    const offScroll = on(window, 'scroll', update, { capture: true, passive: true });
    const offResize = on(window, 'resize', update, { passive: true });
    const vv = window.visualViewport;
    const offVisualScroll = vv ? on(vv, 'scroll', update, { passive: true }) : undefined;
    const offVisualResize = vv ? on(vv, 'resize', update, { passive: true }) : undefined;

    return () => {
      offScroll();
      offResize();
      offVisualScroll?.();
      offVisualResize?.();
    };
  });

  const positions = $derived.by(() => {
    // if no data or tooltip size is not known yet, return null
    if (!tooltipData || tooltipWidth === null || tooltipHeight === null) {
      return { x: null, y: null };
    }

    // Only track the viewport while there is a portaled tooltip to keep positioned
    if (isPortaled) subscribeToViewport();

    // When portaled, we need the container's viewport rect to convert coordinates
    const containerRect = isPortaled ? ctx.containerRef?.getBoundingClientRect() : null;
    // If portaled but the container rect is not available yet, bail
    if (isPortaled && !containerRect) {
      return { x: null, y: null };
    }

    const viewport = getVisibleViewport();

    // Container-relative position of the tooltip data, used by the `'data'` placement
    const coords = x === 'data' || y === 'data' ? dataCoords(ctx, tooltipData) : null;

    const xValue: number = typeof x === 'number' ? x : x === 'data' ? coords!.x : ctx.tooltip.x;

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

    const yValue: number = typeof y === 'number' ? y : y === 'data' ? coords!.y : ctx.tooltip.y;

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
      if (isPortaled && containerRect) {
        // Container-relative bounds, narrowed to what is on screen (ex. pinch-zoomed in on part of
        // the chart) when the tooltip fits there.  A chart scrolled out of view (ex. one driven by
        // a chart group) keeps its tooltip beside it rather than pinned to the screen's edge.
        const [minX, maxX] = visibleBounds(
          ctx.padding.left,
          containerRect.width,
          viewport.left - containerRect.left,
          viewport.right - containerRect.left,
          tooltipWidth
        );
        const [minY, maxY] = visibleBounds(
          // Above a finger, rising past the chart beats flipping underneath it, and the portal
          // keeps it from being clipped, so only the viewport limits it
          avoidPointer ? viewport.top - containerRect.top : ctx.padding.top,
          containerRect.height,
          viewport.top - containerRect.top,
          viewport.bottom - containerRect.top,
          tooltipHeight
        );

        if (typeof x !== 'number') {
          if ((xAlign === 'start' || xAlign === 'center') && rect.right > maxX) {
            rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
          }
          if ((xAlign === 'end' || xAlign === 'center') && rect.left < minX) {
            rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
          }
          rect.left = clampToEdges(rect.left, minX, maxX - tooltipWidth);
        }
        rect.right = rect.left + tooltipWidth;

        if (typeof y !== 'number') {
          if ((yAlign === 'start' || yAlign === 'center') && rect.bottom > maxY) {
            rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
          }
          if ((yAlign === 'end' || yAlign === 'center') && rect.top < minY) {
            rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
          }
          rect.top = clampToEdges(rect.top, minY, maxY - tooltipHeight);
        }
        rect.bottom = rect.top + tooltipHeight;
      } else {
        // Original non-portaled container containment
        if (typeof x !== 'number') {
          // Check if outside of container and swap align side accordingly
          if ((xAlign === 'start' || xAlign === 'center') && rect.right > ctx.containerWidth) {
            rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
          }
          if ((xAlign === 'end' || xAlign === 'center') && rect.left < ctx.padding.left) {
            rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
          }
          rect.left = clampToEdges(rect.left, ctx.padding.left, ctx.containerWidth - tooltipWidth);
        }
        rect.right = rect.left + tooltipWidth;

        if (typeof y !== 'number') {
          if ((yAlign === 'start' || yAlign === 'center') && rect.bottom > ctx.containerHeight) {
            rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
          }
          if ((yAlign === 'end' || yAlign === 'center') && rect.top < ctx.padding.top) {
            rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
          }
          rect.top = clampToEdges(rect.top, ctx.padding.top, ctx.containerHeight - tooltipHeight);
        }
        rect.bottom = rect.top + tooltipHeight;
      }
    } else if (contained === 'window') {
      if (isPortaled && containerRect) {
        // Already in viewport coordinates, just clamp to the visible viewport
        if (typeof x !== 'number') {
          if (
            (xAlign === 'start' || xAlign === 'center') &&
            containerRect.left + rect.right > viewport.right
          ) {
            rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
          }
          if (
            (xAlign === 'end' || xAlign === 'center') &&
            containerRect.left + rect.left < viewport.left
          ) {
            rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
          }
          rect.left = clampToEdges(
            rect.left,
            viewport.left - containerRect.left,
            viewport.right - containerRect.left - tooltipWidth
          );
        }
        rect.right = rect.left + tooltipWidth;

        if (typeof y !== 'number') {
          if (
            (yAlign === 'start' || yAlign === 'center') &&
            containerRect.top + rect.bottom > viewport.bottom
          ) {
            rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
          }
          if (
            (yAlign === 'end' || yAlign === 'center') &&
            containerRect.top + rect.top < viewport.top
          ) {
            rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
          }
          rect.top = clampToEdges(
            rect.top,
            viewport.top - containerRect.top,
            viewport.bottom - containerRect.top - tooltipHeight
          );
        }
        rect.bottom = rect.top + tooltipHeight;
      } else {
        // Original non-portaled window containment
        // Root <div> won't be available on initial mount
        if (rootRef?.parentElement) {
          const parentViewportRect = rootRef.parentElement.getBoundingClientRect();

          // Only attempt repositioning if not fixed (ie. `pointer`/`data`)
          if (typeof x !== 'number') {
            if (
              (xAlign === 'start' || xAlign === 'center') &&
              parentViewportRect.left + rect.right > viewport.right
            ) {
              rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
            }
            if (
              (xAlign === 'end' || xAlign === 'center') &&
              parentViewportRect.left + rect.left < viewport.left
            ) {
              rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
            }
            rect.left = clampToEdges(
              rect.left,
              viewport.left - parentViewportRect.left,
              viewport.right - parentViewportRect.left - tooltipWidth
            );
          }
          rect.right = rect.left + tooltipWidth;

          if (typeof y !== 'number') {
            if (
              (yAlign === 'start' || yAlign === 'center') &&
              parentViewportRect.top + rect.bottom > viewport.bottom
            ) {
              rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
            }
            if (
              (yAlign === 'end' || yAlign === 'center') &&
              parentViewportRect.top + rect.top < viewport.top
            ) {
              rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
            }
            rect.top = clampToEdges(
              rect.top,
              viewport.top - parentViewportRect.top,
              viewport.bottom - parentViewportRect.top - tooltipHeight
            );
          }
          rect.bottom = rect.top + tooltipHeight;
        }
      }
    }

    // When portaled, convert from container-relative to viewport-relative coordinates
    const offsetX = isPortaled && containerRect ? containerRect.left : 0;
    const offsetY = isPortaled && containerRect ? containerRect.top : 0;

    return {
      x: rect.left + offsetX,
      y: rect.top + offsetY,
    };
  });

  const motionX = createMotion(null, () => positions.x, motion);
  const motionY = createMotion(null, () => positions.y, motion);

  $effect(() => {
    if (!ctx.tooltip.data) {
      ctx.tooltip.isHoveringTooltipContent = false;
    }
  });
</script>

<!-- `suppressed` keeps the data set (so `Highlight` still renders) while hiding the tooltip
     content — used by chart groups sharing a highlight without tooltips -->
<!--
  `facetAll` renders one of these per panel instead — each with its own row and position, since
  the size and placement below are per-instance state.
-->
{#if facetAll && ctx.facet.enabled && dataProp === undefined}
  {#each ctx.facet.panels as panel (panel.key)}
    {@const row = panelDatum(ctx, panel, ctx.tooltip.data)}
    {#if row}
      <Self
        data={row}
        x={x === 'pointer' ? 'data' : x}
        y={y === 'pointer' ? 'data' : y}
        {anchor}
        {xOffset}
        {yOffset}
        {classes}
        {contained}
        {fadeDuration}
        {motion}
        {pointerEvents}
        portal={portalProp}
        {variant}
        {props}
        class={className}
        {children}
      />
    {/if}
  {/each}
{:else if tooltipData && !ctx.tooltip.suppressed}
  <div
    {...props.root}
    use:portalAction={portalProp}
    class={cls('lc-tooltip-root', classes.root, props.root?.class)}
    class:disablePointerEvents={pointerEvents === false}
    class:portaled={isPortaled}
    style:top="{motionY.current}px"
    style:left="{motionX.current}px"
    transition:fade={{ duration: fadeDuration }}
    bind:clientWidth={tooltipWidth}
    bind:clientHeight={tooltipHeight}
    bind:this={rootRef}
    onpointerenter={() => {
      ctx.tooltip.isHoveringTooltipContent = true;
    }}
    onpointerleave={(e) => {
      ctx.tooltip.isHoveringTooltipContent = false;
      // `TooltipContext` is the only thing that schedules a hide, and its timer has already fired
      // and been blocked by the flag above while the pointer was in here.  Without re-arming it,
      // leaving the tooltip anywhere other than back over the hit area strands it on screen.
      ctx.tooltip.hide(e);
    }}
  >
    <div
      {...props.container}
      class={cls('lc-tooltip-container', classes.container, props.container?.class, className)}
      data-variant={variant}
    >
      {#if children}
        <div {...props.content} class={cls('lc-tooltip-content', classes.content)}>
          {@render children({ data: tooltipData })}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @layer components {
    :where(.lc-tooltip-root) {
      position: absolute;
      z-index: 50;
      user-select: none;

      &.portaled {
        position: fixed;
      }

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
